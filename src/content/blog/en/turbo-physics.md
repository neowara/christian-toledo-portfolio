---
title: 'The physics behind a range estimate: fitting Crr, drag, and drivetrain loss to your own rides'
description: 'How the Turbo backend goes from a textbook power equation sourced from real engineering references to a per-rider, per-mode regression fit, why descent gets no regen credit, and what happens to the model below 20% battery.'
pubDate: 'Sep 06 2026'
heroImage: '/blog/turbo-physics-activity.jpg'
---

I've written before about why Turbo's range estimate needed real physics instead of a flat km-per-percent number. This is the part I skipped over there: what that physics model actually is, where its constants came from, and how it goes from a textbook equation to a number fitted specifically to how *you* ride.

<figure>
  <img src="/blog/turbo-physics-activity.jpg" alt="Turbo activity screen with weekly ride distance and efficiency trends" />
  <figcaption>The activity view this model ultimately feeds: real trend lines, not a static spec-sheet number</figcaption>
</figure>

## The equation, and where every constant in it came from

The backend's power model is one line, the same one any serious cycling or e-bike power calculator uses:

```
P = (Crr·m·g·cos(θ) + m·g·sin(θ) + ½·ρ·CdA·v_rel²) · v / η
```

Rolling resistance, grade, and aerodynamic drag, summed, multiplied by speed, divided by drivetrain efficiency. None of the four constants (`Crr`, `CdA`, `η`, `ρ`) were picked by feel. Before writing a line of `physics.py`, I traced each one to a primary source: Grin Technologies' motor simulator and battery-tech pages, the Kreuzotter speed-and-power calculator, and manufacturer spec pages for boards like the Tynee Explorer Pro and Meepo Voyager, cross-checking their advertised watt-hour figures against cell chemistry to confirm the numbers were internally consistent (a 14S4P pack of Samsung 50S cells at 3.6V nominal really does work out to 1008 Wh, which is exactly what Tynee's product page claims).

That gave defaults: `Crr = 0.0135`, `CdA = 0.6 m²`, `η = 0.875`, right in the middle of the documented ranges for small-wheeled electric vehicles. Those are what a brand-new device gets before it has any ride history at all. They're a starting point, not the interesting part.

## Regression, not a lookup table

Once a device has at least 15 completed trips in a given ride mode, `calibration.py` stops guessing and fits `Crr`, `CdA`, and `η` from that rider's actual data via ordinary least squares:

```
E_wh = a·(distance·weight) + b·(Σ v_rel²·distance) + c·(climb·weight)
```

where `a = Crr·g/η`, `b = 0.5·ρ·CdA/η`, and `c = g/η`. Solve the 3×3 normal equations (hand-rolled Cramer's rule, since this project deliberately carries no NumPy dependency for one call site) and the three physical constants fall out algebraically. Every trip that feeds the regression needs a real recorded weight, route, and battery-percent-used; a trip missing any of those gets excluded outright rather than backfilled with an assumption, because in a model where every term is weight-scaled, a guessed weight would quietly corrupt all three fitted constants at once, not just one.

The fitted numbers still get clamped to the literature's plausible bounds (`Crr` 0.005–0.05, `CdA` 0.2–1.2, `η` 0.5–0.98), so a noisy fit from a short, weird stretch of rides can't produce a physically absurd constant that makes every future estimate worse than the textbook default it replaced.

## The rule that took the most thought: no regen credit for going downhill

`climb_energy_wh()` only ever receives a non-negative climbed-meters figure. A descent doesn't subtract energy from the model, even though gravity is doing real work on the way down. That's deliberate: these boards free-wheel downhill rather than regenerating charge, so crediting a descent would make the model claim range the battery can't actually deliver. It's a small rule, one `if climb_m <= 0: return 0.0`, but it's the difference between a model that's honest about the hardware and one that's optimistic about it.

<figure>
  <img src="/blog/turbo-tuya-board-settings.jpg" alt="Turbo board settings screen with quick controls and per-mode acceleration and braking curves" />
  <figcaption>Per-mode settings read straight from the board, the same modes the physics profile is fitted separately for</figcaption>
</figure>

## Motor watts are marketing, not a physics bound

One finding from the sourcing pass changed how the model treats a spec field it already had: `motorPowerW`. The obvious instinct is to use a board's advertised motor wattage as a hard ceiling on how much mechanical power the fitted `η` can imply. Grin Technologies is blunt about why that's wrong: *"there is NO SUCH THING as a 'rated watt'"* for an electric-vehicle motor, the same physical motor gets sold under three different wattage labels depending on the manufacturer's marketing. So `motorPowerW` is wired in as a loose sanity nudge, not a clamp, if a fitted `η` would imply sustained power far past what the weakest motor among a shared-mode fit's devices could plausibly deliver, the fit gets nudged back down proportionally, never hard-capped to a number that was never physically meaningful to begin with.

## What happens near empty

Both the empirical baseline and the physics correction treat every battery percentage point as delivering equal range, an assumption that quietly breaks down under load below roughly 20% state of charge. No manufacturer publishes a per-SOC internal-resistance curve for the cells these boards use, but the underlying electrochemistry is well understood: internal resistance is U-shaped against SOC, rising two to three times as the graphite anode nears full delithiation, compounding with an open-circuit voltage that's already sagging in the same region. That's the real mechanism behind a board "struggling" right before it dies, not a mysterious cliff.

The methodologically correct fix is a full electrical model, open-circuit voltage minus a current-dependent resistance term, integrated to a cutoff voltage. That needs a calibrated per-cell curve this app doesn't have yet, so the interim fix is a derating multiplier: 1.0 (no penalty) at or above 20% SOC, falling off faster than linearly below it, down to a floor that never claims less than 35% of the naive linear estimate even at 0%. It's an interim model, and the code says so directly, rather than presenting a placeholder as a finished answer.

## Why bother fitting instead of shipping the defaults forever

A textbook default is the same for every rider on every board. A fitted one is a claim about *your* board, *your* weight, *your* riding style, backed by your own trip history, and it gets more honest the more you ride. That's the whole reason range estimation in Turbo exists as a real regression pipeline instead of three constants pulled from a spec sheet: the interesting question was never "what does the average board do," it was "what does mine actually do."
