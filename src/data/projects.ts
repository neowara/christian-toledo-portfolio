// Selected work, shown on the homepage.
//
// Both repos are private, deliberately. That used to be papered over with "Repo ↗"
// links that 404'd for every visitor; now each project carries a `sourceNote` that
// says so plainly and points at the thing that actually is readable — the deep dive.
// Every link in `links` must resolve for a logged-out stranger.

export interface ProjectLink {
  label: string;
  url: string;
  /** External links get target=_blank + an arrow. */
  external?: boolean;
}

export interface Project {
  name: string;
  tag: string;
  pitch: string;
  icon?: string;
  links: ProjectLink[];
  /** Why there's no repo link. Rendered small and dim under the links. */
  sourceNote: string;
  blogSlug: string;
  details: { title: string; body: string }[];
  stack: string[];
}

export const PROJECTS: Record<"cityroam" | "casaVerde", Project> = {
  cityroam: {
    name: "Cityroam",
    tag: "// mobile + backend",
    pitch:
      "A ride computer for electric boards and scooters: an Android app and a self-hosted backend that talk to the hardware directly over Bluetooth. Two different manufacturers' proprietary protocols, both reverse-engineered and reimplemented from scratch — no vendor SDK, no cloud account needed to ride.",
    icon: "/projects/cityroam-mark.svg",
    links: [
      {
        label: "cityroam.casa-verde.casa",
        url: "https://cityroam.casa-verde.casa",
        external: true,
      },
      { label: "Read the deep dive", url: "/blog/cityroam/" },
    ],
    sourceNote:
      "In closed beta. The source is private, so the deep dives are the readable version — protocol notes, the physics model, and the decisions behind both.",
    blogSlug: "cityroam",
    details: [
      {
        title: "Two vendor protocols, neither of them documented",
        body: "the Tynee board's Tuya SDK was reverse-engineered and deleted outright, replaced by a from-scratch Kotlin GATT client verified byte-for-byte against a Python reference. The NAVEE scooter had no SDK to remove in the first place — its encrypted challenge-response handshake had to be worked out from a real capture of the official app.",
      },
      {
        title: "Physics fitted to your own rides",
        body: "the backend fits per-mode rolling resistance, drag, and drivetrain efficiency by regression over real trip history, rather than trusting a manufacturer number or guessing linearly from battery percentage.",
      },
      {
        title: "Offline first, by construction",
        body: "every finished trip is written to the phone's own SQLite queue before any network call, so a ride exists the instant it ends whether or not the backend is reachable. Recording survives the app being backgrounded or killed outright.",
      },
      {
        title: "Clean GPS from noisy hardware",
        body: "raw phone GPS is road-snapped through a self-hosted OSRM instance and enriched with weather sampled across the whole route, so a ride that genuinely crosses from sun into rain shows that.",
      },
    ],
    stack: [
      "Expo / React Native",
      "Kotlin",
      "TypeScript",
      "Bluetooth LE",
      "FastAPI",
      "SQLModel",
      "Alembic",
      "OSRM",
      "Docker",
    ],
  },
  casaVerde: {
    name: "casa-verde",
    tag: "// platform",
    pitch:
      "The Proxmox host and deploy pipeline that five separate systems run on. Not a pile of Docker containers — a platform with infrastructure as code, encrypted secrets in git, drift detection against live state, and a written record of every real decision behind it.",
    links: [{ label: "Read the deep dive", url: "/blog/casa-verde/" }],
    sourceNote:
      "Source is private — it holds the encrypted secrets and the network layout for a house I live in. The deep dive covers the architecture and the decisions.",
    blogSlug: "casa-verde",
    details: [
      {
        title: "Push to main is the deploy",
        body: "a self-hosted GitHub Actions runner applies the repo to the host and every container. Ansible for most stacks, GitOps for the ones where a webhook-speed redeploy earns its extra complexity — chosen per stack, not dogmatically.",
      },
      {
        title: "82 written decision records",
        body: "every non-trivial call has a documented reason, including the ones that turned out wrong and had to be reverted. That habit is the actual point of the project.",
      },
      {
        title: "Actually monitored",
        body: "a daily drift check runs the playbook against live state and alerts if anything was hand-edited outside the pipeline, plus automated backups and real failure alerting — not just “the container is still running.”",
      },
      {
        title: "It hosts the other project",
        body: "Cityroam's backend runs on this platform, deployed by the same pipeline. The two projects on this page aren't independent — one runs on the other.",
      },
    ],
    stack: [
      "Proxmox / LXC",
      "Ansible",
      "Docker Compose",
      "Komodo (GitOps)",
      "Cloudflare Tunnel",
      "Home Assistant",
    ],
  },
};

export const PROJECTS_SV: Record<"cityroam" | "casaVerde", Project> = {
  cityroam: {
    name: "Cityroam",
    tag: "// mobil + backend",
    pitch:
      "En färddator för elbrädor och elsparkcyklar: en Android-app och en självhostad backend som pratar direkt med hårdvaran över Bluetooth. Två olika tillverkares proprietära protokoll, båda reverse-engineerade och återimplementerade från grunden — inget leverantörs-SDK, inget molnkonto som krävs för att åka.",
    icon: "/projects/cityroam-mark.svg",
    links: [
      {
        label: "cityroam.casa-verde.casa",
        url: "https://cityroam.casa-verde.casa",
        external: true,
      },
      { label: "Läs djupdykningen", url: "/sv/blog/cityroam/" },
    ],
    sourceNote:
      "I stängd beta. Källkoden är privat, så djupdykningarna är den läsbara versionen — protokollanteckningar, fysikmodellen och besluten bakom båda.",
    blogSlug: "cityroam",
    details: [
      {
        title: "Två leverantörsprotokoll, inget av dem dokumenterat",
        body: "Tynee-brädans Tuya-SDK reverse-engineerades och togs bort helt, ersatt av en Kotlin GATT-klient byggd från grunden och verifierad byte för byte mot en Python-referens. NAVEE-sparkcykeln hade inget SDK att ta bort över huvud taget — dess krypterade utmaning-svar-handskakning fick räknas ut från en riktig capture av tillverkarens egen app.",
      },
      {
        title: "Fysik anpassad till dina egna åkturer",
        body: "backenden anpassar rullmotstånd, luftmotstånd och drivlineeffektivitet per läge genom regression över verklig resehistorik, i stället för att lita på ett tillverkartal eller gissa linjärt utifrån batteriprocent.",
      },
      {
        title: "Offline först, av konstruktion",
        body: "varje avslutad tur skrivs till telefonens egen SQLite-kö innan något nätverksanrop görs, så en tur finns i samma ögonblick den tar slut, oavsett om backenden går att nå. Inspelningen överlever att appen hamnar i bakgrunden eller dödas helt.",
      },
      {
        title: "Ren GPS från brusig hårdvara",
        body: "rå GPS-data från telefonen vägsnäpps genom en självhostad OSRM-instans och berikas med väder samplat över hela rutten, så en tur som faktiskt går från sol in i regn visar det.",
      },
    ],
    stack: [
      "Expo / React Native",
      "Kotlin",
      "TypeScript",
      "Bluetooth LE",
      "FastAPI",
      "SQLModel",
      "Alembic",
      "OSRM",
      "Docker",
    ],
  },
  casaVerde: {
    name: "casa-verde",
    tag: "// plattform",
    pitch:
      "Proxmox-värden och deploypipelinen som fem separata system körs på. Inte en hög Docker-containrar — en plattform med infrastruktur som kod, krypterade hemligheter i git, driftkontroll mot livemiljön och en nedskriven historik över varje verkligt beslut bakom den.",
    links: [{ label: "Läs djupdykningen", url: "/sv/blog/casa-verde/" }],
    sourceNote:
      "Källkoden är privat — den innehåller krypterade hemligheter och nätverksupplägget för ett hus jag bor i. Djupdykningen täcker arkitekturen och besluten.",
    blogSlug: "casa-verde",
    details: [
      {
        title: "Push till main är deployen",
        body: "en självhostad GitHub Actions-runner applicerar repot på värden och varje container. Ansible för de flesta stackar, GitOps för dem där en webhook-snabb omdistribution är värd sin extra komplexitet — valt per stack, inte dogmatiskt.",
      },
      {
        title: "82 skrivna beslutsdokument",
        body: "varje icke-trivialt beslut har en dokumenterad anledning, inklusive de som visade sig fel och fick rullas tillbaka. Den vanan är själva poängen med projektet.",
      },
      {
        title: "Faktiskt övervakat",
        body: "en daglig driftkontroll kör playbooken mot livemiljön och larmar om något handredigerats utanför pipelinen, plus automatiska säkerhetskopior och riktiga felnotiser — inte bara ”containern körs fortfarande”.",
      },
      {
        title: "Den kör det andra projektet",
        body: "Cityroams backend körs på den här plattformen, deployad av samma pipeline. De två projekten på den här sidan är inte oberoende — det ena körs på det andra.",
      },
    ],
    stack: [
      "Proxmox / LXC",
      "Ansible",
      "Docker Compose",
      "Komodo (GitOps)",
      "Cloudflare Tunnel",
      "Home Assistant",
    ],
  },
};
