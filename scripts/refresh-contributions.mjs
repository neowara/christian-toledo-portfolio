// Refreshes the committed GitHub contribution snapshot.
//
//   npm run refresh-contributions
//
// The snapshot is what the homepage renders server-side, so the graph is correct on
// first paint with no layout shift and still shows something real if the upstream API
// is unreachable at request time. The Worker route (src/pages/api/contributions.json.ts)
// fetches live data on top of this; this file is the floor, not the source of truth.
//
// Data comes from github-contributions-api.jogruber.de, which scrapes the public
// profile page. That means it includes private-repo contributions as long as
// "Include private contributions on my profile" is enabled on the GitHub account ,
// which it is, verified by the totals matching the profile exactly.

import { writeFile } from "node:fs/promises";

const USERNAME = process.env.GITHUB_USERNAME ?? "neowara";
const OUT = new URL("../src/data/contributions-snapshot.json", import.meta.url);
const ENDPOINT = `https://github-contributions-api.jogruber.de/v4/${USERNAME}?y=last`;

const res = await fetch(ENDPOINT, {
  headers: { accept: "application/json" },
});

if (!res.ok) {
  console.error(`Failed: ${res.status} ${res.statusText} from ${ENDPOINT}`);
  process.exit(1);
}

const data = await res.json();

if (!Array.isArray(data?.contributions) || data.contributions.length === 0) {
  console.error("Unexpected payload, no contributions array. Refusing to overwrite.");
  process.exit(1);
}

const snapshot = {
  username: USERNAME,
  fetchedAt: new Date().toISOString(),
  total: data.total ?? {},
  contributions: data.contributions.map(({ date, count, level }) => ({
    date,
    count,
    level,
  })),
};

await writeFile(OUT, JSON.stringify(snapshot, null, 2) + "\n", "utf8");

const days = snapshot.contributions.length;
const total = snapshot.total.lastYear ?? "?";
console.log(`Wrote ${days} days, ${total} contributions in the last year.`);
