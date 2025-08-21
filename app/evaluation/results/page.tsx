"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Download,
  Play,
  Calendar,
  Hash,
  BarChart3,
  TableIcon,
  Clock,
  MapPin,
  Bot,
} from "lucide-react";
import { MetricsSummary } from "@/components/metrics-summary";
import { DetailedResultsTable } from "@/components/detailed-results-table";
import { TrendGraph } from "@/components/trend-graph";
import { RunsListTable } from "@/components/runs-list-table";
import mockDetailedResults from "@/data/mock-detailed-results.json";
import mockAggregatedResults from "@/data/mock-aggregated-results.json";
import { mockTrendData } from "@/data/mock-data";
import type { EvaluationResult } from "@/types/evaluation";
import type { Run } from "@/types/run";
import { useToast } from "@/hooks/use-toast";

// —— helper maps ——
const getAgentDisplayName = (name: string) => {
  const agentMap: Record<string, string> = {
    hr_copilot: "HR Copilot",
    legal_copilot: "Legal Copilot",
    pharos_udx: "Pharos UDX",
  };
  return agentMap[name] || name;
};

const AGENT_OPTIONS = Object.keys(mockTrendData).map((key) => ({
  id: key,
  label: getAgentDisplayName(key),
}));

export default function EvaluationResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Query params when coming from Progress
  const evaluationIdFromQuery = searchParams.get("id");
  const agentFromQuery = searchParams.get("agent");
  const evalTypeFromQuery = searchParams.get("type");
  const region = searchParams.get("region");

  // Direct mode: user selects agent here
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  // unified state derived from either path
  const [currentResult, setCurrentResult] = useState<EvaluationResult | null>(
    null
  );
  const [runs, setRuns] = useState<Run[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Determine page mode
  const fromProgress =
    !!evaluationIdFromQuery && !!agentFromQuery && !!evalTypeFromQuery;

  // Effective agent & type for data loading
  const effectiveAgent =
    (fromProgress ? agentFromQuery : selectedAgent) || undefined;
  const effectiveType =
    (fromProgress ? (evalTypeFromQuery as string) : "POINTWISE") || "POINTWISE";

  useEffect(() => {
    // If direct entry and no agent chosen yet: stop here (show selector UI)
    if (!fromProgress && !selectedAgent) {
      setIsLoading(false);
      setCurrentResult(null);
      setRuns([]);
      return;
    }

    // If we’re missing any required info even in progress mode, push back to setup
    if (
      fromProgress &&
      (!evaluationIdFromQuery || !agentFromQuery || !evalTypeFromQuery)
    ) {
      router.push("/evaluation/setup");
      return;
    }

    if (!effectiveAgent) return;

    const load = async () => {
      setIsLoading(true);
      await new Promise((res) => setTimeout(res, 400)); // small UX delay

      const agentKey = effectiveAgent as keyof typeof mockTrendData;
      const trendRows = mockTrendData[agentKey] || [];

      // derive runs (mark latest ~5 as experiments for nice defaults)
      const derivedRuns: Run[] = trendRows.map((row: any, idx: number) => {
        const isOneOfLatest5 = idx >= Math.max(0, trendRows.length - 3);
        return {
          id: `${agentKey}-${row.run}`,
          agentId: agentKey,
          createdAt: new Date(row.timestamp).toISOString(),
          isExperiment: isOneOfLatest5,
          metrics: {
            Answer_Correctness: row.Answer_Correctness,
            Answer_Relevancy: row.Answer_Relevancy,
            Coherence: row.Coherence,
            Conciseness: row.Conciseness,
          },
        };
      });
      setRuns(derivedRuns);

      // Build an EvaluationResult
      // If from Progress: reuse your mockAggregatedResults payload
      // If direct: synthesize the "latest" result from last trend row
      let result: EvaluationResult;

      if (fromProgress) {
        result = {
          evaluation_id:
            evaluationIdFromQuery || mockAggregatedResults.evaluation_id,
          evaluation_type:
            (evalTypeFromQuery as string) ||
            mockAggregatedResults.evaluation_type,
          agent_name: agentKey as string,
          total_questions: mockAggregatedResults.total_questions,
          timestamp: mockAggregatedResults.timestamp,
          file_path: mockAggregatedResults.file_path,
          aggregated_results: mockAggregatedResults.aggregated_results,
          detailed_results: mockDetailedResults.detailed_results,
        };
      } else {
        // DIRECT MODE: pick last row for "latest" result
        const last = trendRows[trendRows.length - 1];
        const fallbackTimestamp = new Date().toISOString();
        result = {
          evaluation_id: `history_${agentKey}_${last?.run ?? "latest"}`,
          evaluation_type: "POINTWISE",
          agent_name: agentKey as string,
          total_questions: 100,
          timestamp: last?.timestamp ?? fallbackTimestamp,
          file_path: "/mock/latest.csv",
          aggregated_results: last
            ? {
                Answer_Correctness: last.Answer_Correctness,
                Answer_Relevancy: last.Answer_Relevancy,
                Coherence: last.Coherence,
                Conciseness: last.Conciseness,
              }
            : mockAggregatedResults.aggregated_results,
          detailed_results: mockDetailedResults.detailed_results,
        };
      }

      setCurrentResult(result);
      setIsLoading(false);
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fromProgress,
    selectedAgent,
    effectiveAgent,
    evaluationIdFromQuery,
    agentFromQuery,
    evalTypeFromQuery,
  ]);

  const formatTimestamp = (timestamp: string) =>
    new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const headlineMetric = useMemo(() => {
    if (!currentResult?.aggregated_results) return null;
    const correctness = currentResult.aggregated_results.Answer_Correctness;
    return {
      label: "Correctness",
      value: correctness,
      color:
        correctness >= 80
          ? "text-green-600"
          : correctness >= 60
          ? "text-yellow-600"
          : "text-red-600",
    };
  }, [currentResult]);

  const handleDownloadCSV = () => {
    if (!currentResult?.detailed_results) return;

    const headers = [
      "Question",
      "Agent Response",
      "Ground Truth",
      "Answer Correctness",
      "Answer Relevancy",
      "Coherence",
      "Conciseness",
      "Ground Truth Coherence",
      "Ground Truth Completeness",
      "Ground Truth Specificity",
    ];

    const csvContent = [
      headers.join(","),
      ...currentResult.detailed_results.map((row) =>
        [
          `"${row.question.replace(/"/g, '""')}"`,
          `"${row.response.replace(/"/g, '""')}"`,
          `"${row.ground_truth.replace(/"/g, '""')}"`,
          row.Answer_Correctness,
          row.Answer_Relevancy,
          row.Coherence,
          row.Conciseness,
          row["Ground Truth Coherence"],
          row["Ground Truth Completeness"],
          row["Ground Truth Specificity"],
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evaluation_${currentResult.evaluation_id}_detailed.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "CSV Downloaded",
      description: "Detailed results have been exported successfully",
    });
  };

  const handleExperimentToggle = (runId: string, isExperiment: boolean) => {
    setRuns((prev) =>
      prev.map((r) => (r.id === runId ? { ...r, isExperiment } : r))
    );
  };

  // ====== Direct-entry gate: pick an agent first ======
  if (!fromProgress && !selectedAgent) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bot className="h-5 w-5 mr-2 text-blue-600" />
              Select an Agent to View Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Choose a domain agent to load its latest historical evaluation and
              trend data.
            </p>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <span className="text-sm text-slate-500">Agent</span>
                <div className="mt-2">
                  <Select onValueChange={(val) => setSelectedAgent(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an agent..." />
                    </SelectTrigger>
                    <SelectContent>
                      {AGENT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-500">
              Tip: You can also start a new evaluation from{" "}
              <button
                className="underline underline-offset-2"
                onClick={() => router.push("/evaluation/setup")}
              >
                Evaluation Setup
              </button>
              .
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ====== Loading skeleton ======
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
          <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    );
  }

  if (!currentResult) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Results Not Found
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            The evaluation results could not be loaded.
          </p>
          <Button onClick={() => router.push("/evaluation/setup")}>
            Start New Evaluation
          </Button>
        </div>
      </div>
    );
  }

  // UI chrome text depending on mode
  const pageTitle = fromProgress ? "Evaluation Results" : "Historical Results";
  const badgeText = fromProgress ? "Completed" : "Latest";
  const showBackToSetup = fromProgress; // show back only for progress path

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        {showBackToSetup && (
          <Button
            variant="ghost"
            onClick={() => router.push("/evaluation/setup")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Setup
          </Button>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {pageTitle}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {fromProgress
                ? "Comprehensive analysis and metrics for your GenAI agent evaluation"
                : "The most recent evaluation snapshot for the selected agent, with trends"}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleDownloadCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              onClick={() => router.push("/evaluation/setup")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Play className="h-4 w-4 mr-2" />
              Run Another
            </Button>
          </div>
        </div>
      </div>

      {/* Header card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
              {getAgentDisplayName(currentResult.agent_name)}{" "}
              <span className="mx-1">—</span>
              {currentResult.evaluation_type}
              {!fromProgress && (
                <span className="ml-2 text-sm text-slate-500">(latest)</span>
              )}
            </div>
            <Badge variant="secondary">{badgeText}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Hash className="h-4 w-4 text-slate-400" />
              <div>
                <span className="text-slate-500">Evaluation ID:</span>
                <p className="font-mono text-xs text-slate-900 dark:text-slate-100 mt-1 break-all">
                  {currentResult.evaluation_id}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <div>
                <span className="text-slate-500">Timestamp:</span>
                <p className="font-medium text-slate-900 dark:text-slate-100 mt-1">
                  {formatTimestamp(currentResult.timestamp)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <TableIcon className="h-4 w-4 text-slate-400" />
              <div>
                <span className="text-slate-500">Total Questions:</span>
                <p className="font-medium text-slate-900 dark:text-slate-100 mt-1">
                  {currentResult.total_questions}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <div>
                <span className="text-slate-500">Duration:</span>
                <p className="font-medium text-slate-900 dark:text-slate-100 mt-1">
                  ~3m 42s
                </p>
              </div>
            </div>
            {/* Region only when present (i.e., Pharos runs) */}
            {region && region !== "null" && (
              <div className="flex items-center space-x-2 md:col-span-2">
                <MapPin className="h-4 w-4 text-slate-400" />
                <div>
                  <span className="text-slate-500">Region:</span>
                  <p className="font-medium text-slate-900 dark:text-slate-100 mt-1">
                    {region}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* KPI */}
      {headlineMetric && (
        <Card className="mb-6 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="text-center">
              <div
                className={`text-5xl font-bold ${headlineMetric.color} mb-2`}
              >
                {headlineMetric?.value?.toFixed(1)}%
              </div>
              <div className="text-lg text-slate-600 dark:text-slate-400">
                Overall {headlineMetric.label} Score
              </div>
              <p className="text-sm text-slate-500 mt-2">
                Based on {currentResult.total_questions} evaluated questions
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metrics">Score Breakdown</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Results</TabsTrigger>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Evaluation Metrics</CardTitle>
            </CardHeader>
            <CardContent className="px-10">
              {currentResult.aggregated_results && (
                <MetricsSummary metrics={currentResult.aggregated_results} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Record-Level Analysis</span>
                <Badge variant="outline">
                  {currentResult.detailed_results?.length || 0} records
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentResult.detailed_results && (
                <DetailedResultsTable
                  results={currentResult.detailed_results}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <TrendGraph runs={runs} />
            </div>
            <div className="lg:col-span-5">
              <RunsListTable
                runs={runs}
                onExperimentToggle={handleExperimentToggle}
                metricForDisplay="Answer_Correctness"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
