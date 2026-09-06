---
title: 'Deleting the Tuya SDK: reimplementing a proprietary BLE protocol from scratch'
description: 'How Turbo went from wrapping Tuya''s Direct BLE SDK to a from-scratch Kotlin GATT client with no SDK, no cloud dependency, and no ongoing Tuya requirement at all, and what it actually took to get the frame format, encryption, and handshake right.'
pubDate: 'Sep 06 2026'
heroImage: '/blog/turbo-tuya-settings.jpg'
---

Earlier posts about Turbo describe it using "Direct BLE, the Tuya SDK's local Bluetooth path" to talk to the board without round-tripping through Tuya's cloud. That was true, and it was also not the end of the story. The app doesn't link the Tuya SDK at all anymore. `grep -ri thingclips mobile/` in the app's source returns nothing. What replaced it is a from-scratch Kotlin implementation of the board's actual wire protocol, reverse-engineered and reimplemented one opcode at a time.

<figure>
  <img src="/blog/turbo-tuya-settings.jpg" alt="Turbo settings hub with tiles for board connection, ride tracking, and appearance" />
  <figcaption>Board connection is one settings tile now, no SDK, no ongoing account requirement to ride</figcaption>
</figure>

## Why the SDK path was never the end goal

Tuya's Direct BLE SDK is a real improvement over routing every read through Tuya's cloud, it does talk to the board directly over Bluetooth. But it's still an SDK: a dependency on Tuya's Android library, its own binding and pairing model, and a design that (in the SDK's own flow) steals the device's Tuya-app binding rather than sharing it. Good enough to ship, not good enough to stop there. The actual goal, written down before any of the implementation work started, was blunt: ship a build with **no Tuya SDK in the APK, no Tuya developer account, and no Tuya subscription**, while the board stays paired in the official Tuya Smart app the whole time, since that's the app Tynee tells customers to use for firmware updates and warranty support.

## Step one: read the reference instead of guessing

Nothing about this board's protocol is published anywhere by Tuya or by Tynee. The starting point was `ha-tuya-ble`, an MIT-licensed Python implementation Home Assistant depends on for its own Tuya BLE integration, read directly rather than assumed. From it came the actual wire format:

- **Frame**: `seq_num(4) | response_to(4) | code(2) | length(2) | data | crc16(2)`, zero-padded to a 16-byte multiple, checksummed with CRC-16/MODBUS.
- **Encryption**: AES-128-CBC with a random IV, sent as `security_flag(1) | iv(16) | ciphertext`.
- **Fragmentation**: chunked to fit 20-byte GATT writes, each fragment carrying a varint packet number, fragment zero also carrying the total length.
- **Key derivation**: two variants (a "v2" using `local_key + sec_key`, a "v3" using just the first six characters of `local_key`), the session key derived by hashing that material together with six bytes of device-supplied randomness.

None of that was trusted blind. Before writing a line of production Kotlin, a fixed key and IV were fed through the real Python reference and the expected byte-for-byte output committed as a test fixture, so the Kotlin implementation had something concrete to match against rather than "it looks right."

## What the reference didn't tell you: the parts only real hardware reveals

A written protocol spec and a board that actually answers your writes are two different problems, and most of the hard-won detail in the project's protocol document is about the second one:

- **Subscribing to notifications needs an explicit CCCD descriptor write.** Enabling notifications on the characteristic alone silently yields nothing, no error, just no data, ever.
- **The board doesn't reassemble a frame split across multiple GATT writes below its negotiated MTU.** A 36-byte write sent in one shot worked instantly; the identical payload split into 20 and 17 bytes was silently ignored. MTU gets negotiated up to 247, but the safe floor before negotiation completes is still the standard 20-byte chunk, not a number picked to look efficient.
- **Exactly one GATT operation in flight at a time**, serialized through a queue where each operation only completes on its own callback. Android's BLE stack corrupts state under concurrent operations on a single connection; this is the actual root cause the *old* SDK-based command queue was itself working around, so the constraint didn't go away with the SDK, it just moved into code that owns it directly now.
- **Reconnect backoff caps at 300 seconds, not 30.** An earlier version scanned every 30 seconds all night for a board that was simply parked at home overnight, burning battery for no reason.
- **A dropped GATT connection has to close before a reconnect is scheduled, and a replaced client has to close its old connection synchronously first.** Two live GATT sessions racing for the same board's attention means neither handshake ever finishes, because the board can't tell the two centrals apart, and this failure mode reads as a mysterious `GATT_ERROR 133` rather than an obvious cause.

Board firmware answers the wrong opcode by silently dropping the frame, never with an error. That single fact is why the project's living protocol document opens with a warning to future readers: if a change here looks like it should be simpler, one code path instead of two, a fixed value instead of something negotiated, assume it was already tried and broke on real hardware.

## The one place Tuya's servers are still involved, briefly, once

Getting the board's `localKey` (and, depending on which derivation it accepts, `secKey`) still means asking Tuya, because that key material is generated at binding time and never printed anywhere a user could type it in by hand. So the onboarding flow signs into the user's existing Tuya account through Tuya's undocumented mobile API, the same HMAC-signed, AES-GCM-encrypted API that Home Assistant's own integration depends on, fetches the device list and its keys once, and never calls Tuya again. No binding or unbinding happens, so the board never leaves the Tuya Smart app's control. From that point forward the phone talks to the board directly, works in airplane mode, and has no path back to Tuya's servers at all.

<figure>
  <img src="/blog/turbo-tuya-board-settings.jpg" alt="Turbo board settings screen with quick controls for lock, light, and per-mode speed and acceleration curves" />
  <figcaption>Every one of these writes now goes phone-to-board only, verified against real hardware after the SDK was gone</figcaption>
</figure>

Social sign-in (Google, Apple, Facebook) turned out to be a dead end worth writing down rather than quietly dropping: Tuya's own mobile client routes it through `thing.m.user.third.login`, a partner identity-federation endpoint gated by a commercial agreement Tuya has with specific companies, not a route a third-party app can use regardless of how much code gets written against it. Email-and-password login covers every account anyway, including ones originally created via a social button, since Tuya's own support flow requires adding an email and password to any account that didn't start with one. That's a case where the right amount of engineering effort was zero, once the actual constraint was understood.

## What this bought, concretely

- **No Tuya SDK, no Tuya Maven dependency, no Tuya manifest keys**, confirmed by grepping the entire mobile source tree for the SDK's own class prefix and finding nothing.
- **Airplane mode works.** Not as a fallback path, as the normal path, since there was never a cloud call in the live telemetry loop to begin with.
- **The manufacturer's own app keeps working.** Nothing about this reads or writes the board's binding state, so a user can still open Tuya Smart for firmware updates without anything breaking on either side.
- **One less external dependency that can break the app on a schedule outside anyone's control.** An SDK update, a Tuya account policy change, a subscription tier change, none of those can silently stop the board from connecting anymore, because there's no SDK left to be affected by any of them.

## Why this was worth the reverse-engineering effort

The honest version of this story isn't "the SDK was slow" or "the SDK was expensive," it wasn't, particularly. It's that depending on someone else's cloud account and someone else's SDK for a feature this central to the app means the app's most important capability, actually talking to your own board, was never fully under its own control. Reimplementing the protocol directly means every wire-level fact about how this board talks is now something the project actually knows, tested against a fixture, verified against real hardware, and owned end to end, not licensed.
