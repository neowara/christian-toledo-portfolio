---
title: 'This website: the design decisions behind a portfolio that behaves like a product'
description: 'Why this site is a static Astro build with a dark-first engineering-notebook aesthetic, how the content is structured to prove how I work rather than just claim it, and the small design rules that keep it coherent.'
pubDate: 'Sep 04 2026'
heroImage: '/og-image.png'
---

This site is a portfolio, but I didn't want it to feel like one. Most portfolios are a gallery of screenshots and a list of tech names, and they end up proving very little about how the person behind them actually works. This one is built around a different idea: the site itself should behave like a product I'd ship at work, and the content should demonstrate the habits I claim to have, not just describe them.

So this post is a bit of a meta one. It's about the website you're reading right now, and the reasoning behind how it's put together.

## A static site, deliberately

The whole thing is a static Astro build, deployed to Cloudflare Workers. There's no database, no server-side state, no build-time magic beyond what Astro gives you for free. That's a choice, not a limitation.

A portfolio has almost no dynamic requirements. It's a handful of pages, two languages, and a small blog. Reaching for a heavy framework or a CMS for that would be exactly the kind of over-engineering I argue against in the rest of my work. Static output means the site is fast by construction, cheap to host, and has almost no attack surface. The only "infrastructure" is a content pipeline: Markdown files in `src/content/blog/`, one per post, in both English and Swedish, validated against a schema at build time.

The bilingual setup is worth calling out. Every page and every blog post exists in both `en` and `sv`, and the routing mirrors that (`/blog/...` and `/sv/blog/...`). Keeping the two in sync is a discipline problem, not a technical one, and it's the same discipline I bring to keeping documentation current in a real codebase.

## The "engineering notebook" aesthetic

The visual design is built around one idea I kept coming back to: this site should look like an engineering notebook, not a marketing page. That single constraint resolved a lot of smaller decisions.

Dark by default, with one accent color. The accent is a warm amber, used sparingly: eyebrows, node dots, the occasional border. Monospace is reserved for metadata and labels, never for body copy. There's no glow, no neon, no clip-path decoration, nothing that screams "look at my design skills." The restraint is the point. A notebook is a tool, and tools should get out of the way.

The typography is Atkinson Hyperlegible, chosen for legibility rather than fashion, with JetBrains Mono for the code-flavored labels. Even the little touches reinforce the theme: section eyebrows read like file paths, and the "How I work" section renders its four values as nodes joined by a line, like a small diagram you'd sketch in the margin.

## Content that proves the claims

The homepage leads with two systems, Turbo and casa-verde, and each has a deep-dive blog post that goes into the actual engineering: reverse-engineering a Bluetooth protocol, fitting a physics model to range data, running a home lab with written ADRs. These aren't "look what I made" posts. They're evidence for the claims in the About section, that I write things down and that I care about the edge cases.

That's the structural trick. The About page states values like "writes things down" and "genuinely self-driven," and the rest of the site is arranged so those claims are checkable. The decision log for casa-verde isn't just mentioned, it's linked. The "When I'm not coding" section shows the hobbies that feed back into the work, an electric skateboard that became an Android app, a home lab that became a lesson in infrastructure.

## Small rules that keep it coherent

A few design rules carry the whole thing and are worth writing down because they're the kind of thing that keeps a small site from drifting:

- **One accent color, used with intent.** If something needs to stand out, it gets the amber. Everything else stays in the neutral scale.
- **Monospace means metadata.** Dates, tags, labels, file-path eyebrows. Body copy is never monospace.
- **Cards and borders do the layout work.** No heavy shadows or gradients; elevation is communicated with background tones and hairline borders.
- **Everything has a reason.** If a section or a style doesn't earn its place, it doesn't stay.

## Why bother

It would have been faster to throw a template at this and call it done. But the site is the one artifact where I have total control over both the code and the content, so it's the place to show what I actually value: restraint over decoration, evidence over claims, and the fundamentals right before anything else. That's the same standard I'd want to hold any codebase I work in to, and it felt right to hold this one to it too.
