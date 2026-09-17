// Experience timeline, shown on the homepage and on /cv.
//
// Each job carries a `clients` array describing the products and organisations
// actually worked on there. This matters for the consulting roles especially: the
// employer is who paid, but the client is what the work *was*, and a recruiter
// scanning "Nexer AB" learns nothing while "1177, PostNord, Stadsmission" tells them
// the whole story.
//
// Accuracy rules, deliberately encoded here rather than left to whoever edits the
// markup later:
//   - `scale` describes the CLIENT or PLATFORM, never a claim about personally owned
//     traffic. "National · millions of users" is a true statement about 1177 itself.
//   - `role` on a client says exactly how involved Christian was. "Sole developer"
//     and "part of a larger team" are both used, and the honest one is always the
//     right one, inflating a team contribution is the fastest way to lose an
//     interview.
//   - `logo` is optional. When set it points at a real monochrome SVG wordmark in
//     /public/logos/ (currentColor, so both themes work). When absent the tile falls
//     back to a domain icon + the company name as text, which is the safest possible
//     form of nominative use: the words, not the mark.

export type ClientIcon =
  | "health"
  | "parcel"
  | "community"
  | "fitness"
  | "lightbulb"
  | "megaphone"
  | "cms";

export interface Client {
  name: string;
  icon: ClientIcon;
  /**
   * Optional wordmark: the filename (without extension) of a logo in
   * src/assets/logos/. SVGs are inlined so they inherit the page colour; PNGs
   * are pre-baked black silhouettes that the dark theme inverts.
   */
  logo?: string;
  /**
   * Set when the logo is a monogram or a number rather than a wordmark, so the
   * company name stays visible next to it instead of only in the accessible
   * name. "1177", a lone "p" or a lone "G" don't identify anything on sight.
   */
  logoNeedsLabel?: boolean;
  /** What kind of organisation/product it is. Rendered as a mono eyebrow. */
  kind?: string;
  /** Scale of the client or platform, never a personal traffic claim. */
  scale: string;
  /** What Christian actually did, scoped honestly. */
  role: string;
}

export interface Job {
  role: string;
  org: string;
  dates: string;
  /** Short framing line for the role as a whole. */
  summary: string;
  bullets: string[];
  clients?: Client[];
  stack: string[];
}

export const EXPERIENCE: Job[] = [
  {
    role: "Fullstack Developer (Consultant)",
    org: "Dear Friends",
    dates: "Jan 2026 to Jun 2026",
    summary:
      "Creative agency in Gothenburg, moving between several client projects each week.",
    bullets: [
      "Built and shipped two React Native apps with Expo, one for <strong>Nordic Wellness</strong> and one for its premium brand <strong>Grand Fitness</strong>, each pulling live content and pricing from the Umbraco site behind it",
      "Ran both projects end to end: testing, weekly test builds out to testers through TestFlight and Google Play Console, public releases, and managing the project itself",
      "Built and maintained Umbraco (.NET) sites for several of the agency's clients, plus ongoing WordPress upkeep",
    ],
    clients: [
      {
        name: "Nordic Wellness",
        icon: "fitness",
        logo: "nordic-wellness",
        kind: "Gym chain",
        scale: "Largest in the Nordics · 300+ clubs",
        role: "React Native app (Expo) and the Umbraco site behind it. Owned the pipeline from testing to public release",
      },
      {
        name: "Grand Fitness",
        icon: "fitness",
        logo: "grandfitness",
        logoNeedsLabel: true,
        kind: "Premium gym brand",
        scale: "Part of Nordic Wellness",
        role: "React Native app (Expo) and the Umbraco site behind it. Owned the pipeline from testing to public release",
      },
      {
        name: "Fred's Food and Coffee",
        icon: "cms",
        logo: "freds",
        kind: "Hospitality",
        scale: "Gothenburg",
        role: "Umbraco (.NET) site, built and maintained",
      },
      {
        name: "IEMS, BabySlides, Doxa Bostad, Hagab",
        icon: "cms",
        logo: "wordpress",
        logoNeedsLabel: true,
        kind: "WordPress upkeep",
        scale: "Four agency clients",
        role: "Maintenance, dependency updates, and content work",
      },
    ],
    stack: [
      "React Native",
      "Expo",
      "Umbraco",
      "C# / .NET",
      "WordPress",
      "PHP",
      "TypeScript",
    ],
  },
  {
    role: "Fullstack Developer (Consultant)",
    org: "Nexer AB",
    dates: "Feb 2023 to Mar 2025",
    summary:
      "Fullstack with a frontend focus, across clients ranging from solo projects to large agile teams.",
    bullets: [
      "Sole developer on a <strong>React Native app for Göteborgs Stadsmission</strong>, connecting surplus-food donors with people in need across Gothenburg",
      "Built an internal React tool for <strong>PostNord</strong> used to plan postal delivery routes across Sweden",
      "Contributed to <strong>Inera's 1177</strong> public health platform (Optimizely + Angular) as part of a larger development team",
      "Worked with backend developers on REST APIs and .NET integrations, and supported junior developers on React and TypeScript",
    ],
    clients: [
      {
        name: "1177 Vårdguiden",
        icon: "health",
        logo: "1177",
        kind: "Public healthcare platform",
        scale: "National · millions of users",
        role: "Angular frontend on Optimizely, as part of one of several teams",
      },
      {
        name: "PostNord",
        icon: "parcel",
        logo: "postnord",
        kind: "Postal operator",
        scale: "Nordic · nationwide logistics",
        role: "Internal React tool for planning delivery routes, in a larger team",
      },
      {
        name: "Göteborgs Stadsmission",
        icon: "community",
        logo: "stadsmission",
        kind: "Non-profit, social services",
        scale: "Gothenburg",
        role: "React Native app connecting food donors with people in need, as sole developer",
      },
    ],
    stack: [
      "React",
      "TypeScript",
      "React Native",
      "Optimizely 11/12",
      "SASS",
      ".NET Core",
      "C#",
      "SQL Server",
      "Azure DevOps",
    ],
  },
  {
    role: "Front-End Developer",
    org: "Nordic Retail Group (prev. Digital People)",
    dates: "Dec 2020 to Jan 2023",
    summary:
      "Sole frontend developer on one product, from early startup through acquisition.",
    bullets: [
      "Sole frontend developer on <strong>Enginio</strong>, a Vue.js platform for building advertising campaigns and brand activations, from early startup through acquisition",
      "Built a reusable <strong>Vue.js component library in Storybook</strong>, and owned frontend architecture, tooling, and CI/CD",
      "Cut initial load time from <strong>4.2s to 1.8s</strong> through lazy loading and bundle optimization",
    ],
    clients: [
      {
        name: "Enginio",
        icon: "megaphone",
        logo: "enginio",
        scale: "B2B SaaS · advertising and brand activations",
        role: "Sole frontend developer: architecture, component library, CI/CD",
      },
    ],
    stack: [
      "Vue.js",
      "Vuex",
      "SASS",
      "Node.js",
      "Express",
      "MongoDB",
      "Cypress",
      "Storybook",
      "Figma",
    ],
  },
  {
    role: "Front-End Developer Intern",
    org: "Plejd AB",
    dates: "2019 to 2020",
    summary: "First real production codebase, alongside studying at Medieinstitutet.",
    bullets: [
      "Worked in a professional, 100,000+ line Angular.js/Vue.js codebase at a Swedish smart-home hardware company, building internal tools used by 50+ employees daily. My first real production codebase, alongside studying front-end development at Medieinstitutet",
    ],
    clients: [
      {
        name: "Plejd",
        icon: "lightbulb",
        logo: "plejd",
        kind: "Smart-home hardware",
        scale: "Swedish · listed company",
        role: "Internal tools used daily by 50+ employees",
      },
    ],
    stack: ["Angular.js", "Vue.js", "Figma"],
  },
];

// Swedish translation. Org names, product names, and stack tags stay untranslated ,
// they're proper nouns and reading "Göteborg's City Mission" in Swedish would be odd.
export const EXPERIENCE_SV: Job[] = [
  {
    role: "Fullstackutvecklare (konsult)",
    org: "Dear Friends",
    dates: "Jan 2026 – Jun 2026",
    summary:
      "Kreativ byrå i Göteborg, växlade mellan flera kundprojekt varje vecka.",
    bullets: [
      "Byggde och lanserade två React Native-appar med Expo, en för <strong>Nordic Wellness</strong> och en för premiumvarumärket <strong>Grand Fitness</strong>, som båda hämtar liveinnehåll och priser från Umbraco-sajten bakom dem",
      "Drev båda projekten från start till slut: testning, veckovisa testbyggen till testare via TestFlight och Google Play Console, publika releaser och projektledning",
      "Byggde och underhöll Umbraco (.NET)-sajter för flera av byråns kunder, samt löpande WordPress-underhåll",
    ],
    clients: [
      {
        name: "Nordic Wellness",
        icon: "fitness",
        logo: "nordic-wellness",
        kind: "Gymkedja",
        scale: "Nordens största · 300+ anläggningar",
        role: "React Native-app (Expo) och Umbraco-sajten bakom den. Ägde hela flödet från testning till publik release",
      },
      {
        name: "Grand Fitness",
        icon: "fitness",
        logo: "grandfitness",
        logoNeedsLabel: true,
        kind: "Premiumgym",
        scale: "Del av Nordic Wellness",
        role: "React Native-app (Expo) och Umbraco-sajten bakom den. Ägde hela flödet från testning till publik release",
      },
      {
        name: "Fred's Food and Coffee",
        icon: "cms",
        logo: "freds",
        kind: "Restaurang och café",
        scale: "Göteborg",
        role: "Umbraco (.NET)-sajt, byggd och underhållen",
      },
      {
        name: "IEMS, BabySlides, Doxa Bostad, Hagab",
        icon: "cms",
        logo: "wordpress",
        logoNeedsLabel: true,
        kind: "WordPress-underhåll",
        scale: "Fyra byråkunder",
        role: "Underhåll, uppdatering av beroenden och innehållsarbete",
      },
    ],
    stack: [
      "React Native",
      "Expo",
      "Umbraco",
      "C# / .NET",
      "WordPress",
      "PHP",
      "TypeScript",
    ],
  },
  {
    role: "Fullstackutvecklare (konsult)",
    org: "Nexer AB",
    dates: "Feb 2023 – Mar 2025",
    summary:
      "Fullstack med frontendfokus, hos kunder från soloprojekt till större agila team.",
    bullets: [
      "Ensam utvecklare på en <strong>React Native-app för Göteborgs Stadsmission</strong>, som kopplar samman givare av överskottsmat med människor i behov runt om i Göteborg",
      "Byggde ett internt React-verktyg för <strong>PostNord</strong> som används för att planera postens leveransrutter i hela Sverige",
      "Bidrog till <strong>Ineras 1177</strong>, den offentliga vårdplattformen (Optimizely + Angular), som en del av ett större utvecklingsteam",
      "Samarbetade med backendutvecklare kring REST-API:er och .NET-integrationer, och stöttade juniora utvecklare inom React och TypeScript",
    ],
    clients: [
      {
        name: "1177 Vårdguiden",
        icon: "health",
        logo: "1177",
        kind: "Offentlig vårdplattform",
        scale: "Nationell · miljontals användare",
        role: "Angular-frontend på Optimizely, som del av ett av flera team",
      },
      {
        name: "PostNord",
        icon: "parcel",
        logo: "postnord",
        kind: "Postoperatör",
        scale: "Nordisk · rikstäckande logistik",
        role: "Internt React-verktyg för ruttplanering, i ett större team",
      },
      {
        name: "Göteborgs Stadsmission",
        icon: "community",
        logo: "stadsmission",
        kind: "Ideell verksamhet, socialt arbete",
        scale: "Göteborg",
        role: "React Native-app som kopplar matgivare till människor i behov, som ensam utvecklare",
      },
    ],
    stack: [
      "React",
      "TypeScript",
      "React Native",
      "Optimizely 11/12",
      "SASS",
      ".NET Core",
      "C#",
      "SQL Server",
      "Azure DevOps",
    ],
  },
  {
    role: "Frontendutvecklare",
    org: "Nordic Retail Group (tidigare Digital People)",
    dates: "Dec 2020 – Jan 2023",
    summary:
      "Ensam frontendutvecklare på en produkt, från tidig startup till förvärv.",
    bullets: [
      "Ensam frontendutvecklare på <strong>Enginio</strong>, en Vue.js-plattform för att bygga annonskampanjer och varumärkesaktiveringar, från tidig startup till förvärv",
      "Byggde ett återanvändbart <strong>Vue.js-komponentbibliotek i Storybook</strong>, och ägde frontendarkitektur, verktyg och CI/CD",
      "Minskade initial laddningstid från <strong>4,2s till 1,8s</strong> genom lazy loading och bundle-optimering",
    ],
    clients: [
      {
        name: "Enginio",
        icon: "megaphone",
        logo: "enginio",
        scale: "B2B SaaS · annonsering och varumärkesaktivering",
        role: "Ensam frontendutvecklare: arkitektur, komponentbibliotek, CI/CD",
      },
    ],
    stack: [
      "Vue.js",
      "Vuex",
      "SASS",
      "Node.js",
      "Express",
      "MongoDB",
      "Cypress",
      "Storybook",
      "Figma",
    ],
  },
  {
    role: "Frontendutvecklare (praktik)",
    org: "Plejd AB",
    dates: "2019 – 2020",
    summary: "Första riktiga produktionskodbasen, parallellt med studierna på Medieinstitutet.",
    bullets: [
      "Arbetade i en professionell kodbas på 100 000+ rader Angular.js/Vue.js hos ett svenskt smarta hem-företag, och byggde interna verktyg som användes av 50+ anställda dagligen. Min första riktiga produktionskodbas, parallellt med studier i frontendutveckling på Medieinstitutet",
    ],
    clients: [
      {
        name: "Plejd",
        icon: "lightbulb",
        logo: "plejd",
        kind: "Smarta hem-hårdvara",
        scale: "Svenskt · börsnoterat",
        role: "Interna verktyg som användes dagligen av 50+ anställda",
      },
    ],
    stack: ["Angular.js", "Vue.js", "Figma"],
  },
];
