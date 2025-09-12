import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle } from "lucide-react";

interface LLMResultCardProps {
  llmName: string;
  llmContextSize: number;
  repoSize: number;
  fits: boolean;
  repoPercentage: number;
}

export function LLMResultCard({
  llmName,
  llmContextSize,
  fits,
  repoPercentage,
}: LLMResultCardProps) {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg text-neutral-900">
              {llmName}
            </h3>
            <p className="text-sm text-neutral-500 font-medium">
              {llmContextSize.toLocaleString()} tokens
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {fits ? (
              <CheckCircle
                className="h-5 w-5 text-neutral-900"
                aria-hidden="true"
              />
            ) : (
              <XCircle
                className="h-5 w-5 text-neutral-900"
                aria-hidden="true"
              />
            )}
            <div className="text-right">
              <span className="text-sm font-medium text-neutral-900 block">
                {fits ? "Sığar" : "Sığmaz"}
              </span>
              <span className="text-xs text-neutral-500">
                {repoPercentage > 100
                  ? `${(repoPercentage / 100).toFixed(1)}x fazla`
                  : "Uyumlu"}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm text-neutral-700">
            <span className="font-medium">Context Kullanımı</span>
            <span className="font-semibold text-neutral-900">
              {repoPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="relative">
            <Progress value={Math.min(repoPercentage, 100)} className="h-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
