"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, Calendar, FileText } from "lucide-react";
import type { GroundTruthDataset } from "@/types/evaluation";

interface DatasetPreviewProps {
  dataset: GroundTruthDataset;
}

export function DatasetPreview({ dataset }: DatasetPreviewProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="border-blue-200 dark:border-blue-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center">
            <Eye className="h-4 w-4 mr-2 text-blue-600" />
            Dataset Preview
          </CardTitle>
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <Calendar className="h-3 w-3" />
            <span>Modified {formatDate(dataset.lastModified)}</span>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <FileText className="h-3 w-3 text-slate-400" />
            <span className="text-slate-600 dark:text-slate-400">
              {dataset.filename}
            </span>
          </div>
          <Badge variant="secondary">{dataset.questionCount} questions</Badge>
          <Badge variant="outline">{dataset.category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48">
          <div className="space-y-3">
            {dataset.preview?.map((row, index) => (
              <div key={index} className="border rounded-lg p-3 space-y-2">
                <div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Question {index + 1}
                  </span>
                  <p className="text-sm text-slate-900 dark:text-slate-100 mt-1">
                    {row.question}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Ground Truth
                  </span>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-3">
                    {row.ground_truth}
                  </p>
                </div>
              </div>
            ))}
            {dataset.preview &&
              dataset.preview.length < dataset.questionCount && (
                <div className="text-center py-2">
                  <span className="text-xs text-slate-500">
                    ... and {dataset.questionCount - dataset.preview.length}{" "}
                    more questions
                  </span>
                </div>
              )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
