// Structured résumé data backing /cv and /sv/cv.
//
// Experience is NOT duplicated here — the /cv page renders EXPERIENCE/EXPERIENCE_SV
// from ./experience.ts directly, so the homepage timeline and the CV page cannot
// drift apart. This file holds only what the CV needs and the homepage doesn't:
// profile, skills, education, internships, languages.
//
// Two corrections applied here relative to the source PDFs (user-approved 2026-09-16,
// "update the CVs to match"):
//
//   1. ED Insights — the Swedish PDF's entry wrongly describes Posifon, duplicating
//      the Posifon entry below it. The English PDF is correct and is what's used here
//      for both languages.
//   2. Medieinstitutet — the PDFs disagree (EN says 2017, SV says 2018). Using
//      Aug 2018: it matches the two-year length of the programme and follows on from
//      Ljungskile ending Jan 2017. FLAGGED FOR CONFIRMATION — if 2017 is correct this
//      is a one-line change.
//
// Both PDFs in /public/cv/ still contain the uncorrected text; they're generated
// exports and need regenerating in whatever tool produced them.

export interface CvEntry {
  title: string;
  org: string;
  dates: string;
  body?: string;
  bullets?: string[];
  stack?: string;
}

export interface SkillGroup {
  label: string;
  skills: string[];
}

export interface CvData {
  /** Shown at the top of /cv. City + email only — no street address or phone. */
  headline: string;
  profile: string[];
  skillGroups: SkillGroup[];
  /**
   * Part-time student jobs. They belong on a CV but not on the homepage timeline,
   * which is why they live here rather than in EXPERIENCE.
   */
  earlyRoles: CvEntry[];
  education: CvEntry[];
  internships: CvEntry[];
  languages: { name: string; level: string }[];
  /** Rendered as a dim meta line next to the download buttons. */
  updated: string;
  references: string;
}

export const CV: CvData = {
  headline: "Web Developer · Gothenburg, Sweden",
  profile: [
    "Web developer with close to seven years in the JavaScript and TypeScript ecosystem, after studying web development in Gothenburg. I've worked across both ends of the industry: product companies building one thing over years, and consultancies moving between several clients at once.",
    "I work across the whole stack — React, Vue and Angular on the front end, Node, .NET and PHP on the back end, React Native for mobile — and I'm comfortable owning a feature from the first commit through to production. That range runs from small static sites to large web applications, for clients including PostNord, Nordic Wellness, and Inera (the 1177 healthcare platform).",
    "On the frontend I care about design and UX, not only how things work. Outside work I run a home lab for the tools I actually use, and spend a lot of my free time following new tech, especially AI. Originally from Cuba, based in Gothenburg.",
  ],
  skillGroups: [
    {
      label: "Languages",
      skills: ["JavaScript", "TypeScript", "C#", "PHP", "Kotlin", "Python", "SQL"],
    },
    {
      label: "Frontend",
      skills: [
        "React",
        "Vue.js",
        "Angular",
        "Redux",
        "Vuex",
        "SASS",
        "Tailwind CSS",
        "Storybook",
        "HTML",
        "CSS",
      ],
    },
    {
      label: "Backend",
      skills: [
        "Node.js",
        "Express",
        ".NET (Core)",
        "FastAPI",
        "REST APIs",
        "MongoDB",
        "MySQL",
        "SQL Server",
      ],
    },
    {
      label: "Mobile",
      skills: ["React Native", "Expo", "Health Connect", "Bluetooth LE"],
    },
    {
      label: "CMS & platforms",
      skills: ["Umbraco", "Optimizely 11/12", "WordPress", "Astro"],
    },
    {
      label: "Infrastructure",
      skills: [
        "Docker",
        "Ansible",
        "Proxmox / LXC",
        "Cloudflare Workers",
        "Microsoft Azure",
        "GitHub Actions",
        "YAML",
      ],
    },
    {
      label: "Ways of working",
      skills: [
        "Agile methodologies",
        "Code review",
        "CI/CD",
        "Cypress",
        "Figma",
        "Git",
        "Azure DevOps",
        "Jira",
        "UI / UX",
      ],
    },
  ],
  earlyRoles: [
    {
      title: "Front-End Developer (Part-Time)",
      org: "ED Insights AS, Gothenburg",
      dates: "Jan 2018 to Jan 2019",
      // NOTE: the Swedish source PDF describes Posifon in this entry by mistake.
      // This is the correct ED Insights text, taken from the English PDF.
      body: "A part-time job alongside my studies, building a static website for ED Insights in WordPress.",
      bullets: [
        "Designed a UI prototype in Figma together with the customer",
        "Developed and maintained a WordPress theme with custom JavaScript, HTML and CSS",
      ],
      stack: "WordPress, JavaScript, HTML, CSS, Figma",
    },
    {
      title: "Front-End Developer (Part-Time)",
      org: "Posifon AB, Gothenburg",
      dates: "Jan 2018 to Jan 2019",
      body: "A part-time job alongside my studies, maintaining the WordPress site for Posifon, a company making GPS safety and positioning products.",
      bullets: [
        "Maintained a WordPress e-commerce site with custom JavaScript functionality",
        "Added and updated product pages in the catalogue",
      ],
      stack: "WordPress, JavaScript, HTML, CSS, Figma",
    },
  ],
  education: [
    {
      title: "Front-End Developer (Web Programming)",
      org: "Medieinstitutet yrkeshögskolan, Gothenburg",
      dates: "Aug 2018 to Apr 2020",
    },
    {
      title: "Preparatory Studies for Higher Education",
      org: "Ljungskile folkhögskola",
      dates: "Jan 2016 to Jan 2017",
    },
    {
      title: "IVIK (Introductory Education for New Arrivals)",
      org: "Angeredsgymnasiet, Gothenburg",
      dates: "Aug 2011 to Jul 2012",
    },
    {
      title: "IVIK (Introductory Education for New Arrivals)",
      org: "Kärrtorps gymnasium, Stockholm",
      dates: "Aug 2010 to Jul 2011",
    },
  ],
  internships: [
    {
      title: "Front-End Developer Intern",
      org: "Plejd AB, Gothenburg",
      dates: "2019 to 2020 · about seven months across two periods",
      body: "A frontend internship at a Swedish smart-home company while I was studying, working in a professional codebase on internal applications.",
      bullets: [
        "Built internal applications used by 50+ employees daily",
        "Worked with Angular.js and Vue.js in a 100,000+ line production codebase",
        "Created UX prototypes in Figma based on user feedback and usability testing",
        "Took part in code reviews and learned professional development workflows",
        "Contributed to production features still in use today",
      ],
    },
  ],
  languages: [
    { name: "Spanish", level: "Native" },
    { name: "Swedish", level: "Fluent" },
    { name: "English", level: "Fluent" },
  ],
  updated: "Updated September 2026",
  references: "References available on request.",
};

export const CV_SV: CvData = {
  headline: "Webbutvecklare · Göteborg, Sverige",
  profile: [
    "Webbutvecklare med närmare sju års erfarenhet i JavaScript- och TypeScript-ekosystemet, efter studier inom webbutveckling i Göteborg. Jag har arbetat i båda ändar av branschen: produktbolag som bygger en och samma sak över år, och konsultverksamhet där man växlar mellan flera kunder samtidigt.",
    "Jag arbetar i hela stacken — React, Vue och Angular i frontend, Node, .NET och PHP i backend, React Native för mobil — och är van att äga en funktion hela vägen från första commit till produktion. Det spänner från små statiska sajter till stora webbapplikationer, för kunder som PostNord, Nordic Wellness och Inera (1177-plattformen).",
    "I frontend bryr jag mig om design och UX, inte bara hur saker fungerar. Vid sidan av jobbet driver jag ett hemmalabb för de verktyg jag faktiskt använder, och lägger en stor del av min fritid på att följa ny teknik, särskilt AI. Ursprungligen från Kuba, bosatt i Göteborg.",
  ],
  skillGroups: [
    {
      label: "Språk",
      skills: ["JavaScript", "TypeScript", "C#", "PHP", "Kotlin", "Python", "SQL"],
    },
    {
      label: "Frontend",
      skills: [
        "React",
        "Vue.js",
        "Angular",
        "Redux",
        "Vuex",
        "SASS",
        "Tailwind CSS",
        "Storybook",
        "HTML",
        "CSS",
      ],
    },
    {
      label: "Backend",
      skills: [
        "Node.js",
        "Express",
        ".NET (Core)",
        "FastAPI",
        "REST-API:er",
        "MongoDB",
        "MySQL",
        "SQL Server",
      ],
    },
    {
      label: "Mobil",
      skills: ["React Native", "Expo", "Health Connect", "Bluetooth LE"],
    },
    {
      label: "CMS och plattformar",
      skills: ["Umbraco", "Optimizely 11/12", "WordPress", "Astro"],
    },
    {
      label: "Infrastruktur",
      skills: [
        "Docker",
        "Ansible",
        "Proxmox / LXC",
        "Cloudflare Workers",
        "Microsoft Azure",
        "GitHub Actions",
        "YAML",
      ],
    },
    {
      label: "Arbetssätt",
      skills: [
        "Agila metoder",
        "Code review",
        "CI/CD",
        "Cypress",
        "Figma",
        "Git",
        "Azure DevOps",
        "Jira",
        "UI / UX",
      ],
    },
  ],
  earlyRoles: [
    {
      title: "Frontendutvecklare (deltid)",
      org: "ED Insights AS, Göteborg",
      dates: "Jan 2018 – Jan 2019",
      // Rättad: den svenska PDF:en beskriver av misstag Posifon i den här posten.
      body: "Ett deltidsjobb vid sidan av studierna, där jag byggde en statisk webbplats för ED Insights i WordPress.",
      bullets: [
        "Designade en UI-prototyp i Figma tillsammans med kunden",
        "Utvecklade och underhöll ett WordPress-tema med egen JavaScript, HTML och CSS",
      ],
      stack: "WordPress, JavaScript, HTML, CSS, Figma",
    },
    {
      title: "Frontendutvecklare (deltid)",
      org: "Posifon AB, Göteborg",
      dates: "Jan 2018 – Jan 2019",
      body: "Ett deltidsjobb vid sidan av studierna, där jag underhöll WordPress-sajten för Posifon, ett företag som tillverkar GPS-baserade trygghets- och positioneringsprodukter.",
      bullets: [
        "Underhöll en WordPress-baserad e-handelssajt med egen JavaScript-funktionalitet",
        "Lade till och uppdaterade produktsidor i katalogen",
      ],
      stack: "WordPress, JavaScript, HTML, CSS, Figma",
    },
  ],
  education: [
    {
      title: "Frontendutvecklare (Webbprogrammering)",
      org: "Medieinstitutet yrkeshögskolan, Göteborg",
      dates: "Aug 2018 – Apr 2020",
    },
    {
      title: "Komplettering av gymnasieämnen",
      org: "Ljungskile folkhögskola",
      dates: "Jan 2016 – Jan 2017",
    },
    {
      title: "IVIK (introduktionsutbildning för nyanlända)",
      org: "Angeredsgymnasiet, Göteborg",
      dates: "Aug 2011 – Jul 2012",
    },
    {
      title: "IVIK (introduktionsutbildning för nyanlända)",
      org: "Kärrtorps gymnasium, Stockholm",
      dates: "Aug 2010 – Jul 2011",
    },
  ],
  internships: [
    {
      title: "Frontendutvecklare (praktik)",
      org: "Plejd AB, Göteborg",
      dates: "2019 – 2020 · cirka sju månader över två perioder",
      body: "En praktik som frontendutvecklare på ett svenskt smarta hem-företag under studietiden, i en professionell kodbas med interna applikationer.",
      bullets: [
        "Byggde interna applikationer som användes av 50+ anställda dagligen",
        "Arbetade med Angular.js och Vue.js i en produktionskodbas på 100 000+ rader",
        "Skapade UX-prototyper i Figma utifrån användarfeedback och usability-testning",
        "Deltog i code reviews och lärde mig professionella utvecklingsflöden",
        "Bidrog till produktionsfunktioner som fortfarande används idag",
      ],
    },
  ],
  languages: [
    { name: "Spanska", level: "Modersmål" },
    { name: "Svenska", level: "Flytande" },
    { name: "Engelska", level: "Flytande" },
  ],
  updated: "Uppdaterad september 2026",
  references: "Referenser lämnas ut på begäran.",
};

/** Downloadable PDF exports. Stable filenames so links survive a CV refresh. */
export const CV_FILES = {
  en: { href: "/cv/christian-toledo-cv-en.pdf", label: "English" },
  sv: { href: "/cv/christian-toledo-cv-sv.pdf", label: "Svenska" },
} as const;
