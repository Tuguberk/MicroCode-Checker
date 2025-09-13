import { useEffect, useState } from "react";
import { buildBadgeMarkdown, buildBadgeUrl } from "@/lib/badge";

export default function InlineBadgePreview({ repoUrl }: { repoUrl: string }) {
  const [copied, setCopied] = useState(false);
  const markdown = buildBadgeMarkdown(repoUrl);
  const endpointFlat = buildBadgeUrl(repoUrl, "flat");
  const endpointSquare = buildBadgeUrl(repoUrl, "flat-square");
  const endpointFTB = buildBadgeUrl(repoUrl, "for-the-badge");
  const shieldSrc = (u: string) =>
    `https://img.shields.io/endpoint?url=${encodeURIComponent(u)}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
    } catch {
      // ignore clipboard errors
    }
  };
  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(t);
  }, [copied]);
  if (!markdown) return null;
  return (
    <div className="w-full max-w-3xl mx-auto rounded-md border border-neutral-200 p-4 text-sm space-y-3">
      <p className="text-neutral-600">
        Aşağıdaki markdown, README dosyanıza ekleyebileceğiniz MicroCode rozetinin URL’ini içerir.
      </p>
      <div className="flex items-center justify-between gap-3">
        <div className="truncate text-neutral-700">{markdown}</div>
        <button
          onClick={copy}
          disabled={copied}
          className={
            copied
              ? "shrink-0 rounded-md border border-green-200 bg-green-50 px-3 py-1.5 text-green-700"
              : "shrink-0 rounded-md border border-neutral-300 px-3 py-1.5 hover:bg-neutral-100"
          }
        >
          {copied ? "Kopyalandı" : "Kopyala"}
        </button>
      </div>
      <div className="pt-1">
        <p className="text-neutral-500 mb-2">Örnek rozetler:</p>
        <div className="flex items-center gap-3 flex-wrap">
          {endpointFlat && (
            <img
              src={shieldSrc(endpointFlat)}
              alt="MicroCode badge (flat)"
              className="h-6"
            />
          )}
          {endpointSquare && (
            <img
              src={shieldSrc(endpointSquare)}
              alt="MicroCode badge (flat-square)"
              className="h-6"
            />
          )}
          {endpointFTB && (
            <img
              src={shieldSrc(endpointFTB)}
              alt="MicroCode badge (for-the-badge)"
              className="h-6"
            />
          )}
        </div>
      </div>
    </div>
  );
}
