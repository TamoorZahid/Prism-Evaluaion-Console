"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight, Beaker } from "lucide-react";
import type { Run } from "@/types/run";
import { useToast } from "@/hooks/use-toast";

interface RunsListTableProps {
  runs: Run[];
  onExperimentToggle: (runId: string, isExperiment: boolean) => void;
  metricForDisplay?: keyof Run["metrics"]; // e.g., "Answer_Correctness"
  /** Max table height in px; content scrolls when exceeded. Default: 480 */
  maxHeight?: number;
}

export function RunsListTable({
  runs,
  onExperimentToggle,
  metricForDisplay = "Answer_Correctness",
  maxHeight = 480,
}: RunsListTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(runs.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRuns = runs
    .slice()
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(startIndex, endIndex);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleExperimentToggle = async (
    runId: string,
    currentValue: boolean
  ) => {
    const newValue = !currentValue;
    setIsUpdating(runId);

    try {
      onExperimentToggle(runId, newValue); // optimistic
      await new Promise((r) => setTimeout(r, 300)); // simulate latency
      toast({
        title: newValue ? "Added to experiments" : "Removed from experiments",
        description: `Run ${runId} ${
          newValue ? "will now" : "will no longer"
        } appear in the trends graph.`,
      });
    } catch {
      onExperimentToggle(runId, currentValue); // revert
      toast({
        title: "Couldn't save your change",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const getMetricValue = (run: Run) => {
    const v = run.metrics[metricForDisplay];
    return typeof v === "number" ? `${v.toFixed(1)}%` : "N/A";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Beaker className="h-4 w-4 mr-2 text-blue-600" />
          Runs List
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          {/* Scroll container with sticky header */}
          <div
            className="overflow-y-auto"
            style={{ maxHeight: `${maxHeight}px` }}
            role="region"
            aria-label="Runs list"
          >
            <Table className="w-full">
              <TableHeader className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/75 dark:supports-[backdrop-filter]:bg-slate-900/75 border-b">
                <TableRow>
                  <TableHead className="w-[80px] pl-3 pr-0">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help">Experiment</span>
                        </TooltipTrigger>
                        <TooltipContent
                          side="bottom"
                          align="start"
                          sideOffset={8}
                          className="z-[70] max-w-[260px]"
                        >
                          <p>Include this run in the trend graph.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableHead>
                  <TableHead className="pr-0">Date/Time</TableHead>
                  <TableHead className="pr-0">Run</TableHead>
                  <TableHead className="pr-0">
                    Overall
                    {/* {(metricForDisplay as string).replace(/_/g, " ")} */}
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {currentRuns.map((run, i) => (
                  <TableRow
                    key={run.id}
                    className={
                      i % 2 === 1 ? "bg-slate-50/50 dark:bg-slate-800/30" : ""
                    }
                  >
                    <TableCell className="flex">
                      <div className="items-center m-auto space-x-2">
                        <Switch
                          checked={run.isExperiment}
                          onCheckedChange={() =>
                            handleExperimentToggle(run.id, run.isExperiment)
                          }
                          disabled={isUpdating === run.id}
                          aria-label={`Toggle experiment status for run ${run.id}`}
                        />
                        {/* {run.isExperiment && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] pX-2"
                          >
                            Ex
                          </Badge>
                        )} */}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                      {formatDate(run.createdAt)}
                    </TableCell>
                    <TableCell className="font-mono pl-2 pr-0 text-sm">
                      {run.id}
                    </TableCell>
                    <TableCell className="text-right pr-0 font-medium">
                      {getMetricValue(run)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination (kept) */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Showing {startIndex + 1}-{Math.min(endIndex, runs.length)} of{" "}
              {runs.length} runs
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
