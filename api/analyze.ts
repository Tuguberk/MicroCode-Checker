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

// İçerik indirmiyoruz; tree içindeki blob size alanını kullanacağız

// Code file extensions to include
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

// Directories to exclude
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

// Files to exclude
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

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const re = new RegExp("^https://github\\.com/([^/]+)/([^/]+)/?");
  const match = url.match(re);
  if (!match) return null;

  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, ""), // Remove .git suffix if present
  };
}

function shouldIncludeFile(path: string): boolean {
  // Check if file is in excluded directory
  for (const excludedDir of EXCLUDED_DIRS) {
    if (
      path.includes(`/${excludedDir}/`) ||
      path.startsWith(`${excludedDir}/`)
    ) {
      return false;
    }
  }

  // Check if file is in excluded files list
  const fileName = path.split("/").pop() || "";
  if (EXCLUDED_FILES.includes(fileName)) {
    return false;
  }

  // Check if file has a code extension
  const hasCodeExtension = CODE_EXTENSIONS.some((ext) =>
    path.toLowerCase().endsWith(ext)
  );

  // Include files with code extensions or common config files without extensions
  const isConfigFile = ["README", "LICENSE", "CHANGELOG", "CONTRIBUTING"].some(
    (name) => fileName.toUpperCase().startsWith(name)
  );

  return hasCodeExtension || isConfigFile;
}

async function fetchTree(
  owner: string,
  repo: string,
  refOrSha: string,
  recursive = false
): Promise<GitHubTreeResponse> {
  const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${refOrSha}${
    recursive ? "?recursive=1" : ""
  }`;
  const r = await fetch(url, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "MicroCode-Checker",
    },
  });
  if (!r.ok) throw new Error(`tree fetch failed: ${r.status}`);
  return (await r.json()) as GitHubTreeResponse;
}

type SumResult = { total: number; requests: number; approximate: boolean };

async function sumBySegments(
  owner: string,
  repo: string,
  refOrSha: string,
  prefix = "",
  budget = 300
): Promise<SumResult> {
  // İlk deneme: recursive; eğer truncated değilse en hızlı yol
  let requests = 0;
  let approximate = false;
  const recursiveTree = await fetchTree(owner, repo, refOrSha, true);
  requests += 1;
  if (!recursiveTree.truncated) {
    const total = recursiveTree.tree.reduce((sum, item) => {
      if (item.type !== "blob") return sum;
      const fullPath = prefix ? `${prefix}/${item.path}` : item.path;
      return shouldIncludeFile(fullPath)
        ? sum + (typeof item.size === "number" ? item.size : 0)
        : sum;
    }, 0);
    return { total, requests, approximate };
  }

  // Truncated ise daha detaylı: non-recursive al, alt ağaçlara in
  approximate = true; // Büyük repolarda hesap parçalı yapılacak
  const nonRecursive = await fetchTree(owner, repo, refOrSha, false);
  requests += 1;
  let total = 0;
  for (const item of nonRecursive.tree) {
    if (budget - requests <= 0) break;
    const fullPath = prefix ? `${prefix}/${item.path}` : item.path;
    if (item.type === "blob") {
      if (shouldIncludeFile(fullPath)) {
        total += typeof item.size === "number" ? item.size : 0;
      }
      continue;
    }
    // Alt ağaç: derine inerek topla
    const res = await sumBySegments(
      owner,
      repo,
      item.sha,
      fullPath,
      budget - requests
    );
    total += res.total;
    requests += res.requests;
    // approximate flag propagate
    approximate = approximate || res.approximate;
    if (budget - requests <= 0) break;
  }
  return { total, requests, approximate };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { repoUrl } = req.body;

  if (!repoUrl) {
    return res.status(400).json({ message: "Repository URL is required" });
  }

  const parsedUrl = parseGitHubUrl(repoUrl);
  if (!parsedUrl) {
    return res.status(400).json({ message: "Invalid GitHub URL format" });
  }

  const { owner, repo } = parsedUrl;

  try {
    // First, get the repository info and default branch
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
      if (repoResponse.status === 404) {
        return res
          .status(404)
          .json({ message: "Repository not found or is private" });
      }
      if (repoResponse.status === 403) {
        return res
          .status(429)
          .json({ message: "GitHub API rate limit exceeded" });
      }
      throw new Error(`GitHub API error: ${repoResponse.status}`);
    }

    const repoInfo = await repoResponse.json();
    const defaultBranch = repoInfo.default_branch;

    // Get the repository tree recursively
    // Segmentli toplama: truncated durumunda derine inerek hesaplar
    const { total, requests, approximate } = await sumBySegments(
      owner,
      repo,
      defaultBranch,
      "",
      300
    );

    console.log(`Requests used: ${requests}`);
    console.log(`Total characters (bytes): ${total}`);

    return res.status(200).json({
      totalCharacters: total,
      filesAnalyzed: undefined, // bilinmiyor; istek bazlı toplama
      filesFailed: 0,
      repository: `${owner}/${repo}`,
      approximate,
    });
  } catch (error) {
    console.error("Analysis error:", error);

    return res.status(500).json({
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
