"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Play,
  Clock,
  CheckCircle,
  Zap,
  Database,
  Brain,
  BarChart3,
} from "lucide-react";
import { DemoBanner } from "@/components/demo-banner";

export default function EvaluationProgressPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const evaluationId = searchParams.get("id");
  const agentName = searchParams.get("agent");
  const evaluationType = searchParams.get("type");
  const region = searchParams.get("region");

  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"running" | "completed">("running");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const progressSteps = [
    { label: "Initializing LLM Judge framework", icon: Brain, duration: 2000 },
    { label: "Loading ground truth dataset", icon: Database, duration: 1500 },
    { label: "Generating agent responses", icon: Zap, duration: 3000 },
    { label: "Computing evaluation metrics", icon: BarChart3, duration: 2000 },
    { label: "Finalizing results", icon: CheckCircle, duration: 1000 },
  ];

  useEffect(() => {
    if (!evaluationId || !agentName || !evaluationType) {
      router.push("/evaluation/setup");
      return;
    }

    let stepIndex = 0;
    let stepProgress = 0;

    const progressInterval = setInterval(() => {
      if (stepIndex >= progressSteps.length) {
        setStatus("completed");
        setProgress(100);
        clearInterval(progressInterval);
        return;
      }

      stepProgress += Math.random() * 8 + 2;
      const stepWeight = 100 / progressSteps.length;
      const totalProgress =
        stepIndex * stepWeight + (stepProgress / 100) * stepWeight;

      if (stepProgress >= 100) {
        stepIndex++;
        stepProgress = 0;
        setCurrentStep(stepIndex);
      }

      setProgress(Math.min(totalProgress, 100));
    }, 200);

    // Timer
    const timerInterval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(timerInterval);
    };
  }, [evaluationId, agentName, evaluationType, router, progressSteps.length]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleViewResults = () => {
    router.push(
      `/evaluation/results?id=${evaluationId}&agent=${agentName}&type=${evaluationType}&region=${region}`
    );
  };

  const getAgentDisplayName = (name: string) => {
    const agentMap: Record<string, string> = {
      hr_copilot: "HR Copilot",
      legal_copilot: "Legal Copilot",
      pharos_udx: "Pharos UDX",
    };
    return agentMap[name] || name;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/evaluation/setup")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Setup
        </Button>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Evaluation in Progress
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Your evaluation is being processed by the LLM Judge framework
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              {status === "running" ? (
                <Play className="h-5 w-5 mr-2 text-blue-600 animate-pulse" />
              ) : (
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              )}
              Evaluation Details
            </div>
            <Badge
              variant={status === "running" ? "default" : "secondary"}
              className={status === "running" ? "animate-pulse" : ""}
            >
              {status === "running" ? "Running" : "Completed"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500">Evaluation ID:</span>
              <p className="font-mono text-xs text-slate-900 dark:text-slate-100 mt-1 break-all">
                {evaluationId}
              </p>
            </div>
            <div>
              <span className="text-slate-500">Agent:</span>
              <p className="font-medium text-slate-900 dark:text-slate-100 mt-1">
                {getAgentDisplayName(agentName || "")}
              </p>
            </div>
            <div>
              <span className="text-slate-500">Type:</span>
              <p className="font-medium text-slate-900 dark:text-slate-100 mt-1">
                {evaluationType}
              </p>
            </div>
            {region && (
              <div>
                <span className="text-slate-500">Region:</span>
                <p className="font-medium text-slate-900 dark:text-slate-100 mt-1">
                  {region}
                </p>
              </div>
            )}
            <div>
              <span className="text-slate-500">Time Elapsed:</span>
              <p className="font-mono text-slate-900 dark:text-slate-100 mt-1 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {formatTime(timeElapsed)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {status === "running"
              ? "Processing Evaluation..."
              : "Evaluation Complete!"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Progress
              </span>
              <span className="text-sm text-slate-500">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {status === "running" && (
            <div className="space-y-3">
              {progressSteps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;

                return (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800"
                        : isCompleted
                        ? "bg-green-50 dark:bg-green-950/20"
                        : "bg-slate-50 dark:bg-slate-800/50"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-full ${
                        isActive
                          ? "bg-blue-100 dark:bg-blue-900/40"
                          : isCompleted
                          ? "bg-green-100 dark:bg-green-900/40"
                          : "bg-slate-100 dark:bg-slate-700"
                      }`}
                    >
                      <StepIcon
                        className={`h-4 w-4 ${
                          isActive
                            ? "text-blue-600 animate-pulse"
                            : isCompleted
                            ? "text-green-600"
                            : "text-slate-400"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-sm ${
                        isActive
                          ? "text-blue-900 dark:text-blue-100 font-medium"
                          : isCompleted
                          ? "text-green-800 dark:text-green-200"
                          : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {step.label}
                      {isActive && "..."}
                      {isCompleted && " ✓"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {status === "completed" && (
            <div className="space-y-4">
              <div className="flex items-center text-green-600 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <CheckCircle className="h-5 w-5 mr-3" />
                <div>
                  <span className="font-medium">
                    Evaluation completed successfully!
                  </span>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    All metrics have been computed and results are ready for
                    analysis
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Your evaluation results include detailed metrics, record-level
                analysis, and comparison data. You can view comprehensive
                breakdowns and export the data for further analysis.
              </p>
              <Button
                onClick={handleViewResults}
                className="w-full bg-green-600 hover:bg-green-700 shadow-lg"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                View Results
              </Button>
            </div>
          )}

          {status === "running" && (
            <div className="flex space-x-2">
              <Button variant="outline" className="flex-1 bg-transparent">
                Cancel Evaluation
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push("/evaluation/setup")}
                className="flex-1"
              >
                Back to Setup
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
