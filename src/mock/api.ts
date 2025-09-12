// Mock API for development
export const mockAnalyzeRepository = async (repoUrl: string) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Mock different repository sizes based on URL
  const mockData = {
    "https://github.com/example/small-repo": {
      totalCharacters: 15000, // Small repo that fits in most LLMs
      filesAnalyzed: 25,
      filesFailed: 0,
      repository: "example/small-repo",
    },
    "https://github.com/example/medium-repo": {
      totalCharacters: 150000, // Medium repo
      filesAnalyzed: 150,
      filesFailed: 2,
      repository: "example/medium-repo",
    },
    "https://github.com/example/large-repo": {
      totalCharacters: 1500000, // Large repo that doesn't fit in smaller LLMs
      filesAnalyzed: 500,
      filesFailed: 5,
      repository: "example/large-repo",
    },
  };

  return (
    mockData[repoUrl as keyof typeof mockData] || {
      totalCharacters: 75000,
      filesAnalyzed: 100,
      filesFailed: 1,
      repository: "unknown/repo",
    }
  );
};
