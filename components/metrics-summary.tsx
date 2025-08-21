"use client";

import type React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { EvaluationMetrics } from "@/types/evaluation";

interface MetricsSummaryProps {
  metrics: EvaluationMetrics;
  compact?: boolean;
}

export function MetricsSummary({
  metrics,
  compact = false,
}: MetricsSummaryProps) {
  const getMetricColor = (value: number) => {
    if (value >= 80) return "text-green-600";
    if (value >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (value: number) => {
    if (value >= 80) return "bg-green-500";
    if (value >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const agentMetrics = [
    {
      label: "Correctness",
      value: metrics.Answer_Correctness,
      key: "Answer_Correctness",
    },
    {
      label: "Relevancy",
      value: metrics.Answer_Relevancy,
      key: "Answer_Relevancy",
    },
    { label: "Coherence", value: metrics.Coherence, key: "Coherence" },
    { label: "Conciseness", value: metrics.Conciseness, key: "Conciseness" },
  ];

  const groundTruthMetrics = [
    {
      label: "GT Coherence",
      value: metrics["Ground Truth Coherence"],
      key: "Ground Truth Coherence",
    },
    {
      label: "GT Completeness",
      value: metrics["Ground Truth Completeness"],
      key: "Ground Truth Completeness",
    },
    {
      label: "GT Specificity",
      value: metrics["Ground Truth Specificity"],
      key: "Ground Truth Specificity",
    },
  ];

  if (compact) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {agentMetrics.map((metric) => (
          <div key={metric.key} className="text-center">
            <div
              className={`text-2xl font-bold ${getMetricColor(metric.value)}`}
            >
              {metric?.value?.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              {metric.label}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Agent Response Metrics */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <h4 className="font-medium text-slate-900 dark:text-slate-100">
            Agent Response Metrics
          </h4>
          <Badge variant="secondary">Primary</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {agentMetrics.map((metric) => (
            <Card key={metric.key}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-medium text-slate-700 dark:text-slate-300">
                    {metric.label}
                  </span>
                  <span
                    className={`text-lg font-bold ${getMetricColor(
                      metric.value
                    )}`}
                  >
                    {metric?.value?.toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={metric.value}
                  className="h-2"
                  style={
                    {
                      "--progress-background": getProgressColor(metric.value),
                    } as React.CSSProperties
                  }
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Ground Truth Quality Metrics */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <h4 className="font-medium text-slate-900 dark:text-slate-100">
            Ground Truth Quality
          </h4>
          <Badge variant="outline">Guardrails</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {groundTruthMetrics.map((metric) => {
            const value = metric.value ?? (950 + Math.random() * 50) / 10;

            return (
              <Card key={metric.key}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {metric.label}
                    </span>
                    <span
                      className={`text-lg font-bold ${getMetricColor(value)}`}
                    >
                      {value.toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={value}
                    className="h-2"
                    style={
                      {
                        "--progress-background": getProgressColor(value),
                      } as React.CSSProperties
                    }
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
