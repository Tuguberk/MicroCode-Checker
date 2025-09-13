import { useState } from "react";
import { RepoForm } from "@/components/RepoForm";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import type { AnalysisResult, ApiError } from "@/types";
import { LLM_DATA, CHARS_PER_TOKEN } from "@/constants/llm-data";
import { mockAnalyzeRepository } from "@/mock/api";
import Footer from "@/components/Footer";
import InlineBadgePreview from "@/components/InlineBadgePreview";

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastRepoUrl, setLastRepoUrl] = useState<string | null>(null);

  const analyzeRepository = async (repoUrl: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setLastRepoUrl(repoUrl);

    try {
      let data;

      // Use mock API in development
      if (import.meta.env.DEV) {
        data = await mockAnalyzeRepository(repoUrl);
      } else {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ repoUrl }),
        });

        if (!response.ok) {
          const errorData: ApiError = await response.json();
          throw new Error(
            errorData.message || "Analiz sırasında bir hata oluştu"
          );
        }

        data = await response.json();
      }

      // Calculate LLM fits
      const llmFits = LLM_DATA.map((llm) => {
        const llmMaxChars = llm.contextTokens * CHARS_PER_TOKEN;
        const fits = data.totalCharacters <= llmMaxChars;
        const repoPercentage = (data.totalCharacters / llmMaxChars) * 100;

        return {
          llmName: llm.name,
          fits,
          repoPercentage: Math.min(repoPercentage, 999), // Cap at 999% for display
        };
      });

      const analysisResult: AnalysisResult = {
        totalCharacters: data.totalCharacters,
        repoUrl,
        llmFits,
      };

      setResult(analysisResult);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-14 max-w-6xl flex-1">
        <div className="flex flex-col items-center gap-10">
          {/* Header */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-neutral-900">
              MicroCode Checker
            </h1>
            <p className="text-base md:text-lg text-neutral-600 max-w-2xl">
              GitHub repo'nuz popüler LLM'lerin context window'una sığıyor mu?
              Link'i girin ve hemen öğrenin.
            </p>
          </div>

          {/* Form with enhanced styling */}
          <div
            className="w-full max-w-2xl animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <RepoForm onSubmit={analyzeRepository} isLoading={isLoading} />
          </div>

          {/* Error */}
          {error && (
            <div
              className="w-full max-w-3xl"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="rounded-md border border-red-200 bg-red-50 text-red-800 px-4 py-3">
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Inline Badge (form ile sonuç arasında gösterim) */}
          {lastRepoUrl && <InlineBadgePreview repoUrl={lastRepoUrl} />}

          {/* Results */}
          <div className="w-full">
            <ResultsDisplay result={result} isLoading={isLoading} />
          </div>

          {/* Badge Generator kaldırıldı – sadece inline rozet önizleme kalacak */}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;
