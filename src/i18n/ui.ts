import type { Lang } from "./paths";

export const ui = {
  en: {
    nav: { work: "Work", blog: "Blog", about: "About", cv: "CV" },
    footer: {
      tagline: "Full-stack engineer · Gothenburg, Sweden",
      site: "Site",
      home: "Home",
      about: "About",
      blog: "Blog",
      cv: "CV",
      projects: "Projects",
      connect: "Connect",
      email: "Email",
      copyright: (year: number) => `© ${year} Christian Toledo.`,
    },
    blogList: {
      eyebrow: "Blog",
      title: "Writing",
      description:
        "Deep dives into the systems from the homepage: how they actually work, what went wrong along the way, and why.",
    },
    blogPost: {
      backToBlog: "← Back to blog",
      lastUpdated: "last updated on",
    },
    systems: {
      eyebrow: "Systems",
      title: "Five systems, one platform.",
      description:
        "casa-verde isn't one project. It's a Proxmox host and a deploy pipeline that five separate systems run on, each with its own stack, its own failure modes, and its own entries in the decision log.",
      readMore: "How it works →",
    },
    clients: {
      label: "Clients & platforms",
      disclaimer:
        "Client work delivered through Nexer AB and Dear Friends. Logos and names are trademarks of their respective owners, shown to identify projects I contributed to — not an endorsement.",
    },
    ai: {
      eyebrow: "AI",
      title: "How I actually work with AI.",
      description:
        "Not a list of models I've heard of. This is what I run, what I decided and why, what it costs, and the one part of it I haven't solved yet.",
      figuresLabel: "In practice",
      toolsLabel: "What I run",
    },
    github: {
      eyebrow: "Activity",
      title: "Still building, most days.",
      description:
        "Professional work and personal projects, in public and private repositories.",
      contributions: (n: number) =>
        `${n.toLocaleString("en-GB")} contributions in the last year`,
      /** Same string with an {n} placeholder, for client-side re-rendering. */
      contributionsTemplate: "{n} contributions in the last year",
      locale: "en-GB",
      profileLink: "View GitHub profile ↗",
      stale: "Showing the last saved snapshot — live data is temporarily unavailable.",
      months: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      weekdays: ["Mon", "Wed", "Fri"],
      less: "Less",
      more: "More",
      graphLabel: (n: number) =>
        `GitHub contribution graph: ${n.toLocaleString("en-GB")} contributions in the last year.`,
    },
    cv: {
      eyebrow: "CV",
      title: "Want it on paper?",
      description:
        "The full CV, in English or Swedish. The online version is the same content, but easier to read on a phone and always the most current.",
      viewOnline: "View CV online →",
      download: (lang: string) => `↓ ${lang} (PDF)`,
      meta: "PDF · 3 pages",
      pageTitle: "CV",
      profile: "Profile",
      experience: "Experience",
      skills: "Skills",
      earlyRoles: "Earlier roles",
      education: "Education",
      internships: "Internships",
      languages: "Languages",
      references: "References",
      clientsLabel: "Clients",
      backHome: "← Back to the homepage",
      print: "Print / save as PDF",
    },
  },
  sv: {
    nav: { work: "Projekt", blog: "Blogg", about: "Om mig", cv: "CV" },
    footer: {
      tagline: "Fullstackutvecklare · Göteborg, Sverige",
      site: "Sajt",
      home: "Hem",
      about: "Om mig",
      blog: "Blogg",
      cv: "CV",
      projects: "Projekt",
      connect: "Kontakt",
      email: "E-post",
      copyright: (year: number) => `© ${year} Christian Toledo.`,
    },
    blogList: {
      eyebrow: "Blogg",
      title: "Inlägg",
      description:
        "Djupdykningar i systemen från startsidan: hur de faktiskt fungerar, vad som gick fel på vägen, och varför.",
    },
    blogPost: {
      backToBlog: "← Tillbaka till bloggen",
      lastUpdated: "senast uppdaterad",
    },
    systems: {
      eyebrow: "System",
      title: "Fem system, en plattform.",
      description:
        "casa-verde är inte ett projekt. Det är en Proxmox-värd och en deploypipeline som fem separata system körs på, vart och ett med sin egen stack, sina egna felfall och sina egna poster i beslutsloggen.",
      readMore: "Så fungerar det →",
    },
    clients: {
      label: "Kunder och plattformar",
      disclaimer:
        "Kunduppdrag utförda via Nexer AB och Dear Friends. Logotyper och namn tillhör respektive varumärkesinnehavare och visas för att identifiera projekt jag bidragit till — inte som något godkännande.",
    },
    ai: {
      eyebrow: "AI",
      title: "Hur jag faktiskt arbetar med AI.",
      description:
        "Inte en lista på modeller jag hört talas om. Det här är vad jag kör, vad jag valt och varför, vad det kostar, och den enda delen jag ännu inte löst.",
      figuresLabel: "I praktiken",
      toolsLabel: "Vad jag kör",
    },
    github: {
      eyebrow: "Aktivitet",
      title: "Bygger fortfarande, de flesta dagar.",
      description:
        "Kunduppdrag och egna projekt, i både publika och privata repon.",
      contributions: (n: number) =>
        `${n.toLocaleString("sv-SE")} bidrag det senaste året`,
      /** Samma sträng med en {n}-platshållare, för omrendering på klienten. */
      contributionsTemplate: "{n} bidrag det senaste året",
      locale: "sv-SE",
      profileLink: "Visa GitHub-profilen ↗",
      stale: "Visar senast sparade ögonblicksbild — livedata är tillfälligt otillgänglig.",
      months: [
        "jan",
        "feb",
        "mar",
        "apr",
        "maj",
        "jun",
        "jul",
        "aug",
        "sep",
        "okt",
        "nov",
        "dec",
      ],
      weekdays: ["mån", "ons", "fre"],
      less: "Mindre",
      more: "Mer",
      graphLabel: (n: number) =>
        `GitHubs bidragsgraf: ${n.toLocaleString("sv-SE")} bidrag det senaste året.`,
    },
    cv: {
      eyebrow: "CV",
      title: "Vill du ha det på papper?",
      description:
        "Hela CV:t, på svenska eller engelska. Webbversionen har samma innehåll, men är lättare att läsa i mobilen och alltid den mest aktuella.",
      viewOnline: "Visa CV:t online →",
      download: (lang: string) => `↓ ${lang} (PDF)`,
      meta: "PDF · 3 sidor",
      pageTitle: "CV",
      profile: "Profil",
      experience: "Arbetslivserfarenhet",
      skills: "Färdigheter",
      earlyRoles: "Tidigare roller",
      education: "Utbildning",
      internships: "Praktik",
      languages: "Språk",
      references: "Referenser",
      clientsLabel: "Kunder",
      backHome: "← Tillbaka till startsidan",
      print: "Skriv ut / spara som PDF",
    },
  },
} as const;

export function t(lang: Lang) {
  return ui[lang];
}
