import type { Lang } from "./paths";

export const ui = {
  en: {
    nav: { work: "Work", blog: "Blog", about: "About" },
    footer: {
      tagline: "Full-stack engineer · Göteborg, Sweden",
      site: "Site",
      home: "Home",
      about: "About",
      blog: "Blog",
      projects: "Projects",
      connect: "Connect",
      email: "Email",
      copyright: (year: number) => `© ${year} Christian Toledo.`,
    },
    blogList: {
      eyebrow: "Blog",
      title: "Writing",
      description:
        "Deep dives into the two systems from the homepage: how they actually work, what went wrong along the way, and why.",
    },
    blogPost: {
      backToBlog: "← Back to blog",
      lastUpdated: "last updated on",
    },
  },
  sv: {
    nav: { work: "Projekt", blog: "Blogg", about: "Om mig" },
    footer: {
      tagline: "Fullstackutvecklare · Göteborg, Sverige",
      site: "Sajt",
      home: "Hem",
      about: "Om mig",
      blog: "Blogg",
      projects: "Projekt",
      connect: "Kontakt",
      email: "E-post",
      copyright: (year: number) => `© ${year} Christian Toledo.`,
    },
    blogList: {
      eyebrow: "Blogg",
      title: "Inlägg",
      description:
        "Djupdykningar i de två systemen från startsidan: hur de faktiskt fungerar, vad som gick fel på vägen, och varför.",
    },
    blogPost: {
      backToBlog: "← Tillbaka till bloggen",
      lastUpdated: "senast uppdaterad",
    },
  },
} as const;

export function t(lang: Lang) {
  return ui[lang];
}
