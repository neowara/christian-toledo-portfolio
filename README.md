# Christian Toledo — Portfolio

Personal portfolio site: selected work (Turbo, casa-verde), experience, about, and a
blog with long-form deep dives on each project.

## 🚀 Tech Stack

- **Framework**: Astro 5.7
- **Styling**: Custom CSS, dark-default with a single accent color and monospace
  accents ("engineering notebook" theme, no UI framework/component library)
- **Deployment**: Cloudflare Workers, auto-built on every push to `main` via
  Cloudflare's own Git integration (see the project's Deployments tab in the
  Cloudflare dashboard) — no GitHub Actions workflow in this repo
- **Content**: Markdown/MDX blog posts via Astro content collections

## 🎨 Design

Dark-mode-default (toggleable, persisted in `localStorage`), one accent color
(amber), a humanist sans (Atkinson Hyperlegible, self-hosted) for body copy and
JetBrains Mono for small metadata (tags, dates, nav labels) only. Flat bordered
cards with a subtle hover lift, no glow/scanline effects, no clipped corners.

A static, framework-free prototype of this design lives in [`prototype/`](prototype/)
(`prototype/index.html` etc.) — open it directly in a browser to preview the design
system in isolation before touching the real Astro pages.

## 📁 Project Structure

```
/
├── prototype/              # Static HTML/CSS prototype of the design (no build step)
├── public/                 # Static assets
│   ├── fonts/              # Self-hosted Atkinson Hyperlegible (woff)
│   ├── blog/                # Images referenced by blog posts (screenshots, diagrams)
│   ├── og-image.png         # Default social share card (see scripts/og-image.svg)
│   └── favicon.svg          # Site favicon (c.t monogram)
├── scripts/
│   └── og-image.svg          # Source for public/og-image.png (regenerate with sharp, see below)
├── src/
│   ├── components/         # Header, Footer, BaseHead, HeaderLink, FormattedDate
│   ├── content/
│   │   └── blog/            # Blog posts in Markdown (turbo.md, casa-verde.md)
│   ├── layouts/             # BlogPost.astro
│   ├── pages/               # index, about, blog/
│   ├── styles/               # global.css — the design system/tokens
│   └── consts.ts             # Site config: profile links, PROJECTS, EXPERIENCE
└── package.json
```

## 🧞 Commands

All commands are run from the root of the project:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally before deploying      |
| `npm run deploy`          | Manually deploy to Cloudflare (not normally needed, see Deployment below) |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run check`           | Type-check and dry-run deployment                |

## 📝 Adding blog posts

Create a new `.md` file in `src/content/blog/`:

```md
---
title: 'Your Post Title'
description: 'Post description'
pubDate: 'Sep 03 2026'
heroImage: '/blog/your-image.png'
---

Your content here...
```

The file name becomes the post's slug (`turbo.md` → `/blog/turbo/`). If a post is
also featured as a project card on the homepage, its slug must match the
`blogSlug` set for that project in `src/consts.ts`. `heroImage` is used both as the
post's banner and, if it isn't an SVG, as that page's social-share card image (see
`src/layouts/BlogPost.astro`) — SVG hero images fall back to the default
`public/og-image.png` instead, since most link-unfurlers don't render SVG previews.

## 🖼️ Regenerating the social-share image

`public/og-image.png` is rendered from `scripts/og-image.svg` via `sharp` (already a
project dependency):

```bash
node -e "require('sharp')('scripts/og-image.svg').png().toFile('public/og-image.png')"
```

Edit the SVG, re-run the command above, and check the result before committing.

## 🌐 Deployment

Live at [christian-toledo.casa-verde.casa](https://christian-toledo.casa-verde.casa),
served from a Cloudflare Worker (`project-casa-verde`) that's connected directly to
this GitHub repo's `main` branch — **pushing to `main` deploys automatically**, no
manual step or CI workflow required. Check the Deployments tab in the Cloudflare
dashboard to confirm a push has built and gone live.

## 📄 License

© 2026 Christian Toledo. All rights reserved.

---

Built with [Astro](https://astro.build) and deployed on [Cloudflare Workers](https://workers.cloudflare.com/).
