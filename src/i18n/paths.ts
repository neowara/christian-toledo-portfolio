export type Lang = "en" | "sv";

/**
 * Given a lang-neutral, always-English-rooted path (e.g. "/", "/about/", "/blog/turbo/"),
 * returns the URL for that page in the given locale.
 */
export function localizedPath(path: string, lang: Lang): string {
  if (lang === "en") return path;
  return path === "/" ? "/sv/" : `/sv${path}`;
}
