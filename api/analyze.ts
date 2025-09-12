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
  const match = url.match(/https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/?/);
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
      throw new Error(
        `Failed to fetch repository tree: ${treeResponse.status}`
      );
    }

    const treeData: GitHubTreeResponse = await treeResponse.json();

    // Filter files to only include code files
    const codeFiles = treeData.tree.filter(
      (item) => item.type === "blob" && shouldIncludeFile(item.path)
    );

    let totalCharacters = 0;
    const fileResults: Array<{ path: string; chars: number; error?: string }> =
      [];

    // Fetch content for each file (in batches to avoid rate limiting)
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

          if (!fileResponse.ok) {
            return {
              path: file.path,
              chars: 0,
              error: `HTTP ${fileResponse.status}`,
            };
          }

          const fileData: GitHubFileResponse = await fileResponse.json();

          // Decode base64 content
          const content = Buffer.from(fileData.content, "base64").toString(
            "utf-8"
          );
          const chars = content.length;

          return { path: file.path, chars };
        } catch (error) {
          return {
            path: file.path,
            chars: 0,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      });

      const batchResults = await Promise.all(promises);
      fileResults.push(...batchResults);

      // Add characters from successful files
      batchResults.forEach((result) => {
        if (!result.error) {
          totalCharacters += result.chars;
        }
      });

      // Add a small delay between batches to be respectful to GitHub API
      if (i + BATCH_SIZE < codeFiles.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    // Log some stats for debugging (you can remove this in production)
    const successfulFiles = fileResults.filter((r) => !r.error);
    const failedFiles = fileResults.filter((r) => r.error);

    console.log(
      `Analyzed ${successfulFiles.length} files, ${failedFiles.length} failed`
    );
    console.log(`Total characters: ${totalCharacters}`);

    return res.status(200).json({
      totalCharacters,
      filesAnalyzed: successfulFiles.length,
      filesFailed: failedFiles.length,
      repository: `${owner}/${repo}`,
    });
  } catch (error) {
    console.error("Analysis error:", error);

    return res.status(500).json({
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
