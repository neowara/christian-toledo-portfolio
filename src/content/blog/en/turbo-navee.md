---
title: 'Planning a second board brand: what it takes to make Turbo actually multi-brand'
description: 'Why adding Navee scooter support to Turbo is a real architecture change, not a driver plug-in, what a third party already reverse-engineered for a sibling model, and why the app deliberately hasn''t started building it yet.'
pubDate: 'Sep 06 2026'
heroImage: '/blog/turbo-navee-logo.png'
---

Turbo has, so far, been a Tynee-shaped app: one board, one protocol, one implicit user. That's been fine because it started as a project to understand my own ride on my own board. But a teammate joining to build support for his own scooter, a Navee V40i Pro, turned "add a second device" from a hypothetical into a real question, and the honest answer turned out to be "not yet, and not the way you'd think."

## There's no Navee SDK to wrap

Tuya (the platform Tynee's OEM builds on) publishes a real, documented Android SDK that any developer can link against with the right credentials, that's what [Turbo's own board-ble module](/blog/turbo-tuya-free) replaced with a homegrown implementation. Navee, whose boards are actually built by an OEM called Brightway Innovation Intelligent Technology, has no equivalent at all. Their own app talks to the scooter over a proprietary, undocumented BLE protocol and to their own backend over a plain REST API with no public docs, no third-party API keys, and no published SDK. There's no vendor SDK to remove here, because there was never one to begin with, this is a raw reverse-engineering problem from the start rather than an SDK-wrapping one.

## The head start: someone already did the hard part, for a different model

A small open-source group called [`scooterteam`](https://github.com/scooterteam) reverse-engineers Brightway-built scooters, and their `navee-st3-pro` repository (MIT-licensed) is a full archive for a sibling Navee model: a working Kotlin/Jetpack Compose app that pairs, authenticates, reads telemetry, and sends commands with no Navee SDK involved, plus a written protocol document decoded from decompiling the real Navee APK and from live Bluetooth captures.

The protocol shape it documents: a `[55 AA] [flag] [cmd] [len] [data] [checksum] [FE FD]` frame, AES-128-ECB authentication using one of five keys baked into the APK, and a command table covering lock, cruise control, lights, speed limits, and telemetry reads. None of those exact values are confirmed for the V40i Pro, Navee and Xiaomi both sell scooters built by the same OEM across many models and PIDs sharing one Android app, so the protocol's *shape* is very likely shared while the specific GATT UUIDs, AES keys, and command byte values are not guaranteed to match. A first read-only pass against a real V40i Pro has already confirmed the GATT service and characteristic UUIDs live, differing from the ST3 Pro reference exactly the way that prediction expected, everything past that (the actual frame format, the AES key set, the command table) is still unverified, because nothing has written to the scooter yet.

## Why firmware updates probably can't break this out from under us

One thing worth being confident about, and worth explaining why: the scooter has no WiFi or cellular radio of its own, its only connectivity is Bluetooth to a phone. The official Navee app pushes firmware updates over that same BLE link as an app-initiated transfer, the scooter never polls for one on its own. So as long as the official Navee app is never paired to the scooter again once a homegrown integration takes over, there's no channel left for the firmware, or the AES keys and command set it enforces, to change underneath the integration. That's a structural argument, not a hopeful guess, and it's the kind of thing worth verifying rather than assuming, but the mechanism itself is sound.

## Why this isn't being built yet, on purpose

The tempting shortcut is a `NaveeScooterProfile` bolted onto whatever code path already exists for the Tynee board. That would work in the narrow sense of making a second device connect, and it would also mean redoing the work properly the moment two real prerequisites land that the app doesn't have yet:

1. **Real per-device support.** Today's app hardcodes assumptions about one board throughout the codebase, `boardLink.ts`, the board-config screen, the odometer estimation logic. Adding a second brand on top of that foundation means every one of those assumptions gets revisited twice, once now and once properly later.
2. **Real per-user accounts**, so device ownership and settings are actually scoped per person rather than implicit.

Both are already tracked as their own epics, and multi-brand support is deliberately gated behind them finishing first. The actual architecture change once those land is a `DeviceProfile` abstraction: one interface (connect, read telemetry, read and write settings, compute range and efficiency) that a `TuyaBoardProfile` (a refactor of what already exists, no behavior change) and a new `NaveeScooterProfile` both implement. That's what turns "universal ride computer" from a slogan into something actually true, instead of a Tynee-shaped app with a Navee branch wedged into it.

## Where Navee's protocol will genuinely simplify things, once it's built

Not everything about a second brand is more work. Navee's own telemetry pushes (`0x70`/`0x76`/`0x90`/`0x92` in `scooterteam`'s documented command table) expose total and trip mileage directly and continuously over BLE. Tynee's board never reliably exposed a live mileage figure, which is why Turbo's odometer logic carries a trip-history-anchor fallback for it today. A Navee integration likely doesn't need that fallback as its primary path at all, only as a genuine offline backstop, because the scooter itself is willing to just say how far it's gone.

What won't carry over directly is the efficiency and range model: Tynee's per-mode efficiency profile is hand-built around that specific board's Hobbywing ESC modes, and a Navee equivalent needs its own profile built from how the V40i Pro's own modes and speed limits actually behave, not a copy of numbers tuned for different hardware.

## The plan, honestly

This is a case where the interesting engineering decision was choosing *not* to start yet. The reverse-engineering path is credible, a real precedent exists, a first hardware pass already confirmed part of it, and the risk (firmware silently changing the protocol) has a structural reason to be low. But building a second brand on a foundation that still assumes one board and one user would mean two rewrites instead of one. Sequencing the work, foundations first, second brand second, is the same discipline behind every other post on this blog: the fast way and the right way aren't the same thing here, and it's worth saying so before writing the code, not after.
