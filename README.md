# Christian Toledo - Portfolio

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/astro-blog-starter-template)

Personal portfolio website showcasing web development projects and self-hosted infrastructure.

## 🚀 Tech Stack

- **Framework**: Astro 5.7
- **Styling**: Custom CSS with cyberpunk theme
- **Deployment**: Cloudflare Workers
- **Content**: MDX for blog posts

## 🎨 Design

Cyberpunk-themed design featuring:
- Dark backgrounds with neon accent colors (cyan #00FFFF, magenta #FF00FF, purple #B026FF)
- Glowing text effects and gradient animations
- Grid-based background patterns with pulsing effects
- Fully responsive design for all screen sizes
- Interactive cards and buttons with hover effects

## 📁 Project Structure

```
/
├── public/                 # Static assets
│   ├── fonts/             # Custom fonts (Atkinson)
│   └── favicon.svg        # Site favicon
├── src/
│   ├── components/        # Reusable components (Header, Footer, etc.)
│   ├── content/
│   │   └── blog/         # Blog posts in Markdown/MDX
│   ├── layouts/          # Page layouts (BlogPost, etc.)
│   ├── pages/            # Route pages (index, about, blog)
│   ├── styles/           # Global cyberpunk theme CSS
│   └── consts.ts         # Site configuration constants
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
| `npm run deploy`          | Deploy your production site to Cloudflare        |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run check`           | Type-check and dry-run deployment                |

## 📝 Adding Blog Posts

Create a new `.md` or `.mdx` file in `src/content/blog/`:

```md
---
title: 'Your Post Title'
description: 'Post description'
pubDate: 'MMM DD YYYY'
heroImage: '/optional-image.jpg'
---

Your content here...
```

Blog posts will automatically appear in the `/blog` section with the cyberpunk theme styling.

## 🖼️ Adding Images

**Important**: To display the photo on the About page, add your personal images to the `public/` folder:

```bash
# Add this image for the About page
public/me_and_riki.jpg    # Photo with Riki
```

Any images placed in `public/` can be referenced in your code with a leading `/`:

```astro
<img src="/me_and_riki.jpg" alt="Description" />
```

## 🌐 Infrastructure

This portfolio is part of a larger self-hosted infrastructure ecosystem:

- **Portfolio**: [christian-toledo.casa-verde.casa](https://christian-toledo.casa-verde.casa)
- **Jellyfin Media Server**: [jellyfin.casa-verde.casa](https://jellyfin.casa-verde.casa)
- **Navidrome Music**: [navidrome.casa-verde.casa](https://navidrome.casa-verde.casa)
- **Immich Photos**: [immich.casa-verde.casa](https://immich.casa-verde.casa)

All services run on Proxmox with LXC containers, managed via terminal with Nginx reverse proxy and automated SSL certificates.

## 🎯 Features

- ✅ Fully responsive cyberpunk-themed design
- ✅ Homepage with hero section, skills showcase, and project highlights
- ✅ About page with personal bio and photo
- ✅ Blog section for technical writing
- ✅ SEO-friendly with proper meta tags
- ✅ Fast performance with Astro's static site generation
- ✅ Deployed on Cloudflare Workers for global edge distribution

## 🛠️ Configuration

Update site settings in `src/consts.ts`:

```ts
export const SITE_TITLE = "Christian Toledo";
export const SITE_DESCRIPTION = "Web Developer | Full-Stack Engineer | Infrastructure Enthusiast";
export const GITHUB_URL = "https://github.com/christiantoledo";
export const LINKEDIN_URL = "https://linkedin.com/in/christian-toledo";
export const EMAIL = "christiantoledo@live.com";
```

## 📄 License

© 2025 Christian Toledo. All rights reserved.

---

Built with [Astro](https://astro.build) and deployed on [Cloudflare Workers](https://workers.cloudflare.com/).
