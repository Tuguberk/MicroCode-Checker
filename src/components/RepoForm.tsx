import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Link2 } from "lucide-react";

interface RepoFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export function RepoForm({ onSubmit, isLoading }: RepoFormProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  const isValidGithubUrl = (url: string) => {
    const pattern =
      /^https:\/\/github\.com\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/?$/;
    return pattern.test(url);
  };

  return (
    <div className="w-full max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="relative">
            <Input
              type="url"
              placeholder="https://github.com/owner/repo"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              className="text-center text-base font-medium pr-4"
            />
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            >
              <Link2 className="w-5 h-5 text-neutral-400" />
            </div>
          </div>
          {url && !isValidGithubUrl(url) && (
            <div>
              <p className="text-sm text-red-700 text-center bg-red-50 rounded-md py-2 px-3 border border-red-200">
                <svg
                  className="w-4 h-4 inline mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Lütfen geçerli bir GitHub repository URL'i girin
              </p>
            </div>
          )}
        </div>
        <Button
          type="submit"
          disabled={isLoading || !url.trim() || !isValidGithubUrl(url)}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Spinner size="sm" className="mr-3" />
              <span>Analiz ediliyor…</span>
            </>
          ) : (
            <span>Analizi Başlat</span>
          )}
        </Button>
      </form>
    </div>
  );
}
