import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const origin = typeof window !== "undefined" ? window.location.origin : "";

const buildBadgeUrl = (repoOrUrl: string, style = "flat") => {
  if (!repoOrUrl) return "";
  const u = new URL(`${origin}/api/badge`);
  // repo veya url parametresi ile çalışır
  if (/^https?:\/\//.test(repoOrUrl)) {
    u.searchParams.set("url", repoOrUrl);
  } else {
    u.searchParams.set("repo", repoOrUrl);
  }
  u.searchParams.set("style", style);
  return u.toString();
};

const buildMarkdown = (repoOrUrl: string) => {
  const badge = buildBadgeUrl(repoOrUrl);
  if (!badge) return "";
  const linkTarget =
    typeof window !== "undefined" ? window.location.origin : "";
  return `[![MicroCode](https://img.shields.io/endpoint?url=${encodeURIComponent(
    badge
  )})](${linkTarget})`;
};

export default function BadgeGenerator() {
  const [value, setValue] = useState("");
  const markdown = useMemo(() => buildMarkdown(value), [value]);

  const copy = async () => {
    if (!markdown) return;
    try {
      await navigator.clipboard.writeText(markdown);
      alert("Markdown kopyalandı");
    } catch {
      // fallback
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto rounded-md border border-neutral-200 p-4 mt-8">
      <div className="flex flex-col gap-3">
        <label className="text-sm text-neutral-700">
          Repo URL veya owner/repo
        </label>
        <div className="flex gap-2">
          <Input
            placeholder="owner/repo veya https://github.com/owner/repo"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <Button onClick={copy} disabled={!markdown}>
            Kopyala
          </Button>
        </div>
        <div className="text-xs text-neutral-500">
          README’ye eklemek için aşağıdaki Markdown rozetini kopyalayın.
        </div>
        <pre className="whitespace-pre-wrap break-all text-xs bg-neutral-50 p-3 rounded border border-neutral-200">
          {markdown || "[Rozet burada görünecek]"}
        </pre>
      </div>
    </div>
  );
}
