// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = "Christian Toledo";
export const SITE_DESCRIPTION = "Full-stack engineer based in Göteborg, Sweden. I build production frontends by day, and build and operate real systems, hardware-connected apps and a homelab run like production, on my own time.";
export const GITHUB_URL = "https://github.com/neowara";
export const LINKEDIN_URL = "https://www.linkedin.com/in/christiantm/";
export const EMAIL = "christiantoledo@live.com";

// Selected work, shown on the homepage.
export const PROJECTS = {
  turbo: {
    name: "Turbo",
    tag: "// mobile + backend",
    pitch: "An Android app and self-hosted backend for tracking rides on a modified electric skateboard, with direct Bluetooth control of the board itself, not just GPS logging.",
    icon: "/blog/turbo-logo.png",
    repoLinks: [
      { label: "App repo", url: "https://github.com/neowara/turbo" },
      { label: "Backend repo", url: "https://github.com/neowara/turbo-backend" },
    ],
    blogSlug: "turbo",
    details: [
      { title: "Direct BLE, no cloud dependency", body: "reverse-engineered the board's Bluetooth protocol to read and write live telemetry and settings directly, battery, voltage, ride mode, acceleration curves, bypassing Tuya Cloud entirely." },
      { title: "Physics-based range estimation", body: "the backend fits a per-mode model of rolling resistance, aerodynamic drag, and drivetrain efficiency from real ride history, instead of a linear battery-percent guess." },
      { title: "Clean GPS from noisy hardware", body: "raw phone GPS gets road-snapped through a self-hosted OSRM instance and enriched with weather, so a route doesn't visibly cut through buildings." },
      { title: "Real auth, not a shared token", body: "per-user accounts, argon2id password hashing, session-based API access, and an admin panel for account and data management." },
    ],
    stack: ["Expo / React Native", "TypeScript", "Bluetooth LE", "FastAPI", "SQLModel", "Alembic", "OSRM", "Docker"],
  },
  casaVerde: {
    name: "casa-verde",
    tag: "// infrastructure",
    pitch: "A home lab run with the same rigor as production infrastructure: not a pile of Docker containers, a system with a documented history of every real decision behind it.",
    repoLinks: [
      { label: "Repo", url: "https://github.com/neowara/casa-verde" },
    ],
    blogSlug: "casa-verde",
    details: [
      { title: "~10 services on one Proxmox host", body: "media automation, a photo/music library, DNS, a self-hosted voice assistant, a modded game server, each isolated in its own LXC container." },
      { title: "Infra as code, deliberately split", body: "Ansible for most stacks, GitOps (Komodo) for the ones where webhook-speed redeploys are worth the added complexity, chosen per stack, not dogmatically." },
      { title: "80+ written ADRs", body: "every non-trivial decision, including the ones that didn't work and had to be reverted, has a documented reason, not just a diff." },
      { title: "Actually monitored", body: 'daily drift detection against git, automated backups, and real alerting (ntfy) for failures, not just "the container is still running."' },
    ],
    stack: ["Proxmox / LXC", "Ansible", "Docker Compose", "Komodo (GitOps)", "Cloudflare Tunnel", "Home Assistant"],
  },
} as const;

// Experience timeline, shown on the homepage.
export const EXPERIENCE = [
  {
    role: "Fullstack Developer (Consultant)",
    org: "Dear Friends",
    dates: "Jan 2026 to Jun 2026",
    bullets: [
      "Built and shipped the <strong>Nordic Wellness</strong> React Native apps with Expo, pulling live content and pricing from the Umbraco Delivery API",
      "Owned the release process end to end: weekly builds, TestFlight, Google Play Console, on-device testing before each public release",
      "Built and maintained Umbraco (.NET) sites for Nordic Wellness, Grand Fitness, and Fred's Food and Coffee, plus WordPress upkeep for several other agency clients",
    ],
    stack: ["React Native", "Expo", "Umbraco", "C# / .NET", "WordPress", "PHP", "TypeScript"],
  },
  {
    role: "Fullstack Developer (Consultant)",
    org: "Nexer AB",
    dates: "Feb 2023 to Mar 2025",
    bullets: [
      "Sole developer on a <strong>React Native app for Göteborgs Stadsmission</strong>, connecting surplus-food donors with people in need across Gothenburg",
      "Built an internal React tool for <strong>PostNord</strong> used to plan postal delivery routes across Sweden",
      "Contributed to <strong>Inera's 1177</strong> public health platform (Optimizely + Angular) as part of a larger development team",
      "Worked with backend developers on REST APIs and .NET integrations, and supported junior developers on React and TypeScript",
    ],
    stack: ["React", "TypeScript", "React Native", "Optimizely 11/12", "SASS", ".NET Core", "C#", "SQL Server", "Azure DevOps"],
  },
  {
    role: "Front-End Developer",
    org: "Nordic Retail Group (prev. Digital People)",
    dates: "Dec 2020 to Jan 2023",
    bullets: [
      "Sole frontend developer on <strong>Enginio</strong>, a Vue.js platform for building advertising campaigns and brand activations, from early startup through acquisition",
      "Built a reusable <strong>Vue.js component library in Storybook</strong>, and owned frontend architecture, tooling, and CI/CD",
      "Cut initial load time from <strong>4.2s to 1.8s</strong> through lazy loading and bundle optimization",
    ],
    stack: ["Vue.js", "Vuex", "SASS", "Node.js", "Express", "MongoDB", "Cypress", "Storybook", "Figma"],
  },
  {
    role: "Front-End Developer Intern",
    org: "Plejd AB",
    dates: "2019 to 2020",
    bullets: [
      "Worked in a professional, 100,000+ line Angular.js/Vue.js codebase at a Swedish smart-home hardware company, building internal tools used by 50+ employees daily. My first real production codebase, alongside studying front-end development at Medieinstitutet",
    ],
    stack: ["Angular.js", "Vue.js", "Figma"],
  },
] as const;
