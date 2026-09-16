import type { APIRoute } from "astro";
import snapshot from "../../data/contributions-snapshot.json";
import { GITHUB_USERNAME } from "../../consts";

// The only on-demand route on the site. Everything else stays statically prerendered
// (Astro 5 removed `output: 'hybrid'`, with an adapter configured you opt individual
// routes in, which is exactly what this is).
export const prerender = false;

const ENDPOINT = `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`;

/** 6h. Upstream caches ~1h, so this is polite and still same-day fresh. */
const MAX_AGE = 21_600;
const UPSTREAM_TIMEOUT_MS = 5_000;

interface Day {
  date: string;
  count: number;
  level: number;
}

interface Payload {
  total: Record<string, number>;
  contributions: Day[];
  stale: boolean;
  fetchedAt: string;
}

function json(payload: Payload, cacheable: boolean): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      // A stale payload is cached briefly so a broken upstream doesn't turn into a
      // fetch on every single request, but not for the full 6h.
      "cache-control": cacheable
        ? `public, max-age=${MAX_AGE}, s-maxage=${MAX_AGE}`
        : "public, max-age=300",
    },
  });
}

function fallback(): Payload {
  return {
    total: snapshot.total as Record<string, number>,
    contributions: snapshot.contributions as Day[],
    stale: true,
    fetchedAt: snapshot.fetchedAt,
  };
}

export const GET: APIRoute = async ({ request }) => {
  // Cloudflare's Cache API, when running on Workers. Guarded because it doesn't
  // exist in `astro dev`.
  const cache =
    typeof caches !== "undefined" && "default" in caches
      ? (caches as unknown as { default: Cache }).default
      : undefined;
  const cacheKey = new Request(new URL(request.url).toString(), {
    method: "GET",
  });

  if (cache) {
    const hit = await cache.match(cacheKey);
    if (hit) return hit;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

    const res = await fetch(ENDPOINT, {
      headers: { accept: "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) return json(fallback(), false);

    const data = (await res.json()) as {
      total?: Record<string, number>;
      contributions?: Day[];
    };

    // Guard against a 200 that isn't the shape we expect, an empty graph would be
    // worse than a slightly old one.
    if (!Array.isArray(data.contributions) || data.contributions.length === 0) {
      return json(fallback(), false);
    }

    const payload: Payload = {
      total: data.total ?? {},
      contributions: data.contributions.map(({ date, count, level }) => ({
        date,
        count,
        level,
      })),
      stale: false,
      fetchedAt: new Date().toISOString(),
    };

    const response = json(payload, true);
    if (cache) await cache.put(cacheKey, response.clone());
    return response;
  } catch {
    // Timeout, DNS failure, malformed JSON, all the same from here: serve the
    // committed snapshot with HTTP 200. This section must never render an error.
    return json(fallback(), false);
  }
};
