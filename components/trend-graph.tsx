"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import type { Run } from "@/types/run";
import { metricColors } from "@/data/mock-data"; // ensure this exists: { Answer_Correctness: "#...", ... }

interface TrendGraphProps {
  runs: Run[]; // all runs (we’ll filter to experiments)
  className?: string;
}

const metricOptions = [
  { value: "Answer_Correctness", label: "Answer Correctness" },
  { value: "Answer_Relevancy", label: "Answer Relevancy" },
  { value: "Coherence", label: "Coherence" },
  { value: "Conciseness", label: "Conciseness" },
] as const;

export function TrendGraph({ runs, className }: TrendGraphProps) {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    "Answer_Correctness",
  ]);

  // RULE: Only experiments, take latest N, render oldest→newest
  const experimentalSorted = useMemo(() => {
    return [...runs]
      .filter((r) => r.isExperiment)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [runs]);

  const chartData = useMemo(() => {
    const slice = experimentalSorted.slice(0).reverse();
    return slice.map((r, idx) => {
      const base: any = {
        run: idx + 1,
        runId: r.id,
        timestamp: r.createdAt,
      };
      // include all metrics so multiple <Line> can bind
      for (const m of metricOptions) {
        base[m.value] = r.metrics[m.value as keyof typeof r.metrics] ?? null;
      }
      return base;
    });
  }, [experimentalSorted]);

  const experimentalCount = experimentalSorted.length;
  const hasExperiments = experimentalCount > 0;
  const hasAnySelectedData = useMemo(
    () =>
      chartData.length > 0 &&
      selectedMetrics.some((m) =>
        chartData.some((row) => typeof row[m] === "number")
      ),
    [chartData, selectedMetrics]
  );

  const toggleMetric = (metric: string) => {
    setSelectedMetrics((prev) =>
      prev.includes(metric)
        ? prev.filter((m) => m !== metric)
        : [...prev, metric]
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const date = new Date(data.timestamp).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
          <p className="font-medium text-slate-900 dark:text-slate-100 mb-2">
            Run {label}
          </p>
          <p className="text-xs text-slate-500 mb-2">{date}</p>
          {selectedMetrics.map((m) => {
            const v = data[m];
            return typeof v === "number" ? (
              <p
                key={m}
                className="text-sm"
                style={{ color: metricColors[m as keyof typeof metricColors] }}
              >
                {metricOptions.find((x) => x.value === m)?.label}:{" "}
                {v.toFixed(1)}%
              </p>
            ) : null;
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
            Performance Trends
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pb-2">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 pl-10">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-0 block">
              Metrics
            </label>
            <div className="flex flex-wrap gap-2">
              {metricOptions.map((metric) => (
                <Button
                  key={metric.value}
                  variant={
                    selectedMetrics.includes(metric.value)
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => toggleMetric(metric.value)}
                  className="text-xs"
                  style={{
                    backgroundColor: selectedMetrics.includes(metric.value)
                      ? metricColors[metric.value as keyof typeof metricColors]
                      : undefined,
                    borderColor:
                      metricColors[metric.value as keyof typeof metricColors],
                  }}
                >
                  {metric.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart or Empty */}
        <div className="h-80 mb-0">
          {hasExperiments && hasAnySelectedData ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="run"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `Run ${value}`}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {selectedMetrics.map((metric) => (
                  <Line
                    key={metric}
                    type="monotone"
                    dataKey={metric}
                    stroke={metricColors[metric as keyof typeof metricColors]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name={metricOptions.find((m) => m.value === metric)?.label}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-center text-slate-500">
              {!hasExperiments
                ? "No experiments selected — toggle ‘Experiment’ on runs to visualize trends."
                : "No data for the selected metrics in this range."}
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {selectedMetrics.length > 0 && chartData.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1  border-t border-slate-200 dark:border-slate-700">
            {selectedMetrics.map((metric) => {
              const vals = chartData
                .map((d: any) => d[metric])
                .filter((n: any) => typeof n === "number") as number[];
              if (vals.length === 0) {
                return (
                  <div
                    key={metric}
                    className="text-center text-xs text-slate-500"
                  >
                    {metricOptions.find((m) => m.value === metric)?.label}: no
                    data
                  </div>
                );
              }
              const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
              const trend = vals[vals.length - 1] - vals[0];
              return (
                <div key={metric} className="text-center">
                  <div
                    className="text-lg font-semibold"
                    style={{
                      color: metricColors[metric as keyof typeof metricColors],
                    }}
                  >
                    {avg.toFixed(1)}%
                  </div>
                  <div className="text-xs text-slate-500">
                    {metricOptions.find((m) => m.value === metric)?.label}
                  </div>
                  <div
                    className={`text-xs ${
                      trend >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {trend >= 0 ? "+" : ""}
                    {trend.toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
