"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Eye,
  CheckCircle,
  XCircle,
  Filter as FilterIcon,
  Shuffle,
} from "lucide-react";
import type { DetailedResult } from "@/types/evaluation";

// -------- Metric config --------
const METRIC_KEYS = [
  { key: "Answer_Correctness", label: "Correctness" },
  { key: "Answer_Relevancy", label: "Relevancy" },
  { key: "Coherence", label: "Coherence" },
  { key: "Conciseness", label: "Conciseness" },
  { key: "Ground Truth Coherence", label: "GT Coherence" },
  { key: "Ground Truth Completeness", label: "GT Completeness" },
  { key: "Ground Truth Specificity", label: "GT Specificity" },
] as const;

type MetricKey = (typeof METRIC_KEYS)[number]["key"];
type ViewMode = "all" | "pass" | "fail";
type SortMode = "none" | "pass-first" | "fail-first";

interface DetailedResultsTableProps {
  results: DetailedResult[];
}

export function DetailedResultsTable({ results }: DetailedResultsTableProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [sortMode, setSortMode] = useState<SortMode>("none");
  const [selectedResult, setSelectedResult] = useState<DetailedResult | null>(
    null
  );

  const getScoreIcon = (score: string) =>
    score === "1" ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );

  const getScoreBadge = (score: string) => (
    <Badge
      variant={score === "1" ? "default" : "destructive"}
      className="text-xs"
    >
      {score === "1" ? "Pass" : "Fail"}
    </Badge>
  );

  const truncateText = (text: string, maxLength = 100) =>
    text.length > maxLength ? text.substring(0, maxLength) + "..." : text;

  const getMetricValue = (row: DetailedResult, key: MetricKey): "1" | "0" => {
    // TypeScript-friendly access for GT keys with spaces
    return (row as any)[key] === "1" ? "1" : "0";
  };

  // ---- Derive filtered + sorted rows ----
  const visibleRows = useMemo(() => {
    let rows = results;

    // Filtering by selected metric + view mode
    if (selectedMetric && viewMode !== "all") {
      rows = rows.filter((r) =>
        viewMode === "pass"
          ? getMetricValue(r, selectedMetric) === "1"
          : getMetricValue(r, selectedMetric) === "0"
      );
    }

    // Binary sort when selected metric + sort mode
    if (selectedMetric && sortMode !== "none") {
      const passFirst = sortMode === "pass-first";
      rows = [...rows].sort((a, b) => {
        const av = getMetricValue(a, selectedMetric);
        const bv = getMetricValue(b, selectedMetric);
        if (av === bv) return 0;
        // "1" should come first if passFirst, otherwise "0"
        return passFirst ? (av === "1" ? -1 : 1) : av === "0" ? -1 : 1;
      });
    }

    return rows;
  }, [results, selectedMetric, viewMode, sortMode]);

  // Cycle sort mode: none -> pass-first -> fail-first -> none
  const cycleSortMode = () => {
    setSortMode((prev) =>
      prev === "none"
        ? "pass-first"
        : prev === "pass-first"
        ? "fail-first"
        : "none"
    );
  };

  const sortLabel =
    sortMode === "none"
      ? "No Sort"
      : sortMode === "pass-first"
      ? "Pass First"
      : "Fail First";

  return (
    <>
      {/* Filter Bar */}
      <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        {/* Metric chips */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs uppercase tracking-wide text-slate-500 flex items-center gap-1">
            <FilterIcon className="h-3.5 w-3.5" />
            Metric
          </span>
          <div className="flex flex-wrap gap-2">
            {METRIC_KEYS.map(({ key, label }) => {
              const active = selectedMetric === key;
              return (
                <Button
                  key={key}
                  variant={active ? "default" : "outline"}
                  size="sm"
                  className={active ? "" : "bg-transparent"}
                  onClick={() => {
                    // toggle metric: click again to clear
                    setSelectedMetric((prev) => (prev === key ? null : key));
                    // when choosing a metric, default to pass-first sort for clarity
                    setSortMode((prev) =>
                      prev === "none" ? "pass-first" : prev
                    );
                  }}
                >
                  {label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Mode + Sort controls */}
        <div className="flex items-center gap-2">
          {/* View Mode */}
          <div className="flex rounded-lg border p-1">
            {(["all", "pass", "fail"] as ViewMode[]).map((mode) => (
              <Button
                key={mode}
                size="sm"
                variant={viewMode === mode ? "default" : "ghost"}
                onClick={() => setViewMode(mode)}
                disabled={!selectedMetric && mode !== "all"}
                className="px-3"
              >
                {mode === "all" ? "All" : mode === "pass" ? "Pass" : "Fail"}
              </Button>
            ))}
          </div>

          {/* Sort toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={cycleSortMode}
            disabled={!selectedMetric}
            title="Toggle binary sort"
          >
            <Shuffle className="h-4 w-4 mr-2" />
            {sortLabel}
          </Button>
        </div>
      </div>

      {/* Table */}
      <ScrollArea className="h-[400px] w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead className="min-w-[200px]">Question</TableHead>
              <TableHead className="min-w-[200px]">Agent Response</TableHead>
              <TableHead className="w-[80px]">Correct</TableHead>
              <TableHead className="w-[80px]">Relevant</TableHead>
              <TableHead className="w-[80px]">Coherent</TableHead>
              <TableHead className="w-[80px]">Concise</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleRows.map((result, index) => (
              <TableRow key={`${result.question}-${index}`}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>
                  <div className="max-w-[200px]">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {truncateText(result.question, 80)}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-[200px]">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {truncateText(result.response, 80)}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center">
                    {getScoreIcon(result.Answer_Correctness)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center">
                    {getScoreIcon(result.Answer_Relevancy)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center">
                    {getScoreIcon(result.Coherence)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center">
                    {getScoreIcon(result.Conciseness)}
                  </div>
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedResult(result)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>
                          Question {index + 1} - Detailed View
                        </DialogTitle>
                        <DialogDescription>
                          Complete evaluation breakdown for this question
                        </DialogDescription>
                      </DialogHeader>
                      {selectedResult && (
                        <ScrollArea className="h-[60vh] pr-4">
                          <div className="space-y-6">
                            {/* Question */}
                            <div>
                              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                                Question
                              </h4>
                              <p className="text-sm text-slate-700 dark:text-slate-300 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                {selectedResult.question}
                              </p>
                            </div>

                            {/* Agent Response */}
                            <div>
                              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                                Agent Response
                              </h4>
                              <p className="text-sm text-slate-700 dark:text-slate-300 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                {selectedResult.response}
                              </p>
                            </div>

                            {/* Ground Truth */}
                            <div>
                              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                                Ground Truth
                              </h4>
                              <p className="text-sm text-slate-700 dark:text-slate-300 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                {selectedResult.ground_truth}
                              </p>
                            </div>

                            {/* Evaluation Scores */}
                            <div>
                              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
                                Evaluation Scores
                              </h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                  <h5 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    Agent Response Metrics
                                  </h5>
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm">
                                        Answer Correctness
                                      </span>
                                      {getScoreBadge(
                                        selectedResult.Answer_Correctness
                                      )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm">
                                        Answer Relevancy
                                      </span>
                                      {getScoreBadge(
                                        selectedResult.Answer_Relevancy
                                      )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm">Coherence</span>
                                      {getScoreBadge(selectedResult.Coherence)}
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm">
                                        Conciseness
                                      </span>
                                      {getScoreBadge(
                                        selectedResult.Conciseness
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  <h5 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    Ground Truth Quality
                                  </h5>
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm">
                                        GT Coherence
                                      </span>
                                      {getScoreBadge(
                                        selectedResult["Ground Truth Coherence"]
                                      )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm">
                                        GT Completeness
                                      </span>
                                      {getScoreBadge(
                                        selectedResult[
                                          "Ground Truth Completeness"
                                        ]
                                      )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm">
                                        GT Specificity
                                      </span>
                                      {getScoreBadge(
                                        selectedResult[
                                          "Ground Truth Specificity"
                                        ]
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </ScrollArea>
                      )}
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </>
  );
}
