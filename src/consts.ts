// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = "Christian Toledo";
export const SITE_DESCRIPTION = "Web Developer | Full-Stack Engineer | Infrastructure Enthusiast";
export const GITHUB_URL = "https://github.com/neowara";
export const LINKEDIN_URL = "https://www.linkedin.com/in/christiantm/";
export const EMAIL = "christiantoledo@live.com";

// Project Configuration - Easy status management
export const PROJECTS = {
  jellyfin: {
    name: "Jellyfin Media Server",
    description: "Self-hosted media server with custom metadata management and optimized streaming.",
    url: "https://jellyfin.casa-verde.casa",
    status: "production", // "production" | "development" | "maintenance"
  },
  navidrome: {
    name: "Navidrome Music",
    description: "Music streaming server managing 15,000+ track library with efficient organization.",
    url: "https://navidrome.casa-verde.casa",
    status: "production",
  },
  immich: {
    name: "Immich Photo Backup",
    description: "Photo management solution handling 50GB+ of personal archives with automated backups.",
    url: "https://immich.casa-verde.casa",
    status: "development",
  },
  homeassistant: {
    name: "Home Assistant",
    description: "Home automation system with custom scripts integrating various smart home devices.",
    url: "https://homeassistant.casa-verde.casa",
    status: "production", // Change this to toggle status easily!
  },
} as const;

// Status display configuration
export const STATUS_CONFIG = {
  production: {
    label: "Production",
    color: "var(--neon-green)",
  },
  development: {
    label: "In Development",
    color: "var(--neon-yellow)",
  },
  maintenance: {
    label: "Maintenance",
    color: "var(--neon-orange)",
  },
} as const;
