export type LLMInfo = { name: string; contextTokens: number };

export const LLM_DATA: LLMInfo[] = [
  { name: "GPT-5", contextTokens: 400000 },
  { name: "Claude Sonnet 4", contextTokens: 1000000 },
  { name: "Grok 4", contextTokens: 256000 },
  { name: "Gemini 2.5 Flash", contextTokens: 1048576 },
  { name: "Gemini 2.5 Pro", contextTokens: 1048576 },
  { name: "Grok Code Fast 1", contextTokens: 256000 },
  { name: "GPT-4.1 Mini", contextTokens: 1047576 },
  { name: "GPT-4", contextTokens: 8192 },
  { name: "GPT-4-32k", contextTokens: 32768 },
  { name: "GPT-3.5-Turbo-16k", contextTokens: 16384 },
  { name: "GPT-4 Turbo", contextTokens: 128000 },
  { name: "GPT-4o", contextTokens: 128000 },
  { name: "GPT-4o mini", contextTokens: 128000 },
  { name: "Claude 3.5 Sonnet", contextTokens: 200000 },
  { name: "Gemini 1.5 Pro", contextTokens: 2000000 },
  { name: "Gemini 1.5 Flash", contextTokens: 1048576 },
  { name: "Llama 3.1 (family)", contextTokens: 128000 },
  { name: "Mistral Large", contextTokens: 32000 },
  { name: "Command R+", contextTokens: 128000 },
  { name: "Grok 3", contextTokens: 1000000 },
  { name: "DeepSeek V2", contextTokens: 128000 },
];

export const CHARS_PER_TOKEN = 4;
