# Portfolio 2026 overhaul — build plan

**Status:** ready to build
**Author:** research + planning pass, 2026-09-16
**Audience:** the implementing agent (assume no prior context on this repo)

---

## 0. Read this first

This is a **large, multi-part change** to `christian-toledo-portfolio` (Astro 5.7 →
Cloudflare Workers). Nine work packages. Do them in order — later packages depend on
the data-layer restructure in WP2.

Everything factual in this document was **verified against the real repos, the live
network, and the GitHub API** during the research pass. Where something is an
assumption, it says so. Do not "correct" a fact here from memory — if you believe
something is wrong, re-verify it the same way (commands are given inline) before
changing course.

### The single most important constraint

**Every page exists twice: English and Swedish.** They are literal parallel files,
identical line counts:

| English | Swedish |
|---|---|
| `src/pages/index.astro` (425 lines) | `src/pages/sv/index.astro` (425 lines) |
| `src/pages/about.astro` (403 lines) | `src/pages/sv/about.astro` (403 lines) |
| `src/pages/blog/index.astro` | `src/pages/sv/blog/index.astro` |
| `src/pages/blog/[...slug].astro` | `src/pages/sv/blog/[...slug].astro` |
| `src/content/blog/en/*.md` (9 posts) | `src/content/blog/sv/*.md` (9 posts) |

The SV page imports `*_SV` constants (`SITE_DESCRIPTION_SV`, `PROJECTS_SV`,
`EXPERIENCE_SV`) and is otherwise structurally identical. **Any new section must be
built twice, and any new constant needs an `_SV` twin.** UI strings go in
`src/i18n/ui.ts` (both `en` and `sv` keys). A change that lands in EN only is an
incomplete change — this is the single most likely way to half-finish this work.

### Design system — do not invent new styling

Tokens live in `src/styles/global.css` (311 lines). Use them; do not hardcode colors.

```
--bg #0b0d10   --bg-elevated #14171c   --bg-elevated-2 #1b1f26
--text #e8e6e1 --text-muted #9aa0a6    --text-dim #6b7178
--border #262b32  --border-strong #343b44
--accent #e8930c  --accent-soft rgba(232,147,12,.12)
--sans 'Atkinson Hyperlegible'   --mono 'JetBrains Mono'
--container-width 1080px  --radius 10px  --radius-sm 6px
```

House style, stated in `README.md` and visible throughout: dark-default with a light
theme via `[data-theme='light']`, **one** accent (amber), monospace **only** for
metadata/labels/eyebrows, flat bordered `.card` surfaces with a subtle hover lift.
No glow, no neon, no clip-paths, no gradients, no new fonts, no UI framework.

**Light mode is not optional.** Every new surface, border, logo, and graph color must
be readable in both themes. Toggle it and look before calling anything done.

Reusable classes already available: `.card`, `.eyebrow`, `.mono`, `.section-head`,
`.btn` / `.btn-secondary`, `.stack-tags`, `.btn-row`, `.prose-block`.

---

## 1. What is actually broken right now (all verified)

This is the justification for the work. Each item was confirmed, not assumed.

### 1.1 Every project link on the site is dead

```bash
gh repo list neowara --json name,visibility
```

| Repo | Visibility | Linked from the site? |
|---|---|---|
| `turbo` | **PRIVATE** | yes — `consts.ts`, `Footer.astro` |
| `turbo-backend` | **PRIVATE** | yes — `consts.ts` |
| `casa-verde` | **PRIVATE** | yes — `consts.ts`, `Footer.astro` |
| `cityroam-website` | **PRIVATE** | no |
| `christian-toledo-portfolio` | PUBLIC | — |

Every "App repo ↗" / "Backend repo ↗" / "Repo ↗" link **404s for any visitor**. The
repos are private deliberately and are staying private.

Separately, `PROJECTS.turbo.repoLinks` links to `https://turboapp.casa-verde.casa`:

```
curl -o /dev/null -w "%{http_code}" https://turboapp.casa-verde.casa  → 000 (dead)
curl -o /dev/null -w "%{http_code}" https://cityroam.casa-verde.casa  → 200 (live)
```

A recruiter clicking any project link on the homepage today hits a 404 or a dead
host. **This alone is the highest-severity bug in the repo.**

### 1.2 The product is no longer called Turbo

Turbo → (briefly Sokai) → **Cityroam**. This is done, shipped, and live:

- `turbo/mobile/app.json`: `"name": "Cityroam"`, `"slug": "cityroam"`,
  `"version": "4.3.0"`, `"package": "com.neowara.cityroam"`, `versionCode` 83
- `turbo/mobile/package.json`: `"name": "cityroam-mobile"`
- Icons: `cityroam-icon.png`, `cityroam-adaptive-icon.png`, `cityroam-monochrome-icon.png`
- `components/ui/CityroamMark.tsx` shipped; old `Wordmark.tsx` / `WheelMark.tsx` deleted
- Live site `https://cityroam.casa-verde.casa` — hero: *"Pair it once, ride."*,
  tagline *"Wherever the city takes you, roam remembers the way."*, closed beta,
  contact `cityroamapp@casa-verde.casa`, **no GitHub links** (deliberate precedent —
  follow it)
- Rationale is written up in `cityroam-website/docs/cityroam-rebrand.md`: "Turbo"
  collided with TurboAnt and TurboTrack GPS in the same niche

The site still says "Turbo" in `consts.ts` (EN + SV), `Footer.astro`, the homepage
hero, the About page, and five blog posts.

> **Do not rename the `turbo` ride mode.** `mobile/lib/mode.ts` defines
> `Mode = 'eco' | 'ride' | 'speed' | 'turbo'` mirroring the board's hardware speed
> levels, shared verbatim with the backend's `app/core/constants.py`. In app/blog
> copy, "Turbo" as a **ride mode** is correct and must survive. Only the **brand**
> changes. Both repos' rebrand docs flag this explicitly.
>
> The GitHub repos are still *named* `turbo` / `turbo-backend`. That's fine — they're
> private and unlinked. Don't write copy that depends on repo names.

### 1.3 Blog images are wrong — verified by checksum

```bash
md5sum public/blog/turbo-logo.png public/blog/turbo-navee-logo.png
# 705ef21c40e7340df1b91076383a4ca9  turbo-logo.png
# 705ef21c40e7340df1b91076383a4ca9  turbo-navee-logo.png   ← byte-identical
```

**`turbo-navee-logo.png` is not a NAVEE logo.** It is a pixel-for-pixel copy of the
old orange TURBO wordmark, used as the hero image of the NAVEE post. Visually
confirmed: it reads "TURBO" with the retired wheel mark.

Worse, `public/blog/turbo-dashboard.png` — the hero of `turbo.md`, the flagship post
linked from the homepage project card — was opened and inspected. It shows:

1. The retired orange **TURBO** wordmark
2. A red error banner: **"Direct BLE SDK is not linked into this build."**
3. "No device paired"
4. Empty states: "no data", "learning", "learning", "learning"
5. The bottom nav visually overlapping the "Range by mode" card

That screenshot actively contradicts the post it illustrates (which argues the Tuya
SDK was successfully deleted), and shows a broken, empty, error-state app. It is the
worst possible flagship image.

The images split cleanly into two generations (confirmed by byte-identical matches
against the source repos):

**Stale — old Turbo-branded UI** (copies of `turbo/docs/screenshots/*.png`, 2026-08-29):
`turbo-dashboard.png` · `turbo-activity.png` · `turbo-rides.png` ·
`turbo-trip-detail.png` · `turbo-board-config.png` · `turbo-logo.png` ·
`turbo-navee-logo.png`

**Current — Cityroam-branded** (copies of `cityroam-website/public/screenshots/*.jpg`, 2026-09-06):
`turbo-physics-activity.jpg` · `turbo-tuya-settings.jpg` · `turbo-tuya-board-settings.jpg` ·
`turbo-website-hero.jpg` · `turbo-website-route-planner.jpg` · `turbo-website-verdicts.jpg` ·
`turbo-website-widget.jpg`

So posts titled "Turbo…" currently show a **mix** of dead-brand screenshots and
current Cityroam screenshots. That mix is what needs fixing.

### 1.4 Stale numbers

`casa-verde` now has **82 ADRs** (`ls docs/adr/ | wc -l` → 82). Site says "80+" in
several places — fine as a floor, but "82 written ADRs" is stronger and true today.
Use a concrete number and note it's a floor that grows.

### 1.5 Missing entirely

No CV download. No GitHub contributions graph. No AI section. No client/company
context in the experience timeline beyond plain-text names.

---

## 2. What the research says to build

Sources consulted during the research pass are listed in §12.

The dominant 2026 hiring-side finding: **proof of work beats presentation**, and
recruiters specifically look for *evidence of independent judgment* — decisions a
candidate could not explain unless they genuinely made them. Live demos matter
(~84% of employers want to see something working, not just a repo link), and 3–5
deeply documented projects beat a dozen shallow ones.

**The strategic consequence for this site, and the thing to get right:**

Because every repo is private, the usual proof channel (go read my code) is closed.
The blog posts, the ADR discipline, the live Cityroam beta, and the contribution
graph *are* the proof. So the site must stop advertising repo links it cannot honor,
and instead lean hard on the artifacts it can actually show. Reframe from
"here's my code" to **"here's the reasoning, and here's the running system."**

That reframing is the spine of this whole plan. Apply it everywhere.

Two supporting findings:

- **AI on a résumé, 2026:** naming tools is worthless; what reads as senior is
  *operating evidence* — the workflow, the autonomy boundary, the tradeoffs, the
  failure modes, the cost/latency decisions. Christian has unusually strong material
  here (§8) that most candidates cannot match.
- **Client logos:** nominative fair use generally covers factually identifying
  companies worked with, provided you use no more of the mark than necessary and
  imply no endorsement. Monochrome treatment plus an explicit disclaimer is both the
  safest and the best-looking option. (Decision confirmed with the user.)

---

## 3. Decisions already made (confirmed with the user — do not revisit)

| Topic | Decision |
|---|---|
| Client logos | **Monochrome wordmarks** inheriting site text color, plus a not-an-endorsement disclaimer |
| Stale blog posts | **Rewrite all five** as Cityroam, including the NAVEE post. Delete none. Redirect old slugs |
| Contributions data | **Worker route + no-auth API + committed fallback snapshot.** No GitHub token |
| CV | **Both languages as PDFs + a real HTML `/cv` page** rendered from shared structured data |
| casa-verde presentation | **Split into five named systems** in a new `#systems` section; the casa-verde card is reframed as the platform they run on (WP3B) |

---

## 4. WP1 — Asset preparation

Do this first; later packages consume these files.

### 4.1 CV PDFs

Both files exist on disk (verified):

```
/c/Users/Christian/Documents/christian_toledo_web_developer_cv_2026.pdf
/c/Users/Christian/Documents/christian_toledo_webbutvecklare_cv_2026.pdf
```

Copy into `public/cv/` as:
- `christian-toledo-cv-en.pdf`
- `christian-toledo-cv-sv.pdf`

Stable, language-suffixed names so links never break when the PDF is refreshed.

> **CV corrections — user instruction 2026-09-16: "update the CVs to match."**
> Two inconsistencies were found between the two PDFs. The corrected versions below
> are the single source of truth for the `/cv` HTML page (WP6) and all site copy:
>
> 1. **ED Insights (Swedish CV) — fix.** The SV entry wrongly describes *Posifon*
>    ("där jag underhöll WordPress-sajten för Posifon…"), duplicating the Posifon
>    entry directly below it. The **English CV is correct**: ED Insights was a static
>    WordPress site with a Figma prototype designed alongside the customer. Translate
>    the English version into Swedish for the SV page.
> 2. **Medieinstitutet dates — use `Aug 2018 – Apr 2020`.** The two PDFs disagree
>    (EN: 2017, SV: 2018). 2018–2020 is the better reading: it's exactly the two-year
>    length of Medieinstitutet's YH frontend programme, and it follows cleanly from
>    Ljungskile folkhögskola ending Jan 2017. **Flag this in the handoff for the user
>    to confirm** — it's their fact, and if 2017 is right it's a one-line change.
>
> **The PDFs themselves cannot be corrected by this agent** — they're generated
> exports from a CV builder, not editable source. Tell the user in the handoff that
> both PDFs need regenerating in whatever tool produced them, with these two fixes.
> Until then the HTML `/cv` page will be the more accurate of the two, which is an
> argument for linking it prominently (WP6.1 already does).

### 4.2 Cityroam app screenshots

Source of truth for current-brand imagery:
`E:\Code\Personal\cityroam-website\public\screenshots\*.jpg` (2026-09-06, Cityroam-branded).

Copy into `public/blog/` with clear new names:

| Source | Destination |
|---|---|
| `hero-dashboard.jpg` | `cityroam-dashboard.jpg` |
| `activity.jpg` | `cityroam-activity.jpg` |
| `rides.jpg` | `cityroam-rides.jpg` |
| `trip-detail-map.jpg` | `cityroam-trip-detail.jpg` |
| `trip-detail-modes.jpg` | `cityroam-trip-modes.jpg` |
| `route-planner.jpg` | `cityroam-route-planner.jpg` |
| `trip-verdicts.jpg` | `cityroam-verdicts.jpg` |
| `board-settings.jpg` | `cityroam-board-settings.jpg` |
| `settings.jpg` | `cityroam-settings.jpg` |
| `widget.jpg` | `cityroam-widget.jpg` |

Then **delete** the confirmed-stale files:
`turbo-dashboard.png`, `turbo-activity.png`, `turbo-rides.png`,
`turbo-trip-detail.png`, `turbo-board-config.png`, `turbo-logo.png`,
`turbo-navee-logo.png`.

Then delete the seven current-generation files that only exist under misleading
`turbo-*` names, since WP1 has re-copied them under `cityroam-*` names:
`turbo-physics-activity.jpg`, `turbo-tuya-settings.jpg`,
`turbo-tuya-board-settings.jpg`, `turbo-website-hero.jpg`,
`turbo-website-route-planner.jpg`, `turbo-website-verdicts.jpg`,
`turbo-website-widget.jpg`.

**After deleting, grep the whole repo for every removed filename and confirm zero
references remain** (WP8 rewrites the posts that use them — sequence accordingly, or
do the deletion last):

```bash
grep -rn "turbo-dashboard\|turbo-logo\|turbo-navee-logo\|turbo-activity\|turbo-rides\|turbo-trip-detail\|turbo-board-config\|turbo-physics-activity\|turbo-tuya\|turbo-website-" src/ public/
```

Keep `cityroam-icon.png`, `cityroam-mark.svg`, and the `cityroam-live-*.png` site
screenshots — those are current and already correct.

### 4.3 Cityroam brand mark

`public/blog/cityroam-icon.png` and `cityroam-mark.svg` already exist. Move/copy the
icon to `public/projects/cityroam-icon.png` for use as the project card icon
(replacing `/blog/turbo-logo.png`). Master SVGs, if a cleaner source is wanted:
`cityroam-website/prototype/cityroam-icons/` (`glyph-on-dark.svg`,
`glyph-on-light.svg`, `glyph-mono.svg`) with a `render.cjs` that regenerates them.
Prefer `glyph-mono.svg` inlined with `fill="currentColor"` if the PNG looks poor in
light mode.

### 4.4 Client wordmark SVGs → `public/logos/`

Needed: `postnord.svg`, `1177.svg`, `stadsmission.svg`, `nordic-wellness.svg`,
`plejd.svg`, `nexer.svg`, `dear-friends.svg`, `nordic-retail-group.svg`.

**Process per logo:**
1. Source an SVG (Wikimedia Commons, or the company's own press/brand page).
2. Strip **all** `fill`, `style`, `class`, and color attributes from paths.
3. Set a single `fill="currentColor"` on the root `<svg>`.
4. Normalize to a consistent optical height via `viewBox` — aim for a ~24px render
   height with sensible width; do not force a uniform width (wordmarks vary a lot in
   aspect ratio, and squashing them looks worse than letting widths differ).
5. Remove `width`/`height` attributes so CSS controls sizing.

**If a clean SVG cannot be sourced for one of these, do not ship a blurry PNG or a
traced approximation.** Fall back to a styled text wordmark in `--mono` at the same
optical size. A consistent typographic fallback looks deliberate; one bad raster logo
among clean SVGs looks broken. Note in the handoff which ones fell back.

Because every logo is `currentColor`, both themes work automatically and the single
accent rule is preserved.

---

## 5. WP2 — Restructure `src/consts.ts` (the data layer)

**Everything downstream depends on this. Do it before WP3–WP8.**

`src/consts.ts` is currently 183 lines: `PROJECTS` / `PROJECTS_SV`,
`EXPERIENCE` / `EXPERIENCE_SV`. It needs to grow substantially. If it passes ~400
lines, split into `src/data/projects.ts`, `src/data/experience.ts`, `src/data/ai.ts`,
`src/data/cv.ts` and re-export from `consts.ts` so existing imports keep working.

### 5.1 `PROJECTS` — rebrand and de-link

For the `turbo` key (**keep the object key `turbo`** to avoid churn in
`index.astro`; only the displayed data changes — or rename to `cityroam` and update
both index pages consistently, but do not do it halfway):

```ts
name: "Cityroam",
tag: "// mobile + backend",
icon: "/projects/cityroam-icon.png",
pitch: /* rewrite: Android app + self-hosted backend, ride computer for
          electric boards and scooters, two brands' proprietary BLE
          protocols reimplemented from scratch, no vendor SDK, no cloud
          account required to ride */
```

**`repoLinks` must change shape.** Replace the three dead links with links that
actually resolve:

```ts
links: [
  { label: "Live site", url: "https://cityroam.casa-verde.casa" },  // 200 OK
  { label: "Read the deep dive", url: "/blog/cityroam/" },
]
```

Add a **`sourceNote`** field rendered as small `--text-dim` text on the card, e.g.
*"Source is private — the deep dives below cover the architecture and the decisions."*
This is the §2 reframing made concrete: it converts a dead link into a deliberate,
explained choice. Give `casaVerde` the same treatment (its repo link is also dead).

Update `details` to reflect reality as of v4.3.0:
- Two device brands, not one: Tynee (Tuya-based) **and** NAVEE V40i Pro — both
  protocols reverse-engineered, no vendor SDK for either (see §5.2 and WP8.5)
- Physics fitted per-rider/per-mode by regression over real trip history
- Offline-first: every trip written to local SQLite **before** any network call
- Native ride recording surviving process death (foreground service + native job +
  system-held BLE scan + native journal)
- In-app updater, home-screen widget, Health Connect two-way sync

Add to `casaVerde.details`: bump "80+ written ADRs" → **"82 written ADRs"**.

Mirror all of it in `PROJECTS_SV`.

### 5.2 Verified Cityroam facts for copy

Use these; they were checked against the source repos this pass.

- Version **4.3.0**, `versionCode` 83, package `com.neowara.cityroam`
- **Closed beta**, live at `cityroam.casa-verde.casa`
- Native Expo modules in `mobile/modules/`: `board-ble`, `navee-ble`, `ride-core`,
  `cityroam-widget`, `device-power`, `app-updater`
- 7 app ADRs in `turbo/docs/adr/` — notably `0007-device-profile-abstraction.md`
  (the multi-brand architecture) and `0006-native-ride-recording-and-reconnection.md`
- Backend: FastAPI + SQLModel + Alembic, layered `app/{api,services,models,schemas,presenters,infra,core}`,
  real migrations on startup (`alembic upgrade head`, explicitly **not**
  `create_all()`), pytest, Docker, Python 3.12
- Self-hosted **OSRM** for road-snapping + map-matching; **Open-Meteo** for elevation
  and weather sampled across the whole route
- Auth: per-user accounts, **argon2id** hashing, session auth
- Deployed to LXC `ct110` on casa-verde via **Komodo** GitOps

**NAVEE status — user-confirmed 2026-09-16: multi-brand support has shipped and is
verified working on the real scooter.** This **supersedes** the stale line in
`turbo/docs/plans/navee-4.2.0-field-fixes.md` that says *"Not yet verified on the
real scooter — only jest mocks and JVM tests so far."* That file is out of date. Do
not re-introduce that caveat into any copy.

Shipped NAVEE implementation, verified present in source:
`mobile/modules/navee-ble/` (Kotlin: `NaveeAuth.kt`, `NaveeAdvertisement.kt`),
`mobile/lib/navee/{credentials,quickControls,settings}.ts`,
`mobile/components/NaveeSettingsScreen.tsx`, `mobile/components/ui/NaveePairingCard.tsx`,
`mobile/lib/__tests__/naveeSettings.test.ts`.

The protocol detail — worth writing about because it's genuinely hard: the scooter
answers a `0x30` auth frame with a 16-byte challenge; the client must return it
**AES-128-ECB encrypted** under a named key (`0x31`). A well-known third-party
implementation *decrypts* instead — following the official app's actual
`Cipher.ENCRYPT_MODE` was the thing that made it work. Getting that backwards is why
an earlier draft looped connect → disconnect forever.

**Sub-feature status — user-confirmed 2026-09-16: everything works.** Ride mode,
energy recovery, lock, cruise control, and the lights are all built into the Cityroam
app and functioning on the real scooter. The stale plan doc's claim that "ride mode
and energy recovery don't work right now, only lock/cruise/taillight/auto-headlight
do" is **out of date — do not repeat it anywhere.**

So the NAVEE post can state plainly: full feature parity on a second brand, protocol
reverse-engineered from scratch, shipped and working.

### 5.3 `EXPERIENCE` — add client/platform structure

This is the core of the "highlight the types of applications and companies" request.
Extend each entry with a `clients` array. Keep `role`, `org`, `dates`, `bullets`,
`stack` as they are.

```ts
clients: [
  {
    name: "1177 Vårdguiden",
    logo: "/logos/1177.svg",
    kind: "Public healthcare platform",     // translate in _SV
    scale: "National · millions of users",  // translate in _SV
    note: "Angular frontend on Optimizely; upgrade and ongoing maintenance as part of one of several development teams",
  },
  // …
]
```

**Accuracy rules — these matter more than the visual polish:**

- Christian was a **consultant**; clients were reached **through** Nexer AB and Dear
  Friends. The UI must make that relationship obvious (clients nest *inside* the
  employer's timeline entry — never a flat "my clients" wall).
- Keep the existing honest scoping. The current bullets say "as part of a larger
  development team" for Inera and "sole developer" for Stadsmission. **Preserve that
  precision.** Do not inflate a team contribution into ownership. This is exactly
  the "independent judgment" signal recruiters screen for, and inflation is the
  fastest way to lose it in an interview.
- "Millions of users" for 1177 is a true statement about the **platform**, not about
  traffic Christian personally owned. Phrase it as platform scale.

Per-employer client data (all from the CVs and existing site copy):

**Dear Friends** (Jan 2026 – Jun 2026)
- *Nordic Wellness* — Nordic gym chain — React Native apps (Expo) + Umbraco site;
  live content and pricing via the Umbraco Delivery API; owned weekly releases,
  TestFlight, Google Play Console, on-device testing
- *Grand Fitness* — Umbraco (.NET) site
- *Fred's Food and Coffee* — Umbraco (.NET) site
- *IEMS, BabySlides, Doxa Bostad, Hagab* — WordPress maintenance (group these as one
  compact "WordPress upkeep" line; they don't each need a logo)

**Nexer AB** (Feb 2023 – Mar 2025)
- *Inera / 1177 Vårdguiden* — national public healthcare platform — Optimizely 11/12
  + Angular; upgrade and maintenance within one of several teams
- *PostNord* — Nordic postal operator — internal React tool for planning postal
  delivery routes across Sweden; frontend developer in a larger team
- *Göteborgs Stadsmission* — non-profit, social services — React Native app
  connecting surplus-food donors with people in need across Gothenburg; **sole
  developer**

**Nordic Retail Group / Digital People** (Dec 2020 – Jan 2023)
- *Enginio* — the product itself, not a client — Vue.js advertising / brand-activation
  platform; sole frontend developer from early startup through acquisition;
  Storybook component library; load time 4.2s → 1.8s

**Plejd AB** (2019 – 2020, internship)
- Swedish smart-home hardware company; internal tools in a 100,000+ line
  Angular.js/Vue.js codebase, used by 50+ employees daily

Mirror the whole structure in `EXPERIENCE_SV` with Swedish `kind` / `scale` / `note`
values. Org names, product names, and stack tags stay untranslated.

### 5.4 New data structures

Add (each with an `_SV` twin where it contains prose):

- `SYSTEMS` — see WP3B; the five casa-verde systems
- `AI_PRACTICE` — see WP7 for the full shape and content
- `CV` — see WP6; the structured résumé data backing `/cv`
- `CONTRIBUTIONS_FALLBACK` — see WP5; the committed snapshot

Also reframe `PROJECTS.casaVerde` as **the platform**, not the whole homelab — its
`pitch` and `details` should now cover Proxmox, Ansible, Komodo GitOps, the
self-hosted runner, SOPS/age secrets, drift detection, and the 82 ADRs, and hand off
the per-service detail to `SYSTEMS`. Remove its dead repo link and give it the same
`sourceNote` treatment as Cityroam.

---

## 6. WP3 — Homepage: rebrand, experience, and new sections

Files: `src/pages/index.astro` **and** `src/pages/sv/index.astro`.

### 6.1 Hero

Current EN hero body names "Turbo" implicitly and leads with reverse-engineering.
Rewrite to:
- Name **Cityroam** explicitly, and that it's in closed beta with a live site
- Lead with the client-facing scale (1177, PostNord, Nordic Wellness) *and* the
  self-directed depth — the combination is the differentiator
- Keep the existing voice: concrete, understated, no superlatives, no "passionate"

Keep the existing `.btn-row`, and **add a CV download button** (WP6) as a secondary
action. Add `#ai` and `#github` to the in-page nav targets if you extend the button
row — but don't let it grow past four buttons; drop "Get in touch" from the hero row
if needed, since the CTA band and footer both already cover it.

### 6.2 Project cards

- Turbo → Cityroam name, icon, pitch, details (WP2)
- Replace dead `repoLinks` with the live `links` + `sourceNote`
- The `casaVerde` card keeps its inline SVG icon (it's fine and on-brand)

### 6.3 Experience timeline — the client work

The timeline markup exists at `index.astro:~120` (`.timeline`, `.timeline-item`,
`.timeline-node`, `.timeline-head`, `.stack-tags`, plus the animated
`.timeline-now` dot). **Extend it; do not rewrite it.**

Inside each `.timeline-item`, between the bullets `<ul>` and `.stack-tags`, add a
client block:

```
┌─ .timeline-item ────────────────────────────────┐
│ Fullstack Developer (Consultant)                │
│ Nexer AB · Feb 2023 to Mar 2025                 │
│                                                 │
│ • existing bullets stay exactly as they are     │
│                                                 │
│ ── CLIENTS ──────────────────────  (.eyebrow)   │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐    │
│ │ [1177 svg] │ │[PostNord]  │ │[Stadsmis.] │    │
│ │ Public     │ │ Nordic     │ │ Non-profit │    │
│ │ healthcare │ │ postal     │ │ social svc │    │
│ │ National · │ │ Sweden-    │ │ Gothenburg │    │
│ │ millions   │ │ wide       │ │ sole dev   │    │
│ └────────────┘ └────────────┘ └────────────┘    │
│                                                 │
│ [React] [TypeScript] [Optimizely] …             │
└─────────────────────────────────────────────────┘
```

Styling rules:
- `display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: .9rem`
- Each tile: `background: var(--bg-elevated-2)`, `1px solid var(--border)`,
  `border-radius: var(--radius-sm)`, ~`1rem` padding
- Logo: `height: 22px; width: auto; color: var(--text-muted)`; on tile hover →
  `var(--text)`. Because logos are `currentColor`, this works in both themes free.
- `kind` in `--mono`, `.72rem`, `--text-dim`, uppercase, letter-spacing `.05em`
- `scale` / `note` in `--sans`, `.88rem`, `--text-muted`
- Collapse to one column under 640px
- Logos are decorative next to a visible text label → `alt=""` on the `<img>`,
  with the company name in real text. Do **not** rely on the logo alone to convey
  the name.

Add the disclaimer once, directly under the timeline, small and `--text-dim`:

> EN: *"Client work delivered through Nexer AB and Dear Friends. Logos are trademarks
> of their respective owners, shown to identify projects I contributed to — not an
> endorsement."*
>
> SV: *"Kunduppdrag utförda via Nexer AB och Dear Friends. Logotyper tillhör
> respektive varumärkesinnehavare och visas för att identifiera projekt jag bidragit
> till — inte som något godkännande."*

### 6.4 New homepage sections — order

Final section order (both languages):

1. Hero
2. `#work` — Selected work (Cityroam, casa-verde-as-platform)
3. **`#systems` — Systems running on casa-verde** (WP3B)
4. `#experience` — Experience + clients
5. **`#ai` — How I work with AI** (WP7)
6. **`#github` — Contribution activity** (WP5)
7. **`#cv` — CV download** (WP6)
8. CTA band

Rationale: experience and work carry the most hiring weight, so they stay above the
fold-ish; AI is the differentiator and sits right after; the contribution graph is
supporting evidence; CV is the conversion step, placed last where a convinced reader
looks for it — and also linked from the hero and footer for anyone who skips.

---

## 6B. WP3B — Split casa-verde into five named systems

### 6B.1 Why

**User directive (2026-09-16):** *"these are all individual projects that all ended up
under the same home lab server."* Correct — one card labelled "// infrastructure"
currently hides a media pipeline, a smart-home + voice-AI stack, a game server, a DNS/
reverse-proxy/access layer, and a GitOps deploy platform. A recruiter skimming reads
"homelab" and moves on; the actual breadth (Python, Docker, Ansible, DNS, GPU
passthrough, LLM ops, CI/CD, game-server modding) never registers.

### 6B.2 Framing — get this right

The §2 research is explicit that 3–5 deep projects beat a long shallow list, so
**do not present these as five unrelated side projects.** They share one Proxmox host,
one Ansible repo, one deploy pipeline, and one ADR log. Presenting them as independent
would be both misleading and weaker.

Correct framing: **casa-verde is the platform; these are the five systems running on
it.** That is simultaneously honest, more impressive (it demonstrates platform
thinking), and gets the user the breadth they asked for.

So:
- The `#work` casa-verde card stays, reframed as *the platform* — Proxmox, Ansible,
  Komodo GitOps, self-hosted GitHub Actions runner, SOPS/age secrets, drift detection,
  82 ADRs.
- A new `#systems` section directly beneath it presents the five, visually lighter
  than the two flagship `.project-card`s so the hierarchy stays obvious.

### 6B.3 The five systems — verified inventory

All service names below were read from the actual repo (`README.md` container table,
`ct102/docker-compose.yml`, the ADR log). Do not add services that aren't here.

**1 · Media automation & streaming** — `// media pipeline`
> 16-container Compose stack that acquires, sorts, subtitles, and serves media, plus a
> photo library doing ML face recognition on the same iGPU as the transcoder.

`sonarr` · `radarr` · `lidarr` · `prowlarr` · `bazarr` · `qbittorrent` · `sabnzbd` ·
`deemix` · `navidrome` · `flaresolverr` · `unpackerr` · `cleanuparr` · `recyclarr` ·
`unmonitarr` · **Jellyfin** (on the host, direct iGPU passthrough for transcoding) ·
**Immich** (ct101, photo library, iGPU-backed ML face search) · Samba shares.
Worth naming: `ADR 0074` root-caused a real recurring **Bazarr OOM**.
Stack tags: `Docker Compose`, `Jellyfin`, `Immich`, `Intel QSV / iGPU passthrough`, `Samba`

**2 · Smart home & a local voice assistant** — `// home automation + local AI`
> Home Assistant Green driving the house, with a fully self-hosted voice pipeline —
> speech-to-text, text-to-speech, and an LLM, all running locally on CPU — and a
> deliberate privacy split to a cloud model for open-ended questions.

Whisper (STT) · Piper (TTS) · Ollama (`Home-1B-v3`) · Home Assistant Green ·
a second Groq-backed pipeline on a separate wake word · Matter device migration
(`ADR 0069`–`0077`). **This is the highest-value card** — it's the only one that is
simultaneously infrastructure *and* applied AI, and it's the one with the documented
latency regression and revert (§10.1). Cross-link it to `#ai`.
Stack tags: `Home Assistant`, `Ollama`, `Whisper`, `Piper`, `Groq`, `Matter`, `Docker Compose`

**3 · Game server** — `// game server ops`
> A Project Zomboid dedicated server for friends, with ~49 mods and fully automated
> mod and update management — the interesting part is that mod updates break saves,
> so the automation has to be careful rather than just "pull latest."

Stack tags: `Ansible`, `Docker`, `Project Zomboid`, `systemd`

**4 · Network, DNS & remote access** — `// network + access`
> Local DNS with `.lan` hostnames and network-wide ad blocking, a reverse proxy in
> front of every service, and zero open inbound ports — remote access goes through
> Cloudflare Tunnel with Access in front of it.

AdGuard Home (ct103) · Nginx Proxy Manager (ct104) · Cloudflare Tunnel + Cloudflare
Access · ntfy (ct105, self-hosted push, replacing public ntfy.sh).
**Lead with "no open inbound ports"** — that's the security-literate detail, and it's
more meaningful to an employer than the service list.
Stack tags: `AdGuard Home`, `Nginx`, `Cloudflare Tunnel`, `Cloudflare Access`, `ntfy`

**5 · Deploy platform & observability** — `// platform + GitOps`
> Push to `main` *is* the deploy. Ansible for most stacks, Komodo GitOps for the ones
> where webhook-speed redeploys are worth the extra moving part — chosen per stack,
> not dogmatically. Plus daily drift detection that catches hand-edits made outside
> the pipeline.

Self-hosted GitHub Actions runner · Ansible (`site.yml`, parallel + skip-when-unrelated,
cut a deploy from ~5–6 min) · Komodo (ct107) · SOPS/age encrypted secrets ·
`drift-check.sh` running `ansible-playbook --check --diff` at 04:00 with ntfy alerts ·
automated backups · draw.io (ct109) regenerating the architecture diagram in CI.
Stack tags: `Ansible`, `Komodo`, `GitHub Actions`, `SOPS/age`, `Proxmox`, `Docker`

**The connective detail worth stating once:** ct110 on this platform hosts
**Cityroam's backend**. The two flagship projects are not independent — one runs on
the other. That single sentence does more for the portfolio than any individual card.

> ⚠️ Aside, not this repo's problem: casa-verde's own `README.md` still describes
> ct110 as "tynee-tracker" and links `github.com/neowara/tynee-tracker`, which no
> longer exists after the rename. Mention it in the handoff; **do not edit the
> casa-verde repo as part of this work.**

### 6B.4 Data + markup

Add `SYSTEMS` / `SYSTEMS_SV` to `consts.ts` (or `src/data/systems.ts`):

```ts
{
  key: "media",
  name: "Media automation & streaming",
  tag: "// media pipeline",
  icon: /* inline SVG name */,
  pitch: "…one or two sentences…",
  highlights: ["…", "…"],   // 2–3 short items, not the 4-item detail lists
  stack: ["Docker Compose", "Jellyfin", …],
}
```

Markup: reuse `.card` in a responsive grid —
`grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem`. Five cards
land as 3+2 on desktop, 2+2+1 at tablet, single column on mobile.

Keep each card **visually lighter** than the two flagship `.project-card`s: smaller
heading (`1.15rem` vs `1.5rem`), `1.5rem` padding, no two-column split, 2–3 highlights
max, reuse the existing `.stack-tags` and `.project-tag` mono eyebrow styles.

Icons: inline SVG, `stroke="currentColor"`, `stroke-width="1.6"`, 24px, `--accent`
colored — exactly matching the existing casa-verde card icon. Suggested glyphs: film/
play (media), house (smart home), gamepad (gaming), shield or globe (network), and
the existing grid glyph (platform). **Don't import an icon library** for five icons.

Section heading: *"Five systems, one platform"* with a sub-line making the
relationship explicit — something like *"casa-verde isn't one project. It's a
Proxmox host and a deploy pipeline that five separate systems run on, each with its
own stack, failure modes, and decision log."* Translate for SV.

Each card gets a link into `/blog/casa-verde/` (anchor to the relevant section once
WP8.6 adds headings), and card 2 additionally links to `#ai`.

---

## 7. WP4 — Cityroam rebrand sweep (site-wide)

After WP2/WP3, sweep everything else.

```bash
grep -rn "Turbo\|turbo" src/ public/ README.md --include="*.astro" --include="*.ts" --include="*.md" --include="*.json"
```

Each hit is one of three cases:

1. **Brand → rename to Cityroam** (most hits)
2. **Ride mode → leave alone** (`'turbo'` as one of eco/ride/speed/turbo)
3. **Historical reference → keep, but contextualize** (blog posts explaining the
   rename need to say "Turbo" to tell the story — that's correct)

Specific known locations:
- `src/components/Footer.astro:~33` — `<a href="https://github.com/neowara/turbo">Turbo</a>`
  → **Cityroam** pointing at `https://cityroam.casa-verde.casa`
- `Footer.astro` — the `casa-verde` link points at a private repo; change it to
  `/blog/casa-verde/` (the deep dive) instead of a 404
- `src/consts.ts` — `SITE_DESCRIPTION` / `SITE_DESCRIPTION_SV`, `package.json`
  `description`, `README.md` — all say "Turbo"
- `src/pages/about.astro` + `sv/about.astro` — several "Turbo" mentions, including
  the hobby card *"An electric skateboard called Turbo."*

> **Special case — keep this story, it's genuinely good.** The About hobby card
> explains the board is *named* Turbo after Oliver Tree's first stage character.
> That's about the **physical board**, and it still stands. Rewrite it to make the
> distinction explicit and turn it into an asset: the board is still called Turbo,
> the app it inspired is now Cityroam, and the rename happened for trademark-collision
> reasons (TurboAnt, TurboTrack GPS). That's a small, real product-judgment story.

Also update About page copy for: Cityroam naming, **82** ADRs, multi-brand (two
brands shipped, not "a multi-brand plan gated behind prerequisites" — that sentence
in the Skills section is now out of date and understates the work), and the
private-repos reframing from §2.

---

## 8. WP5 — GitHub contribution graph

### 8.1 Verified data source

```bash
curl -s "https://github-contributions-api.jogruber.de/v4/neowara?y=last"
# → {"total":{"lastYear":1549}, "contributions":[{"date":"2025-09-14","count":0,"level":0}, …]}
```

**1,549 — an exact match for the user's screenshot.** This confirms
"Include private contributions on my profile" is enabled, so private-repo work is
publicly counted. This was the key risk (all repos are private → an empty-looking
graph would be worse than no graph) and it is **resolved**. No token needed.

Yearly totals also available: `2026: 1517`, `2025: 111`, `2019: 152`, `2018: 100`,
`2017: 55`.

Response shape:
```ts
{
  total: { [year: string]: number, lastYear?: number },
  contributions: Array<{ date: string; count: number; level: 0|1|2|3|4 }>
}
```
`level` is precomputed 0–4 — map it straight onto five accent tints. Don't re-derive
thresholds.

### 8.2 The Worker route

Astro 5 removed `output: 'hybrid'`; the default `static` output plus an adapter lets
you opt **individual** routes into on-demand rendering. The Cloudflare adapter is
already configured in `astro.config.mjs`. **Do not change `output`.**

Create `src/pages/api/contributions.json.ts`:

```ts
export const prerender = false;   // ← this route only; everything else stays static
```

Behavior:
1. Check the Cloudflare **Cache API** for a cached response
2. Miss → `fetch("https://github-contributions-api.jogruber.de/v4/neowara?y=last")`
3. Cache with `Cache-Control: public, max-age=21600` (6h — the upstream caches ~1h,
   so this is polite and still same-day fresh)
4. Any failure (non-200, timeout, malformed) → return the committed fallback with a
   `stale: true` flag, **HTTP 200**. The section must never render an error.
5. Always return valid JSON of the shape above. Set a fetch timeout; don't hang a
   request on a third-party outage.

### 8.3 The fallback snapshot

Generate `src/data/contributions-snapshot.json` at plan-execution time by calling the
API once and committing the result. Add an npm script to refresh it:

```json
"refresh-contributions": "node scripts/refresh-contributions.mjs"
```

This guarantees the section renders instantly on first paint with no layout shift,
and still shows something real if the upstream API disappears.

### 8.4 The component

`src/components/ContributionGraph.astro`:

- **Server-render the committed snapshot** into the HTML so it is correct with JS
  disabled and there's no CLS
- On the client, `fetch('/api/contributions.json')` and patch the squares in place if
  the data is newer
- 53 weeks × 7 days grid, `display: grid; grid-auto-flow: column;
  grid-template-rows: repeat(7, 1fr)` — matching GitHub's column-per-week layout
- Square: ~11px, `border-radius: 2px`, `gap: 3px`
- Colors — **derive from `--accent`, do not introduce GitHub green**; the site has a
  one-accent rule:
  - level 0 → `var(--bg-elevated-2)`
  - levels 1–4 → increasing `color-mix(in srgb, var(--accent) X%, var(--bg-elevated-2))`
    at roughly 25 / 45 / 70 / 100%
  - `color-mix` is already used in `Header.astro`, so it's an established pattern here
- Month labels above (`--mono`, `.7rem`, `--text-dim`), weekday labels left
  (Mon/Wed/Fri only, like GitHub)
- Each square: `<div title="3 contributions on Sep 14, 2026">` — and give the grid
  `role="img"` with an `aria-label` summarizing the year total, since 371 individually
  focusable squares is hostile to a screen reader
- Horizontal scroll on mobile with the current-date end visible first
- Headline stat beside it: **"1,549 contributions in the last year"** (read from data,
  never hardcode the number)

Localize labels via `src/i18n/ui.ts` (month abbreviations, "contributions in the last
year" → *"bidrag det senaste året"*).

### 8.5 Section framing

Don't present a bare graph — it invites "so what?". Pair it with one line of honest
context, e.g.: *"Most of this is private-repo work on Cityroam and casa-verde. The
deep dives below are the readable version."* That ties the graph to §2's reframing:
the graph proves the **volume**, the blog proves the **judgment**.

Link to `https://github.com/neowara` with `rel="noopener noreferrer"`.

---

## 9. WP6 — CV download + `/cv` HTML page

### 9.1 Homepage `#cv` section

Both `index.astro` and `sv/index.astro`. A `.card` containing:

- Heading + one line of context
- **Three actions:** `View CV online →` (primary, `/cv`), `↓ English (PDF)`,
  `↓ Svenska (PDF)`
- On the SV page, lead with the Swedish PDF
- `--text-dim` meta line: *"Updated September 2026 · PDF, 3 pages"* — derive the
  month from a constant so it's trivially updatable, don't hardcode in two places
- `download` attribute on the PDF links; no email gate, no form

Also add a CV link to `Footer.astro` (both languages, via `i18n/ui.ts`) and a
secondary CV button in the hero row.

### 9.2 `/cv` and `/sv/cv` pages

New: `src/pages/cv.astro` + `src/pages/sv/cv.astro`.

**Render from the same structured data as the homepage timeline.** This is the whole
point of the HTML version — the homepage and the CV page must not be able to drift.
Extend `EXPERIENCE` / `EXPERIENCE_SV` with the extra fields the CV needs (education,
internships, languages, skills) rather than duplicating prose.

Sections: Profile → Experience (incl. clients) → Skills → Education → Internships →
Languages. Content comes from the PDFs (§4.1 — use the **English** CV's dates and the
correct ED Insights text).

Practical requirements:
- Reuse `.card` / `.timeline` / `.stack-tags`; no new visual language
- A `@media print` block so Ctrl-P produces something clean (hide header/footer/nav
  and the theme toggle, force light colors, avoid page breaks inside entries)
- Skills: group by category (Languages, Frontend, Backend, Mobile, Infra, Tooling)
  rather than the PDF's flat list with decorative proficiency bars — self-rated bars
  read as noise to most engineers, and the bars in the PDFs are inconsistent between
  the EN and SV versions anyway
- `<link rel="alternate" hreflang>` between `/cv` and `/sv/cv`
- Add both to the sitemap (automatic via the existing `@astrojs/sitemap` integration)
- Do **not** publish the street address or phone number from the PDFs. Email +
  city is the right amount for a public page. The PDFs keep the full details for
  actual applications.

---

## 10. WP7 — The AI section

The user's brief: show that they use and experiment with many agents and models,
both **local and cloud** — DeepSeek, Ollama, Claude, Codex, OpenAI, z.AI and more.

Per §2's research finding, a tool logo wall is the weak version and reads as
box-ticking. The strong version is **operating evidence**. Christian has an unusual
amount of it, verified this pass — lead with that and let the tool list be supporting
detail.

### 10.1 Verified material — this is the good stuff

**Locally installed Ollama models** (`ollama list`, on an RTX 4090 workstation):

| Model | Size |
|---|---|
| `gemma4:26b` | 18 GB |
| `granite4:32b-a9b-h` | 19 GB |
| `qwen3-coder:30b` | 18 GB |
| `devstral-small-2:24b` | 15 GB |
| `muse-glimmer:30b` | 18 GB |
| `embeddinggemma` | 621 MB |
| `nomic-embed-text` | 274 MB |

Two embedding models alongside five instruct/coder models — that's a real local
stack, not a one-off download.

**Agent tooling in daily use** (verified on disk):
- Claude Code with **seven custom project-agnostic subagents** in `~/.claude/agents/`:
  `code-reviewer`, `security-auditor`, `deploy-verifier`, `test-runner`, `android-qa`,
  `fastapi-backend-engineer`, `react-native-engineer` — split deliberately into
  read-only reviewers, testers, and stack-specific implementers
- OpenAI **Codex** CLI (`~/.codex/config.toml`, `gpt-5.6-terra`, medium reasoning)
- Google **Gemini** CLI (`~/.gemini/`)
- Per-repo agent instruction files: `CLAUDE.md` in casa-verde, turbo, turbo-backend,
  cityroam-website; `AGENTS.md` in turbo and cityroam-website
- `android-qa` drives a real Expo app on an emulator via **Maestro** (element/text
  based, not blind coordinate taps) and inspects screenshots visually

**Production local-LLM operations — the strongest material.** From casa-verde's ADRs
(all real, all documented with reasoning *and* failures):

- `ADR 0015` — researched whether a **CPU-only** voice assistant was viable on an
  i7-12700K instead of assuming a GPU purchase. Conclusion: whisper.cpp `small` runs
  ~6× real-time on CPU; a GPU was never actually required for STT.
- `ADR 0016` — Ollama CPU **thread pinning**
- `ADR 0018` — a **second, cloud-backed** pipeline on a separate wake word, chosen
  deliberately: anything touching the home stays fully local for privacy; open-ended
  questions go to **Groq** (~800+ tok/s on LPU hardware, OpenAI-compatible API, real
  free tier). **Google was explicitly ruled out** for home data. That's a considered
  privacy boundary, not a default.
- `ADR 0048` / `ADR 0050` — replaced a generic `llama3.2:3b` with
  **`acon96/home-llm`'s `Home-1B-v3`**, a model fine-tuned for Home Assistant device
  control. Research had flagged the *larger* generic model as unreliable above one
  tool call — so a smaller generic model would have been faster but **worse** at the
  actual job. Round trip went **45–57s → ~5–6s**, and the win came from correctly
  scoping the model and prompt, not from hardware.
- `ADR 0059` / `ADR 0061` — **a real incident, documented honestly.** Migrating all
  27 voice commands to `custom_sentences`/`intent_script` made the fuzzy matcher
  score against a **768-candidate** pool on *every* utterance, causing a universal
  multi-second latency regression — including on exact matches. Mostly **reverted the
  same day**; four commands kept on the new path.
- `ADR 0057` — a correction to the repo's *own* documentation: a described behavior
  had been "aspirationally true but not actually true in practice." The fuzzy layer
  had **zero candidates** the entire time.
- **Documented, unresolved hallucination risk:** on a fuzzy-match miss the local LLM
  can fabricate a plausible answer — confirmed live attempting a real (harmlessly
  failing) service call against a **made-up entity ID**. Partially mitigated for four
  commands; still open for the rest, and written down as open rather than papered over.

That last group is the section's centerpiece. Anyone can list model names. Very few
candidates can point to a documented latency regression they caused, diagnosed,
reverted within a day, and wrote up — plus a known failure mode they've declined to
pretend is solved.

### 10.1B Agentic IDE usage — verified 2026-09-16

The user uses **Roo Code** and **Cline** in VS Code; this is where DeepSeek and z.AI
live. Both extensions confirmed installed:
`rooveterinaryinc.roo-cline-3.54.0`, `saoudrizwan.claude-dev-4.1.17`.

**Roo Code task history — real, aggregated numbers** (parsed from 182
`history_item.json` files in
`%APPDATA%\Code\User\globalStorage\rooveterinaryinc.roo-cline\tasks\`):

| Metric | Value |
|---|---|
| Tasks | **182** |
| Tokens in | **402,499,872** |
| Tokens out | **6,016,434** |
| Total cost | **$18.90** |
| Delegated subtasks | **47** (tasks with `childIds` / `delegatedToId`) |

Modes used: `code` 145 · `orchestrator` 14 · `architect` 12 · `ask` 10 · `debug` 1.

**Two things here are worth putting on the site, and they're the strongest AI
numbers available:**

1. **402M tokens for $18.90.** That is a deliberate cost-engineering outcome — it is
   only reachable by routing bulk work to cheap providers (DeepSeek, z.AI GLM) and
   reserving expensive models for what needs them. Frame it as *model selection by
   cost and task*, which is exactly the "multi-model cost management" signal the
   §2 hiring research names. Don't state a per-model breakdown — the aggregate is
   what's verified.
2. **47 delegated subtasks across orchestrator/architect/code modes.** That's real
   multi-agent orchestration in practice, not a demo.

**Providers — each verified, with how:**

| Provider | Evidence |
|---|---|
| **DeepSeek** | Live API calls in Roo task history (`"DeepSeek completion error: 400"` — a real provider response, 49 occurrences) |
| **z.AI / GLM-5.3** | `%APPDATA%\Code\User\chatLanguageModels.json` — entries `Z.ai`, `z.ai`, `glm-5.3` |
| **Ollama** (via Roo) | `globalStorage/rooveterinaryinc.roo-cline/cache/ollama_models.json` |
| **OpenRouter** | `cache/openrouter_models.json` (both Roo and Cline) |
| **Requesty** | `cache/requesty_models.json` |
| **Vercel AI Gateway** | `cache/vercel-ai-gateway_models.json` |

Roo also has custom modes (`settings/custom_modes.yaml`) and MCP servers configured
(`settings/mcp_settings.json`); Cline has its own (`settings/cline_mcp_settings.json`).
MCP configuration across two extensions plus Claude Code is worth one line — it's the
current standard for tool-connected agents and shows the setup is maintained, not
installed once.

> **Privacy note for the implementing agent:** these paths are *evidence for this
> plan*. Do not copy raw task content, file paths, workspace names, or anything from
> `tasks/` into the website. Only the aggregate numbers above and the provider names
> are for publication.

### 10.2 Structure

`AI_PRACTICE` in `consts.ts` (+ `_SV`), rendered as an `#ai` section:

**Three lead cards** (reuse `.values-grid` / `.value-card` from About, or the
`.detail-list` pattern):

1. **Local, on my own hardware** — the seven-model Ollama stack on a 4090;
   CPU-only inference proven viable for the voice assistant before buying anything
2. **Cloud, chosen per job** — Claude Code, Codex, Gemini, Groq; picked by task, cost,
   and latency, with a **hard privacy boundary**: anything touching the house stays
   local, by design
3. **Agents as real tooling** — seven purpose-built subagents split into read-only
   reviewers / testers / implementers; per-repo `CLAUDE.md` + `AGENTS.md`; Maestro-
   driven on-device QA that actually looks at screenshots

Card 2 should now explicitly cover **model selection by cost and task** — the
402M-tokens-for-$18.90 figure (§10.1B) is the concrete proof, alongside the
local/cloud privacy boundary.

**Then the operating-evidence block** — 5–6 short items, each a real number with one
line of context. These are the section's payload:

| Figure | Context |
|---|---|
| `45–57s → ~5–6s` | scoping the model and prompt, not buying hardware |
| `768 candidates → same-day revert` | a latency regression I caused, found, and rolled back |
| `402M tokens · $18.90` | routing bulk work to cheap models, reserving the expensive ones |
| `182 tasks · 47 delegated` | real multi-agent orchestration, not a demo |
| `7 local models` | on my own GPU, plus CPU-only inference proven viable first |
| `1 known failure left open` | a documented hallucination risk I haven't solved |

Render as a compact grid of `--mono` figure + `--text-muted` caption. The last row
matters most — **keep it.** Volunteering an unsolved problem is the single most
credible thing on the page, and it's what separates this from a tool list.

**Then a compact tool strip** — monochrome, `currentColor`, same treatment as the
client logos. All verified (§10.1B):

*Local:* Ollama · *Agentic IDEs:* Roo Code, Cline, Claude Code, Codex, Gemini CLI ·
*Model providers:* Anthropic, OpenAI, DeepSeek, z.AI (GLM), Groq, OpenRouter

Drop LM Studio unless the user confirms it — it was not found on disk.

> ✅ **All tools now verified** (2026-09-16, second research pass — see §10.1B).
> Every name in the strip is backed by a config file, a cached model list, or a real
> API call in task history. Keep it that way: if a tool can't be pointed at, it
> doesn't go in the strip.

Tone: factual, no hype, no "AI-powered". The tradeoffs and the reverted mistake are
the point, not the tool count.

---

## 11. WP8 — Blog rewrites

Nine posts × 2 languages = 18 files. Per the user's decision: **rewrite all five
Turbo posts, delete none, redirect old slugs.**

### 11.1 Slug migration + redirects

| Old slug | New slug | Action |
|---|---|---|
| `turbo` | `cityroam` | rewrite + redirect |
| `turbo-tuya-free` | `cityroam-tuya-free` | rewrite + redirect |
| `turbo-physics` | `cityroam-physics` | rewrite + redirect |
| `turbo-website` | `cityroam-website-build` | rewrite + redirect |
| `turbo-navee` | `cityroam-multibrand` | **substantial** rewrite + redirect |

`cityroam-website-build` avoids colliding with the existing `cityroam-website` post
(which is about the marketing site's *design*; the rewritten one is about *building*
it). If that's too subtle, consider merging the two — but check with the user first,
since it means losing a post.

Add redirects in `astro.config.mjs`:

```js
redirects: {
  '/blog/turbo':           '/blog/cityroam',
  '/blog/turbo-tuya-free': '/blog/cityroam-tuya-free',
  // …and the /sv/blog/* equivalents
}
```

Verify redirects actually emit under the Cloudflare adapter with static output — if
they don't, fall back to small stub pages carrying a canonical link and a meta
refresh. **Test this; don't assume it works.**

Also update: `PROJECTS.turbo.blogSlug`, every cross-link between posts (several posts
link to each other, e.g. `turbo-navee.md` links to `/blog/turbo-tuya-free`), and
`rss.xml.js` if it hardcodes anything.

### 11.2 Applies to all five rewrites

- **Brand:** Turbo → Cityroam. Keep "Turbo" only for the ride mode, or when narrating
  the rename as history.
- **Images:** swap every stale `turbo-*` reference for the `cityroam-*` files from
  WP1. **Never reuse `turbo-dashboard.png`** (§1.3 — error banner, empty states).
- **Dead URL:** every `turboapp.casa-verde.casa` → `cityroam.casa-verde.casa`.
- **Frontmatter:** add `updatedDate` (the schema in `src/content.config.ts` already
  supports it, and `BlogPost.astro` already renders "last updated"). Keep the original
  `pubDate` — rewriting history would be dishonest and loses the timeline.
- **Repo links:** remove links to private repos from post bodies; use the
  private-source framing from §2 instead.
- **Figure captions:** each caption must describe the image now shown, not the one it
  replaced. This is a common way to half-finish an image swap.

### 11.3 `turbo.md` → `cityroam.md` (the flagship)

Most important post — it's linked from the homepage card. Needs the largest update:

- New hero: `cityroam-dashboard.jpg`
- Reframe from "an app for my skateboard" to **"a ride computer for electric boards
  and scooters"** — two brands, v4.3.0, closed beta, real users beyond the author
- Add what's shipped since the post was written: NAVEE multi-brand support, native
  ride recording surviving process death, offline-first local SQLite queue, in-app
  updater, home-screen widget, two-way Health Connect sync
- Add the rename story and why (trademark collision)

### 11.4 `turbo-physics` / `turbo-tuya-free` / `turbo-website`

Lighter touch — these are technically strong and mostly still accurate.

- **`cityroam-physics`** — hero → `cityroam-activity.jpg`. Copy is largely fine.
- **`cityroam-tuya-free`** — hero → `cityroam-settings.jpg`. Note that this pattern
  has now been applied **twice** (Tuya and NAVEE), which strengthens the argument
  considerably: it's a repeatable method, not one lucky reverse-engineering effort.
- **`cityroam-website-build`** — hero → `cityroam-live-homepage.png`. Update the dead
  `turboapp` URL and describe the Cityroam design system (skyline, route glyph, the
  two-tone city/roam wordmark, amber `#ffa63d` + route teal `#3fd6c8` on `#0D1015`) —
  documented in `cityroam-website/docs/cityroam-design-system.md`.

### 11.5 `turbo-navee.md` → `cityroam-multibrand.md` (substantial rewrite)

**This post currently argues the opposite of reality.** It's titled *"…why the app
deliberately hasn't started building it yet"* — but multi-brand support has shipped
and, per the user (2026-09-16), **is verified working on the real scooter**.

- **Delete `turbo-navee-logo.png`** — it's the old Turbo wordmark (§1.3), not NAVEE.
  Use a real screenshot (`cityroam-board-settings.jpg`) or the Cityroam mark instead.
  Do not substitute another logo that hasn't been verified.
- Rewrite from "why not yet" → **"what it took to actually ship a second brand"**
- Keep the genuinely strong original argument — there was no NAVEE SDK to wrap, so
  unlike Tuya this was raw reverse-engineering with no vendor path at all
- Add the real technical content (§5.2): the `0x30` challenge / `0x31`
  AES-128-ECB-**encrypted** response handshake; the widely-referenced third-party
  implementation that *decrypts* instead, and why following the official app's actual
  `Cipher.ENCRYPT_MODE` was what made it work; the connect→disconnect loop that
  resulted from stopping at the notification-enable step; and that reading standard
  characteristics the official app never touches triggers Android bonding and drops
  the link
- Cover the architecture: `ADR 0007 device-profile-abstraction` — per-brand modules
  only where protocols genuinely differ, with the session layer, dashboard, recorder,
  journal, widget, and notifications all shared unchanged
- **Do not re-introduce** the "not yet verified on the real scooter" caveat from
  `navee-4.2.0-field-fixes.md`; that doc is stale and the user has confirmed so.
  If you want to discuss the status of *individual* sub-features, ask the user first.

### 11.6 `casa-verde.md`

More than a light pass now that WP3B exists — this post is the destination all five
system cards link to.

- "80 ADRs" → **82**
- **Add an `<h2>` per system**, matching the five WP3B cards and in the same order, so
  each card can deep-link to a real anchor (`#media-automation`, `#smart-home`,
  `#game-server`, `#network-access`, `#deploy-platform`). Verify the generated slugs
  match the `href`s you write — don't assume.
- Expand the voice-assistant section with the §10.1 material (the 45–57s → ~5–6s fix,
  the 768-candidate regression and same-day revert, the open hallucination risk) and
  cross-link to the `#ai` section
- State once that ct110 hosts **Cityroam's backend**, linking the two flagship projects

### 11.7 Swedish posts

All nine SV posts mirror the EN ones and need identical treatment. **Translate, don't
machine-paste** — match the existing SV voice, which is natural, idiomatic Swedish,
not a literal rendering of the English. Compare an existing pair before writing.

---

## 12. WP9 — Verification

**Do not report this work as done based on "the build didn't error."** Check real
outcomes.

### 12.1 Build + types

```bash
npm run check      # astro build && tsc && wrangler deploy --dry-run
```

Must pass clean.

### 12.2 No dead links — the whole reason for this work

```bash
grep -rn "github.com/neowara/turbo\|github.com/neowara/casa-verde\|turboapp.casa-verde.casa" src/ public/ README.md
```

**Must return zero hits** outside of intentional historical prose. Then verify every
external URL that survives actually resolves:

```bash
curl -o /dev/null -w "%{http_code} %{url_effective}\n" -s <each-url>
```

### 12.3 No missing images

```bash
grep -rho 'src="/blog/[^"]*"\|heroImage: .[^'\'']*' src/content/blog/ \
  | sed "s/.*\(\/blog\/[^\"']*\).*/\1/" | sort -u \
  | while read p; do [ -f "public$p" ] || echo "MISSING: $p"; done
```

Must print nothing. Run the same check for `/logos/`, `/projects/`, and `/cv/`.

### 12.3B Anchors resolve

Every `#systems` card links into `/blog/casa-verde/#…` (WP3B.4, WP8.6). Build the
site and confirm each anchor target actually exists in the generated HTML — a
mismatched heading slug produces a link that silently lands at the top of the page.
Check the `/sv/` equivalents too, where the Swedish headings generate different slugs.

### 12.4 EN/SV parity

Every new section exists on both. Every new `consts.ts` export has an `_SV` twin.
Every new UI string is in both `ui.en` and `ui.sv`. Walk the SV site manually — this
is the most likely place for half-finished work to hide.

### 12.5 Runtime

- `/api/contributions.json` returns valid JSON with `npm run preview` (which runs
  `wrangler dev`, so the Worker route is actually exercised — `astro dev` alone may
  not represent Cloudflare behavior faithfully)
- The graph still renders with the API blocked (kill network / point the fetch at a
  bad host) — must silently use the fallback, never show an error
- All five redirected blog URLs resolve, in both languages
- Both PDFs download and open
- `/cv` and `/sv/cv` render, and Ctrl-P produces a clean page

### 12.6 Visual

- **Toggle light mode on every new section.** Logos, graph tints, and tiles all need
  checking — this is the most likely visual regression.
- Check 375px, 768px, 1280px. The contribution graph and the client-logo grid are the
  two things most likely to break narrow.
- Confirm no new font, no new accent color, no gradient crept in.

### 12.7 Review

Run the `code-reviewer` subagent over the diff before committing. For a change this
large, also consider a focused pass on the new Worker route (it's the only
runtime-executing code being added).

---

## 13. Suggested commit sequence

Do **not** land this as one commit. Suggested branch: `portfolio-2026-overhaul`.

1. `chore: add CV PDFs, Cityroam screenshots, and client logo assets` (WP1)
2. `refactor: restructure consts for clients, systems, AI practice, and CV data` (WP2)
3. `feat: rebrand Turbo to Cityroam and replace dead repo links` (WP3.1–3.2, WP4)
4. `feat: break casa-verde out into five named systems` (WP3B)
5. `feat: add client and platform context to the experience timeline` (WP3.3)
6. `feat: add GitHub contribution graph with a cached Worker route` (WP5)
7. `feat: add CV download section and an HTML resume page` (WP6)
8. `feat: add a section on working with local and cloud AI` (WP7)
9. `content: rewrite the Turbo posts as Cityroam and fix stale imagery` (WP8)
10. `docs: update README for the new sections` (WP9)

Deployment is automatic: Cloudflare's Git integration builds on every push to `main`
(no GitHub Actions workflow in this repo). **After merging, verify the live site**,
don't assume the build succeeded — check the Cloudflare Deployments tab and then load
`https://christian-toledo.casa-verde.casa` and hit the new sections.

---

## 14. Open questions for the user

Resolved 2026-09-16: ~~DeepSeek/z.AI~~ (verified via Roo Code and Cline, §10.1B) ·
~~NAVEE sub-features~~ (all working, §5.2) · ~~CV corrections~~ (§4.1).

Still open — don't guess:

1. **Medieinstitutet start date** (§4.1) — the plan uses **Aug 2018**, reasoning that
   it matches the two-year YH programme length. The English PDF says 2017. Needs a
   one-word confirmation from the user.
2. **Both CV PDFs need regenerating** (§4.1) with the ED Insights fix and the agreed
   date. This agent cannot edit the generated PDFs.
3. **Client logo permission** — nominative fair use plus the disclaimer is a
   reasonable position, but if any consulting contract or NDA restricts naming
   clients publicly, that overrides it. Worth a check, especially for Inera/1177.
4. **Merging the two Cityroam website posts** (§11.1) — keep both, or combine?
5. **Systems section placement** (WP3B) — this plan puts the five system cards in
   their own `#systems` section *below* the two flagship project cards, keeping a
   clear hierarchy. The alternative is one flat seven-card grid. The split is
   recommended (it preserves "two deep projects" while still showing the breadth),
   but flag it for the user to confirm once it's on screen — it's a layout call
   that's much easier to judge rendered than described.

---

## 15. Sources

Hiring/portfolio research:
- [Building a Developer Portfolio in 2026 — SimeonOnSecurity](https://simeononsecurity.com/software-development-career-playbook/getting-started-in-software-development/building-a-developer-portfolio)
- [How to Build a Developer Portfolio That Actually Gets You Hired (2026) — DEV](https://dev.to/__be2942592/how-to-build-a-developer-portfolio-that-actually-gets-you-hired-2026-6kn)
- [Developer Portfolio Guide 2026 — Codeboards](https://codeboards.io/blog/developer-portfolio-guide-2026)
- [Showcase Agentic AI Development on Your Resume: 2026 Guide — Underdog](https://underdog.io/blog/agentic-ai-development-on-your-resume)
- [AI Developer Hiring 2026: Skills That Actually Matter — Digital Applied](https://www.digitalapplied.com/blog/ai-developer-hiring-skills-that-matter-2026)

Contribution graph:
- [grubersjoe/github-contributions-api](https://github.com/grubersjoe/github-contributions-api)
- [A Guide to Display Your GitHub Contribution Graph on Your Personal Website — Hailey Cheng](https://heilcheng.github.io/blog/github-contribution-graph-guide/)
- [Astro component for a GitHub contribution graph — larocque.dev](https://www.larocque.dev/projects/github-contribution-astro-component/)

Astro / Cloudflare:
- [On-demand rendering — Astro Docs](https://docs.astro.build/en/guides/on-demand-rendering/)
- [@astrojs/cloudflare — Astro Docs](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)

Logo/trademark:
- [Nominative use — Wikipedia](https://en.wikipedia.org/wiki/Nominative_use)
- [Can I Use Their Logo? Understanding Nominative Fair Use — Chase Law Group](https://chaselawmb.com/nominative-fair-use/)
- [Can I Use Client Logos on My Website? The 3-Factor Test — Testimonials.io](https://testimonials.io/blog/can-i-use-client-logos-on-my-website)
