export const getOrigin = () =>
  typeof window !== "undefined" ? window.location.origin : "";

export const buildBadgeUrl = (repoOrUrl: string, style = "flat") => {
  const origin = getOrigin();
  if (!repoOrUrl || !origin) return "";
  const u = new URL(`${origin}/api/badge`);
  if (/^https?:\/\//.test(repoOrUrl)) {
    u.searchParams.set("url", repoOrUrl);
  } else {
    u.searchParams.set("repo", repoOrUrl);
  }
  u.searchParams.set("style", style);
  return u.toString();
};

export const buildBadgeMarkdown = (repoOrUrl: string) => {
  const origin = getOrigin();
  const badge = buildBadgeUrl(repoOrUrl);
  if (!badge || !origin) return "";
  return `[![MicroCode](https://img.shields.io/endpoint?url=${encodeURIComponent(
    badge
  )})](${origin})`;
};
