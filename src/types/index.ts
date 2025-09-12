// /types/index.ts

export type LLMInfo = {
  name: string;
  contextTokens: number;
};

export type AnalysisResult = {
  totalCharacters: number;
  repoUrl: string;
  llmFits: {
    llmName: string;
    fits: boolean;
    repoPercentage: number; // The percentage of the context it occupies
  }[];
};

export type ApiError = {
  message: string;
};
