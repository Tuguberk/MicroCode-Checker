import type { VercelRequest, VercelResponse } from "@vercel/node";

interface GitHubTreeItem {
  path: string;
  mode: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
  url: string;
}

interface GitHubTreeResponse {
  sha: string;
  url: string;
  tree: GitHubTreeItem[];
  truncated: boolean;
}

interface GitHubFileResponse {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: "file";
  content: string;
  encoding: "base64";
}

const CODE_EXTENSIONS = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".py",
  ".java",
  ".cpp",
  ".c",
  ".h",
  ".cs",
  ".php",
  ".rb",
  ".go",
  ".rs",
  ".swift",
  ".kt",
  ".scala",
  ".m",
  ".mm",
  ".r",
  ".sql",
  ".html",
  ".htm",
  ".css",
  ".scss",
  ".sass",
  ".less",
  ".vue",
  ".svelte",
  ".md",
  ".markdown",
  ".json",
  ".xml",
  ".yaml",
  ".yml",
  ".toml",
  ".ini",
  ".sh",
  ".bash",
  ".zsh",
  ".fish",
  ".ps1",
  ".dockerfile",
  ".makefile",
];

const EXCLUDED_DIRS = [
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".nuxt",
  "coverage",
  ".nyc_output",
  ".vscode",
  ".idea",
  "__pycache__",
  ".pytest_cache",
  "venv",
  ".venv",
  "env",
  ".env",
  "target",
  "bin",
  "obj",
  "out",
];

const EXCLUDED_FILES = [
  ".gitignore",
  ".gitattributes",
  ".editorconfig",
  ".eslintrc",
  ".prettierrc",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "composer.lock",
  "Gemfile.lock",
  "poetry.lock",
  "Pipfile.lock",
];

function parseGitHubUrl(
  urlOrRepo: string
): { owner: string; repo: string } | null {
  if (/^[^/]+\/[^/]+$/.test(urlOrRepo)) {
    const [owner, repo] = urlOrRepo.split("/");
    return { owner, repo: repo.replace(/\.git$/, "") };
  }
  const re = new RegExp("^https://github\\.com/([^/]+)/([^/]+)/?");
  const match = urlOrRepo.match(re);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

function shouldIncludeFile(path: string): boolean {
  for (const excludedDir of EXCLUDED_DIRS) {
    if (
      path.includes(`/${excludedDir}/`) ||
      path.startsWith(`${excludedDir}/`)
    ) {
      return false;
    }
  }
  const fileName = path.split("/").pop() || "";
  if (EXCLUDED_FILES.includes(fileName)) return false;
  const hasCodeExtension = CODE_EXTENSIONS.some((ext) =>
    path.toLowerCase().endsWith(ext)
  );
  const isConfigFile = ["README", "LICENSE", "CHANGELOG", "CONTRIBUTING"].some(
    (name) => fileName.toUpperCase().startsWith(name)
  );
  return hasCodeExtension || isConfigFile;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=60");
    return res.status(405).json({
      schemaVersion: 1,
      label: "MicroCode",
      message: "method not allowed",
      color: "inactive",
      isError: true,
    });
  }

  const urlParam = (req.query.url as string) || "";
  const repoParam = (req.query.repo as string) || "";
  const target = urlParam || repoParam;
  const style = (req.query.style as string) || "flat";

  const parsed = parseGitHubUrl(target);
  if (!parsed) {
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=600");
    return res.status(200).json({
      schemaVersion: 1,
      label: "MicroCode",
      message: "invalid repo",
      color: "red",
      isError: true,
      style,
    });
  }

  const { owner, repo } = parsed;

  try {
    const repoResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "MicroCode-Checker",
        },
      }
    );
    if (!repoResponse.ok) {
      const color = repoResponse.status === 404 ? "red" : "inactive";
      res.setHeader("Cache-Control", "public, max-age=0, s-maxage=600");
      return res.status(200).json({
        schemaVersion: 1,
        label: "MicroCode",
        message:
          repoResponse.status === 404
            ? "not found"
            : `error ${repoResponse.status}`,
        color,
        isError: true,
        style,
      });
    }
    const repoInfo = await repoResponse.json();
    const defaultBranch = repoInfo.default_branch;

    const treeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "MicroCode-Checker",
        },
      }
    );
    if (!treeResponse.ok) {
      res.setHeader("Cache-Control", "public, max-age=0, s-maxage=600");
      return res.status(200).json({
        schemaVersion: 1,
        label: "MicroCode",
        message: `tree err ${treeResponse.status}`,
        color: "inactive",
        isError: true,
        style,
      });
    }
    const treeData: GitHubTreeResponse = await treeResponse.json();

    const codeFiles = treeData.tree.filter(
      (item) => item.type === "blob" && shouldIncludeFile(item.path)
    );

    let totalCharacters = 0;
    const BATCH_SIZE = 10;
    for (let i = 0; i < codeFiles.length; i += BATCH_SIZE) {
      const batch = codeFiles.slice(i, i + BATCH_SIZE);
      const promises = batch.map(async (file) => {
        try {
          const fileResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`,
            {
              headers: {
                Accept: "application/vnd.github.v3+json",
                "User-Agent": "MicroCode-Checker",
              },
            }
          );
          if (!fileResponse.ok) return 0;
          const fileData: GitHubFileResponse = await fileResponse.json();
          const content = Buffer.from(fileData.content, "base64").toString(
            "utf-8"
          );
          return content.length;
        } catch {
          return 0;
        }
      });
      const batchResults = await Promise.all(promises);
      totalCharacters += batchResults.reduce((a, b) => a + b, 0);
      if (i + BATCH_SIZE < codeFiles.length) {
        await new Promise((r) => setTimeout(r, 100));
      }
    }

    // LLM thresholds (keep in sync with frontend constants if needed)
    const LLM_CONTEXTS: Array<{ name: string; tokens: number }> = [
      { name: "GPT-4", tokens: 8192 },
      { name: "GPT-4-32k", tokens: 32768 },
      { name: "GPT-3.5-16k", tokens: 16385 },
      { name: "Claude 3 Sonnet", tokens: 200000 },
      { name: "Gemini 1.5 Pro", tokens: 1000000 },
    ];
    const CHARS_PER_TOKEN = 4;
    const fitsCount = LLM_CONTEXTS.filter(
      (l) => totalCharacters <= l.tokens * CHARS_PER_TOKEN
    ).length;
    const totalModels = LLM_CONTEXTS.length;
    const ratio = fitsCount / totalModels;
    const color = fitsCount === 0 ? "red" : ratio < 0.5 ? "yellow" : "green";

    const message = `fits ${fitsCount}/${totalModels}`;

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    // Cache for 1 hour on edge, allow stale for a day
    res.setHeader(
      "Cache-Control",
      "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400"
    );
    return res.status(200).json({
      schemaVersion: 1,
      label: "MicroCode",
      message,
      color,
      labelColor: "black",
      namedLogo: "github",
      logoColor: "white",
      style,
    });
  } catch {
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=600");
    return res.status(200).json({
      schemaVersion: 1,
      label: "MicroCode",
      message: "error",
      color: "inactive",
      isError: true,
      style,
    });
  }
}
