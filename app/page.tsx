"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/ui/feature-card";
import { Brain, Route, BookOpen, BarChart3 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartEvaluation = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push("/evaluation/setup");
    }, 800);
  };

  return (
    <div
      className="
        relative min-h-screen overflow-hidden
        bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200
        dark:from-slate-950 dark:via-slate-900 dark:to-slate-950
      "
    >
      {/* --- Background glows & grid (decorative only) --- */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* subtle dot grid */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.10] dark:opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.25) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        {/* purple/indigo glow (top-left) */}
        <div
          aria-hidden
          className="
            absolute -top-32 -left-28 h-[42rem] w-[42rem] rounded-full
            blur-3xl
            bg-[radial-gradient(45rem_45rem_at_30%_20%,#8b5cf6_0%,#3b82f6_30%,transparent_60%)]
            opacity-20 mix-blend-multiply
            dark:opacity-40 dark:mix-blend-normal
          "
        />
        {/* orange/red glow (top-right) */}
        <div
          aria-hidden
          className="
            absolute -top-24 right-[-6rem] h-[36rem] w-[36rem] rounded-full
            blur-3xl
            bg-[radial-gradient(40rem_40rem_at_80%_10%,#ef4444_0%,#f59e0b_28%,transparent_60%)]
            opacity-15 mix-blend-multiply
            dark:opacity-35 dark:mix-blend-normal
          "
        />
        {/* cyan/teal glow (bottom-center) */}
        <div
          aria-hidden
          className="
            absolute bottom-[-12rem] left-1/2 -translate-x-1/2 h-[48rem] w-[64rem] rounded-full
            blur-3xl
            bg-[radial-gradient(50rem_50rem_at_50%_80%,#22d3ee_0%,#3b82f6_35%,transparent_65%)]
            opacity-20 mix-blend-multiply
            dark:opacity-40 dark:mix-blend-normal
          "
        />
      </div>

      <div className="container mx-auto px-12 py-12 relative">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full animate-ping" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
              {/* prism wordmark-style */}
              <span className="inline-flex items-baseline gap-1.5 text-zinc-900 dark:text-zinc-100">
                <span className="lowercase">pr</span>

                {/* custom i (rectangle + dot) */}
                <span
                  className="relative inline-block align-baseline h-[0.9em] w-[0.35em]"
                  aria-label="i"
                >
                  {/* stem */}
                  <span
                    aria-hidden
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[0.58em] w-[0.14em] rounded-sm
                   bg-[linear-gradient(180deg,#f97316_0%,#fbbf24_100%)]"
                  />
                  {/* dot */}
                  <span
                    aria-hidden
                    className="absolute left-1/2 -translate-x-1/2 h-[0.22em] w-[0.22em] rounded-full 
                   bg-[linear-gradient(180deg,#ef4444_0%,#fb923c_100%)]
                   shadow-[0_0_0_1px_rgba(0,0,0,0.08)]"
                  />
                  <span className="sr-only">i</span>
                </span>

                <span className="lowercase">sm</span>
              </span>

              {/* prism-gradient headline */}
              <span
                className="ml-2 bg-[linear-gradient(90deg,#ef4444_0%,#f59e0b_20%,#a855f7_48%,#3b82f6_72%,#06b6d4_100%)]
               bg-clip-text text-transparent"
              >
                GenAI Evaluation Console
              </span>
            </h1>
          </div>
          <p className="text-xl text-slate-700 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Benchmark AI agents scientifically: an impartial LLM Judge scores
            responses against a Ground Truth answer key.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <FeatureCard
            color="blue"
            title="Evaluation Setup"
            description="This is where you configure your test run. The UI will guide you through a simple, step-by-step process to prepare your evaluation."
            icon={<Route className="h-5 w-5" />}
            bullets={[
              "Select Agent(s): Select one or two agents from the dropdown list.",
              "Evaluation Type: Choose Pointwise to grade one, Pairwise to compare two.",
              "Ground Truth: Upload CSV; LLM Judge scores; include 50–100 questions.",
            ]}
            badge="Guided"
          />

          <FeatureCard
            color="amber"
            title="Evaluation Results "
            description="After you start an evaluation, the console automates the entire testing process and presents the results in a comprehensive dashboard. "
            icon={<BarChart3 className="h-5 w-5" />}
            bullets={[
              "System sends questions, Judge scores every response against ground truth.",
              "See aggregated dashboard and drill-down detailed per-question results.",
              "Metrics include relevancy, factual correctness, coherence, and conciseness.",
            ]}
            badge="Clarity"
          />

          <FeatureCard
            color="violet"
            title="Other Information"
            description="The entire console is designed to be a 'no-code' tool that empowers product owners and business users, not just engineers: "
            icon={<BookOpen className="h-5 w-5" />}
            bullets={[
              "Guided Workflow: Step-by-step UI guides setup, simplifying even complex evaluations.",
              "Plain-English Explanations: Clear labels and descriptions translate scores into business insights.",
              "Interactive Glossary: Built-in glossary gives instant, simple definitions for technical terms.",
            ]}
            badge="Built-in help"
          />
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            onClick={handleStartEvaluation}
            disabled={isLoading}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-12 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                Initializing...
              </>
            ) : (
              <>
                <Brain className="h-5 w-5 mr-3" />
                Start New Evaluation
              </>
            )}
          </Button>
          <div className="mt-6 space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Ready for demo presentation • Simulated backend integration
            </p>
            <div className="flex items-center justify-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
              <span>✓ No Azure setup required</span>
              <span>✓ Realistic data simulation</span>
              <span>✓ Full workflow demonstration</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
