import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LLMResultCard } from "./LLMResultCard";
import type { AnalysisResult } from "@/types";
import { LLM_DATA, CHARS_PER_TOKEN } from "@/constants/llm-data";
import { FileText, Landmark } from "lucide-react";

interface ResultsDisplayProps {
  result: AnalysisResult | null;
  isLoading: boolean;
}

export function ResultsDisplay({ result, isLoading }: ResultsDisplayProps) {
  if (isLoading) {
    return (
      <Card className="w-full max-w-6xl">
        <CardContent className="p-10">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-10 h-10 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-neutral-900 flex items-center justify-center gap-2">
                <span
                  className="inline-block w-4 h-4 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"
                  aria-hidden="true"
                />
                Repository analiz ediliyor
              </h3>
              <p className="text-neutral-600">
                GitHub API'sinden kod dosyaları çekiliyor ve işleniyor...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card className="w-full max-w-6xl">
        <CardContent className="p-10">
          <div className="text-center space-y-6">
            <div className="relative mx-auto w-24 h-24">
              <svg
                className="w-24 h-24 text-neutral-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-neutral-900">
                Analiz Bekleniyor
              </h3>
              <p className="text-neutral-600 max-w-md mx-auto">
                Yukarıdaki forma bir GitHub repository URL'i girin ve analizi
                başlatın.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalTokens = Math.ceil(result.totalCharacters / CHARS_PER_TOKEN);
  const compatibleLLMs = result.llmFits.filter((llm) => llm.fits).length;

  return (
    <div className="w-full max-w-6xl space-y-8">
      {/* Summary Card */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold text-neutral-900">
            Analiz Sonuçları
          </CardTitle>
          <CardDescription className="text-neutral-600">
            {result.repoUrl}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2 p-4 rounded-md border border-neutral-200">
              <FileText
                className="w-5 h-5 mx-auto text-neutral-500"
                aria-hidden="true"
              />
              <p className="text-3xl font-semibold text-neutral-900">
                {result.totalCharacters.toLocaleString()}
              </p>
              <p className="text-sm text-neutral-600">Toplam Karakter</p>
            </div>
            <div className="space-y-2 p-4 rounded-md border border-neutral-200">
              <FileText
                className="w-5 h-5 mx-auto text-neutral-500"
                aria-hidden="true"
              />
              <p className="text-3xl font-semibold text-neutral-900">
                {totalTokens.toLocaleString()}
              </p>
              <p className="text-sm text-neutral-600">Tahmini Token</p>
            </div>
            <div className="space-y-2 p-4 rounded-md border border-neutral-200">
              <Landmark
                className="w-5 h-5 mx-auto text-neutral-500"
                aria-hidden="true"
              />
              <p className="text-3xl font-semibold text-neutral-900">
                {compatibleLLMs}
              </p>
              <p className="text-sm text-neutral-600">Uyumlu LLM</p>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-xs text-neutral-500 inline-block">
              1 token ≈ 4 karakter (yaklaşık)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* LLM Results Grid */}
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-neutral-900 mb-1">
            LLM Uyumluluk Detayları
          </h2>
          <p className="text-neutral-600 text-sm">
            Her LLM için detaylı sonuçlar
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {result.llmFits.map((llm, index) => {
            const llmData = LLM_DATA.find((l) => l.name === llm.llmName);
            return (
              <div
                key={llm.llmName}
                className="animate-slide-left"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <LLMResultCard
                  llmName={llm.llmName}
                  llmContextSize={llmData?.contextTokens || 0}
                  repoSize={result.totalCharacters}
                  fits={llm.fits}
                  repoPercentage={llm.repoPercentage}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
