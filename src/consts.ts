// Global site data. Bulk content lives in src/data/* and is re-exported here so
// existing `import { ... } from '../consts'` call sites keep working.

export const SITE_TITLE = "Christian Toledo";
export const SITE_DESCRIPTION =
  "Full-stack engineer based in Göteborg, Sweden. React, React Native, Vue, Angular, and .NET for clients including PostNord, Nordic Wellness, and 1177; reverse-engineered Bluetooth protocols, physics-based range models, and a home lab run like production on my own time.";
export const SITE_DESCRIPTION_SV =
  "Fullstackutvecklare baserad i Göteborg. React, React Native, Vue, Angular och .NET för kunder som PostNord, Nordic Wellness och 1177; reverse-engineerade Bluetooth-protokoll, fysikbaserade räckviddsmodeller och ett hemmalabb som körs som en produktionsmiljö, på min fritid.";

export const GITHUB_URL = "https://github.com/neowara";
export const GITHUB_USERNAME = "neowara";
export const LINKEDIN_URL = "https://www.linkedin.com/in/christiantm/";
export const EMAIL = "christiantoledo@live.com";

export { PROJECTS, PROJECTS_SV } from "./data/projects";
export type { Project, ProjectLink } from "./data/projects";

export { SYSTEMS, SYSTEMS_SV } from "./data/systems";
export type { System, SystemIcon } from "./data/systems";

export { EXPERIENCE, EXPERIENCE_SV } from "./data/experience";
export type { Job, Client, ClientIcon } from "./data/experience";

export { AI_PRACTICE, AI_PRACTICE_SV } from "./data/ai";
export type { AiPractice, AiPillar, AiFigure } from "./data/ai";

export { CV, CV_SV, CV_FILES } from "./data/cv";
export type { CvData, CvEntry, SkillGroup } from "./data/cv";
