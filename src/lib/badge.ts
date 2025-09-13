const isNonPublicHost = (host: string) =>
  /(^localhost$)|(^127\.)|(\.local$)/i.test(host);

export const getOrigin = () => {
  // Vite ortam değişkeni (isteğe bağlı)
  const envOrigin = (
    (import.meta as unknown as { env?: { VITE_PUBLIC_ORIGIN?: string } }).env
      ?.VITE_PUBLIC_ORIGIN || ""
  ).trim();
  if (envOrigin && /^https?:\/\//.test(envOrigin)) {
    return envOrigin.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") return window.location.origin;
  return "";
};

export const isLikelyPublicOrigin = (origin: string) => {
  try {
    const u = new URL(origin);
    return u.protocol === "https:" && !isNonPublicHost(u.hostname);
  } catch {
    return false;
  }
};

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