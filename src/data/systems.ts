// The five systems running on casa-verde.
//
// casa-verde used to be presented as a single "// infrastructure" card, which hid a
// media pipeline, a smart-home + local-AI stack, a game server, a DNS/proxy/access
// layer, and a GitOps deploy platform behind one word. These are genuinely separate
// systems with their own stacks and failure modes, but they share one Proxmox host,
// one Ansible repo, one deploy pipeline, and one ADR log, so they're framed as
// "five systems, one platform" rather than five unrelated side projects. That's both
// the honest framing and the more impressive one.
//
// Every service named here was read out of the casa-verde repo (its README container
// table, ct102/docker-compose.yml, and docs/adr/). Don't add services that aren't
// actually running.

export type SystemIcon = "media" | "home" | "game" | "shield" | "platform";

export interface System {
  key: string;
  name: string;
  tag: string;
  icon: SystemIcon;
  pitch: string;
  highlights: string[];
  stack: string[];
  /** Anchor into the casa-verde deep dive. */
  href: string;
}

export const SYSTEMS: System[] = [
  {
    key: "media",
    name: "Media automation & streaming",
    tag: "// media pipeline",
    icon: "media",
    pitch:
      "A sixteen-container pipeline that finds, sorts, subtitles, and serves media, plus a photo library doing face recognition on the same integrated GPU that handles video transcoding.",
    highlights: [
      "Sonarr, Radarr, Lidarr, Prowlarr and Bazarr for acquisition and subtitles; Jellyfin and Navidrome for playback; Immich as a self-hosted Google Photos replacement",
      "Jellyfin runs on the host rather than in a container specifically to get direct iGPU passthrough for hardware transcoding",
      "A recurring Bazarr out-of-memory crash was root-caused rather than papered over with a restart policy",
    ],
    stack: [
      "Docker Compose",
      "Jellyfin",
      "Immich",
      "Intel QSV / iGPU passthrough",
      "Navidrome",
      "Samba",
    ],
    href: "/blog/casa-verde/#media-automation",
  },
  {
    key: "smart-home",
    name: "Smart home & a local voice assistant",
    tag: "// home automation + local AI",
    icon: "home",
    pitch:
      "Home Assistant running the house, with a voice assistant whose speech recognition, speech synthesis, and language model all run on my own hardware, plus a deliberate split to a cloud model for everything that isn't about the house.",
    highlights: [
      "Whisper for speech-to-text, Piper for text-to-speech, and Ollama for the language model, all self-hosted and all originally proven viable on CPU alone before any GPU was bought",
      "A hard privacy boundary: anything touching the home stays local by design; open-ended questions go to a separate cloud pipeline on a different wake word",
      "Lights, blinds and motion sensors migrated onto Matter, while the dimmer switches stayed where they were, because moving them would have made things worse",
    ],
    stack: [
      "Home Assistant",
      "Ollama",
      "Whisper",
      "Piper",
      "Groq",
      "Matter",
      "Docker Compose",
    ],
    href: "/blog/casa-verde/#smart-home-and-a-local-voice-assistant",
  },
  {
    key: "game-server",
    name: "Game server",
    tag: "// game server ops",
    icon: "game",
    pitch:
      "A Project Zomboid dedicated server for me and my friends, running about fifty mods with fully automated mod and update management.",
    highlights: [
      "The interesting constraint is that a mod update can break an existing save, so the automation has to be careful about when it applies one rather than just pulling latest",
      "Provisioned and updated from the same Ansible repo as everything else, so there's no hand-configured server that only I know how to rebuild",
    ],
    stack: ["Ansible", "Docker", "Project Zomboid", "systemd"],
    href: "/blog/casa-verde/#game-server",
  },
  {
    key: "network",
    name: "Network, DNS & remote access",
    tag: "// network + access",
    icon: "shield",
    pitch:
      "Local DNS with real hostnames and network-wide ad blocking, a reverse proxy in front of every service, and no open inbound ports at all. Remote access goes through a Cloudflare tunnel with authentication in front of it.",
    highlights: [
      "Nothing is port-forwarded. Every externally reachable service sits behind Cloudflare Tunnel with Cloudflare Access authenticating in front of it",
      "AdGuard Home as the local resolver, giving every service a real .lan hostname and blocking ads network-wide",
      "Self-hosted push notifications, so alerting doesn't depend on a third-party service staying free",
    ],
    stack: [
      "AdGuard Home",
      "Nginx Proxy Manager",
      "Cloudflare Tunnel",
      "Cloudflare Access",
      "ntfy",
    ],
    href: "/blog/casa-verde/#network-dns-and-remote-access",
  },
  {
    key: "platform",
    name: "Deploy platform & observability",
    tag: "// platform + GitOps",
    icon: "platform",
    pitch:
      "Push to main is the deploy. Ansible for most stacks, GitOps for the ones where webhook-speed redeploys are worth an extra moving part, chosen per stack rather than dogmatically.",
    highlights: [
      "A self-hosted GitHub Actions runner applies the repo to the host and containers on every push; secrets are encrypted in git with SOPS and age",
      "A daily drift check runs the whole playbook in check mode against live state and alerts if anything was hand-edited outside the pipeline",
      "The architecture diagram on the repo's front page is regenerated by CI from an editable source, so it can't quietly go stale",
    ],
    stack: [
      "Ansible",
      "Komodo",
      "GitHub Actions",
      "SOPS / age",
      "Proxmox",
      "Docker",
    ],
    href: "/blog/casa-verde/#deploy-platform-and-observability",
  },
];

export const SYSTEMS_SV: System[] = [
  {
    key: "media",
    name: "Mediaautomation och streaming",
    tag: "// mediakedja",
    icon: "media",
    pitch:
      "En kedja på sexton containrar som hittar, sorterar, textar och serverar media, plus ett fotobibliotek som gör ansiktsigenkänning på samma integrerade grafikkrets som sköter videotranskodningen.",
    highlights: [
      "Sonarr, Radarr, Lidarr, Prowlarr och Bazarr för hämtning och undertexter; Jellyfin och Navidrome för uppspelning; Immich som självhostad ersättare för Google Photos",
      "Jellyfin körs direkt på värden i stället för i en container, just för att få direkt iGPU-passthrough för hårdvarutranskodning",
      "En återkommande minneskrasch i Bazarr rotorsaksanalyserades i stället för att döljas med en omstartspolicy",
    ],
    stack: [
      "Docker Compose",
      "Jellyfin",
      "Immich",
      "Intel QSV / iGPU-passthrough",
      "Navidrome",
      "Samba",
    ],
    href: "/sv/blog/casa-verde/#mediaautomation",
  },
  {
    key: "smart-home",
    name: "Smart hem och en lokal röstassistent",
    tag: "// hemautomation + lokal AI",
    icon: "home",
    pitch:
      "Home Assistant styr huset, med en röstassistent där taligenkänning, talsyntes och språkmodell alla körs på min egen hårdvara, plus en medveten uppdelning mot en molnmodell för allt som inte handlar om hemmet.",
    highlights: [
      "Whisper för tal-till-text, Piper för text-till-tal och Ollama för språkmodellen, allt självhostat och allt ursprungligen bevisat fungera på enbart CPU innan något grafikkort köptes",
      "En tydlig integritetsgräns: allt som rör hemmet stannar lokalt, medvetet; öppna frågor går till en separat molnpipeline på ett annat väckningsord",
      "Lampor, persienner och rörelsesensorer migrerade till Matter, medan dimmerknapparna fick stanna kvar, eftersom en flytt hade gjort det sämre",
    ],
    stack: [
      "Home Assistant",
      "Ollama",
      "Whisper",
      "Piper",
      "Groq",
      "Matter",
      "Docker Compose",
    ],
    href: "/sv/blog/casa-verde/#smart-hem-och-en-lokal-röstassistent",
  },
  {
    key: "game-server",
    name: "Spelserver",
    tag: "// spelserverdrift",
    icon: "game",
    pitch:
      "En dedikerad Project Zomboid-server för mig och mina vänner, med ett femtiotal mods och helt automatiserad hantering av mods och uppdateringar.",
    highlights: [
      "Den intressanta begränsningen är att en moduppdatering kan förstöra en pågående sparfil, så automationen måste vara försiktig med när den appliceras i stället för att bara hämta senaste",
      "Provisioneras och uppdateras från samma Ansible-repo som allt annat, så det finns ingen handkonfigurerad server som bara jag vet hur man bygger om",
    ],
    stack: ["Ansible", "Docker", "Project Zomboid", "systemd"],
    href: "/sv/blog/casa-verde/#spelserver",
  },
  {
    key: "network",
    name: "Nätverk, DNS och fjärråtkomst",
    tag: "// nätverk + åtkomst",
    icon: "shield",
    pitch:
      "Lokal DNS med riktiga hostnamn och nätverksövergripande annonsblockering, en reverse proxy framför varje tjänst, och inga öppna inkommande portar alls. Fjärråtkomst går genom en Cloudflare-tunnel med autentisering framför.",
    highlights: [
      "Ingenting är port-forwardat. Varje externt nåbar tjänst ligger bakom Cloudflare Tunnel med Cloudflare Access som autentiserar framför",
      "AdGuard Home som lokal resolver, vilket ger varje tjänst ett riktigt .lan-hostnamn och blockerar annonser i hela nätverket",
      "Självhostade push-notiser, så larmen inte är beroende av att en tredjepartstjänst förblir gratis",
    ],
    stack: [
      "AdGuard Home",
      "Nginx Proxy Manager",
      "Cloudflare Tunnel",
      "Cloudflare Access",
      "ntfy",
    ],
    href: "/sv/blog/casa-verde/#nätverk-dns-och-fjärråtkomst",
  },
  {
    key: "platform",
    name: "Deployplattform och övervakning",
    tag: "// plattform + GitOps",
    icon: "platform",
    pitch:
      "Push till main är deployen. Ansible för de flesta stackar, GitOps för dem där webhook-snabba omdistributioner är värda en extra rörlig del, valt per stack snarare än dogmatiskt.",
    highlights: [
      "En självhostad GitHub Actions-runner applicerar repot på värden och containrarna vid varje push; hemligheter ligger krypterade i git med SOPS och age",
      "En daglig driftkontroll kör hela playbooken i check-läge mot livemiljön och larmar om något handredigerats utanför pipelinen",
      "Arkitekturdiagrammet på repots förstasida regenereras av CI från en redigerbar källa, så det kan inte tyst bli inaktuellt",
    ],
    stack: [
      "Ansible",
      "Komodo",
      "GitHub Actions",
      "SOPS / age",
      "Proxmox",
      "Docker",
    ],
    href: "/sv/blog/casa-verde/#deployplattform-och-övervakning",
  },
];
