---
title: 'Shipping a second brand: what it actually took to make Cityroam multi-brand'
description: 'Adding NAVEE scooter support meant reverse-engineering an encrypted challenge-response handshake with no SDK and no documentation, and a real device abstraction underneath it. Here is what the protocol turned out to be, and the one inverted assumption that made an early draft loop forever.'
pubDate: 'Sep 06 2026'
updatedDate: 'Sep 16 2026'
heroImage: '/blog/cityroam-board-settings.jpg'
---

Cityroam was, for most of its life, a Tynee-shaped app: one board, one protocol, one implicit user. That was fine while it was a project to understand my own ride on my own board. Then a friend wanted his scooter, a NAVEE V40i Pro, to work the same way, and "add a second device" stopped being hypothetical.

It works now. The scooter pairs, authenticates, streams telemetry, and takes commands: ride mode, energy recovery, lock, cruise control, and the lights all work from the same app, on the same trip recorder, dashboard, widget and notifications the board already used. This post is about what was in the way, because almost none of it was the part I expected.

> **An earlier version of this post argued the opposite**: that multi-brand support was deliberately *not* being built yet, until two prerequisites landed first. That was true when it was written, and the sequencing argument still holds: the abstraction went in before the second brand, not after. But the work has since shipped and is verified working on real hardware, so the post has been rewritten to describe what happened rather than what was planned.

## There was no SDK to remove this time

Tuya, the platform Tynee's OEM builds on, publishes a real, documented Android SDK. [Deleting it](/blog/cityroam-tuya-free) and replacing it with a from-scratch Kotlin GATT client was its own piece of work, but it started from something documented.

NAVEE, whose scooters are built by an OEM called Brightway Innovation Intelligent Technology, has no equivalent at all. Their app talks to the scooter over a proprietary, undocumented BLE protocol and to their own backend over a REST API with no public docs, no third-party API keys, and no published SDK. There was no vendor SDK to remove here, because there was never one to begin with. This was a raw reverse-engineering problem from the first line.

## The head start, and its one poisoned detail

A small open-source group called [`scooterteam`](https://github.com/scooterteam) reverse-engineers Brightway-built scooters, and their MIT-licensed `navee-st3-pro` repository documents a sibling model: the frame format, an AES-128-ECB authentication scheme, and a command table covering lock, cruise control, lights, speed limits and telemetry.

That reference saved me a lot of time, and it also contained the one detail that cost the most.

Their `NaveeAuth.kt` **decrypts** the challenge the scooter sends. The official NAVEE app, decompiled, does not: its crypto helper initialises the cipher with `Cipher.ENCRYPT_MODE`. It **encrypts** the challenge and sends the ciphertext back.

Get that backwards and the handshake fails in the least informative way possible. The scooter stops answering, the link drops, and the app reconnects and does it again, forever.

## What the handshake actually is

Once the official app's real sequence was mapped out, it turned out to be rigid, and every step matters:

1. Request an MTU of 148.
2. Wait, then enable notifications on the notify characteristic.
3. Wait, then write a `0x30` auth frame.
4. The scooter answers `0x30` with a 16-byte challenge. The app answers `0x31` with that challenge **AES-128-ECB encrypted** under the key it named. The scooter answers `0x31` with status 0. The app re-sends `0x30`; the scooter answers `0x30`, status 0, no challenge, and that means authenticated.
5. The app sets the scooter's clock, then runs normally. The scooter pushes telemetry continuously, and the app treats a 7-second gap in that stream as a dead link.

An early draft stopped at step 2 and never authenticated at all. On top of that it read the standard Battery Level and Device Name characteristics, which the official app never touches. That turns out to matter: reading an encrypted characteristic makes Android start bonding, and a peripheral that isn't expecting a bonding request answers by dropping the connection.

So there were two independent causes of the same symptom, and a reconnect loop on top eagerly hiding both. The fix wasn't clever. It was reading what the official app does, in order, then doing that and nothing more.

## The part that was really an architecture problem

The protocol was the visible work. The structural work was making a second brand not turn the app into a pile of conditionals.

What went in first was a device-profile abstraction: one interface covering connect, read telemetry, read and write settings, and compute range and efficiency. The existing Tynee implementation was refactored onto it with no behaviour change, and NAVEE arrived as a second implementation rather than a branch inside the first.

The payoff is that only two things are per-brand: the BLE protocol module and the account API. Everything above that runs unchanged on either device: the session layer, the trip recorder, the native ride journal, the dashboard, the home-screen widget, notifications. A scooter records a trip through exactly the same code path a board does.

That sequencing was deliberate and it was the right call. Bolting a `NaveeProfile` onto code that hardcoded assumptions about one board would have worked in the narrow sense of making a second device connect, and it would have meant doing the whole thing again properly later.

## Where the second brand turned out easier

Not everything about a second brand is more work. NAVEE's telemetry pushes expose total and trip mileage directly and continuously. Tynee's board never reliably exposed a live mileage figure, which is why the odometer logic carries a trip-history-anchored fallback. The scooter will just tell you how far it's gone, so that fallback drops back to being an offline backstop instead of the main path.

What didn't carry over was the efficiency model. Tynee's per-mode profile is built around that board's specific ESC modes; the scooter needed its own, fitted from how its modes and speed limits actually behave. Copying numbers tuned for different hardware would have produced confident, wrong range estimates, which is worse than none at all.

## What I'd take from it

Two things.

The first is that a good reference implementation is still a claim to be checked, not a fact. `scooterteam`'s work saved a great deal of time and contained one inverted assumption that cost a chunk of it back. What settled it wasn't reasoning about which made more sense. It was decompiling the official app and reading which mode the cipher was initialised in.

The second is that the abstraction earned its place by going in *before* the second device, not after. It's the least visible part of this work and the only reason the interesting part stayed small.
