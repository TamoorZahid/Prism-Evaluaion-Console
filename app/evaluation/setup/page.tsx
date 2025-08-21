"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Play, Info, CheckCircle2 } from "lucide-react";
import { mockAgents, mockRecentEvaluations } from "@/data/mock-data";
import type { Agent, EvaluationMetrics } from "@/types/evaluation";
import { MetricsSummary } from "@/components/metrics-summary";
import { useToast } from "@/hooks/use-toast";
import { HelpTooltip } from "@/components/help-tooltip";
import { useSetupStore } from "@/lib/stores";

const PHAROS_REGIONS = [
  "Universal Studios Hollywood",
  "Universal Orlando Resort",
  "Universal Studios Japan",
  "Universal Studios Singapore",
  "Universal Beijing Resort",
];

export default function EvaluationSetupPage() {
  const router = useRouter();
  const { toast } = useToast();

  const {
    evaluationType,
    region,
    setSelectedAgentIds,
    setEvaluationType,
    setRegion,
    clearRegionIfNotPharos,
  } = useSetupStore();

  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const [lastMetrics, setLastMetrics] = useState<EvaluationMetrics | null>(
    null
  );
  const [validationStatus, setValidationStatus] = useState<
    "idle" | "validating" | "valid" | "invalid"
  >("idle");

  // Load last metrics when agent is selected
  useEffect(() => {
    if (selectedAgent) {
      const lastEval = mockRecentEvaluations.find(
        (lastEvaluation) => lastEvaluation.agent_name === selectedAgent.name
      );
      setLastMetrics(lastEval?.aggregated_results || null);
    } else {
      setLastMetrics(null);
    }
  }, [selectedAgent]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const validateForm = (): string[] => {
    const newErrors: string[] = [];

    if (!selectedAgent) newErrors.push("Please select an agent");

    if (selectedAgent?.id === "pharos_udx" && !region) {
      newErrors.push("Select a Region for Pharos UDX.");
    }

    return newErrors;
  };

  // Added real-time form validation
  useEffect(() => {
    const errors = validateForm();
    if (errors.length === 0 && selectedAgent && evaluationType) {
      setValidationStatus("valid");
    } else if (selectedAgent) {
      setValidationStatus("invalid");
    } else {
      setValidationStatus("idle");
    }
  }, [selectedAgent, region, evaluationType, validateForm]);

  const handleGoToGroundTruth = async () => {
    // Enhanced loading simulation with progress updates
    toast({
      title: "Initializing evaluation...",
      description: "Setting up LLM Judge framework",
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: "Connecting to Azure services...",
      description: "Establishing Function App connection",
    });

    await new Promise((resolve) => setTimeout(resolve, 800));

    // Generate mock evaluation ID
    const evaluationId = `evaluation_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    toast({
      title: "Evaluation Setted up successfully",
      description: `Evaluation ${evaluationId.substring(
        0,
        20
      )}... has been started`,
    });

    const queryParams = new URLSearchParams({
      agent: selectedAgent?.id ?? "", // e.g. "pharos_udx"
      type: evaluationType || "", // "POINTWISE" | "PAIRWISE"
      backRef: "/evaluation/setup",
      ...(selectedAgent?.id === "pharos_udx" && region ? { region } : {}),
    });

    router.push(`/ground_truth?${queryParams.toString()}`);
  };

  // const handleGoToGroundTruth = () => {
  //   // NOTE: pass the agent *id* so downstream pages can map clean names
  //   const params = new URLSearchParams({
  //     agent: selectedAgent?.id ?? "", // e.g. "pharos_udx"
  //     type: evaluationType || "", // "POINTWISE" | "PAIRWISE"
  //     backRef: "/evaluation/setup",
  //     ...(selectedAgent?.id === "pharos_udx" && region ? { region } : {}),
  //   });

  //   router.push(`/ground_truth?${params.toString()}`);
  // };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Evaluation Setup
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Configure your GenAI agent evaluation parameters and ground truth
          dataset
        </p>
      </div>

      <div className="space-y-6">
        {/* Agent Selection */}
        <Card
          className={
            selectedAgent ? "border-green-200 dark:border-green-800" : ""
          }
        >
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>1. Select Agent</span>
              <HelpTooltip content="Choose the GenAI agent you want to evaluate. Each agent is configured with specific endpoints and belongs to a domain category." />
              {selectedAgent && (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              )}
            </CardTitle>
            <CardDescription>
              Choose the GenAI agent you want to evaluate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              onValueChange={(value) => {
                const agent = mockAgents.find((a) => a.id === value) || null;
                setSelectedAgent(agent);

                const newAgentIds = agent ? [agent.id] : [];
                setSelectedAgentIds(newAgentIds);
                clearRegionIfNotPharos(newAgentIds);

                if (agent?.id === "pharos_udx") {
                  console.log("[v0] Telemetry: setup.region_shown", {
                    agent: "Pharos UDX",
                  });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose an agent..." />
              </SelectTrigger>
              <SelectContent>
                {mockAgents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    <div className="flex items-center space-x-2">
                      <span>{agent.displayName}</span>
                      <Badge variant="outline" className="text-xs">
                        {agent.category}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedAgent && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {selectedAgent.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedAgent?.id === "pharos_udx" && (
          <Card
            className={region ? "border-green-200 dark:border-green-800" : ""}
          >
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Region</span>
                <HelpTooltip content="Required for Pharos UDX. Responses vary by park." />
                {region && <CheckCircle2 className="h-4 w-4 text-green-600" />}
              </CardTitle>
              <CardDescription>
                Select the Universal Studios region for evaluation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={region || ""}
                onValueChange={(value) => {
                  setRegion(value);
                  console.log("[v0] Telemetry: setup.region_selected", {
                    region: value,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a region..." />
                </SelectTrigger>
                <SelectContent>
                  {PHAROS_REGIONS.map((regionName) => (
                    <SelectItem key={regionName} value={regionName}>
                      {regionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* Evaluation Type */}
        <Card
          className={
            evaluationType ? "border-green-200 dark:border-green-800" : ""
          }
        >
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>2. Evaluation Type</span>
              <HelpTooltip content="Pointwise evaluates a single agent's responses, while Pairwise compares two agents head-to-head across the same questions." />
              {evaluationType && (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              )}
            </CardTitle>
            <CardDescription>
              Choose how you want to evaluate the agent&apos;s responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={evaluationType}
              onValueChange={(value) =>
                setEvaluationType(value as "POINTWISE" | "PAIRWISE")
              }
              className="space-y-4"
            >
              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <RadioGroupItem
                  value="POINTWISE"
                  id="pointwise"
                  className="mt-1"
                />
                <div className="space-y-1 flex-1">
                  <Label htmlFor="pointwise" className="font-medium">
                    Pointwise Evaluation
                  </Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Assess one agent&apos;s output against metrics per question.
                    Evaluates correctness, relevancy, coherence, and conciseness
                    in isolation.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <RadioGroupItem
                  value="PAIRWISE"
                  id="pairwise"
                  className="mt-1"
                />
                <div className="space-y-1 flex-1">
                  <Label htmlFor="pairwise" className="font-medium">
                    Pairwise Evaluation
                  </Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Compare two agents head-to-head across criteria. Determines
                    which agent provides more accurate and complete responses.
                  </p>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Pre-run Summary */}
        {selectedAgent && lastMetrics && (
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="h-5 w-5 mr-2 text-blue-600" />
                Pre-run Summary
              </CardTitle>
              <CardDescription>
                Last evaluation metrics for {selectedAgent.displayName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MetricsSummary metrics={lastMetrics} compact />
            </CardContent>
          </Card>
        )}

        <Separator />

        {/* Run Evaluation */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
              Ready to Go to Ground Truth Management
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              This will trigger the evaluation workflow and generate
              comprehensive results
            </p>
          </div>
          <Button
            onClick={handleGoToGroundTruth}
            disabled={validationStatus !== "valid"}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Play className="h-4 w-4 mr-2" />
            Go to Ground Truths
          </Button>
        </div>
      </div>
    </div>
  );
}
