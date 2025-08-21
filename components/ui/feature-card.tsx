"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/** tiny class combiner so we don't depend on cn() */
function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export type FeatureCardProps = {
  /** Heading text */
  title: string;
  /** One-sentence supporting copy */
  description: string;
  /** Small icon node (e.g., <Route className="h-5 w-5" />) */
  icon: React.ReactNode;
  /** 2–4 quick bullets */
  bullets: string[];
  /** Optional pill on the right side of the header */
  badge?: string;
  /** Color theme */
  color?: "blue" | "amber" | "violet";
  /** Extra classes for the Card */
  className?: string;
};

/**
 * FeatureCard — rounded card with gradient icon chip, inset ring,
 * and clean bullets. No quarter-moon corner artifacts.
 */
export function FeatureCard({
  title,
  description,
  icon,
  bullets,
  badge,
  color = "blue",
  className,
}: FeatureCardProps) {
  const theme = {
    blue: {
      border: "border-l-blue-500",
      ring: "ring-blue-200/70 dark:ring-blue-900/35",
      chip: "from-blue-600 to-blue-400",
      bullet: "text-blue-600",
      bg: "from-blue-50/40 to-transparent dark:from-blue-900/10 dark:to-transparent",
      hover: "hover:shadow-blue-200/60 dark:hover:shadow-blue-900/30",
    },
    amber: {
      border: "border-l-amber-500",
      ring: "ring-amber-200/70 dark:ring-amber-900/35",
      chip: "from-amber-600 to-amber-400",
      bullet: "text-amber-600",
      bg: "from-amber-50/40 to-transparent dark:from-amber-900/10 dark:to-transparent",
      hover: "hover:shadow-amber-200/60 dark:hover:shadow-amber-900/30",
    },
    violet: {
      border: "border-l-violet-500",
      ring: "ring-violet-200/70 dark:ring-violet-900/35",
      chip: "from-violet-600 to-violet-400",
      bullet: "text-violet-600",
      bg: "from-violet-50/40 to-transparent dark:from-violet-900/10 dark:to-transparent",
      hover: "hover:shadow-violet-200/60 dark:hover:shadow-violet-900/30",
    },
  }[color] || {
    border: "border-l-blue-500",
    ring: "ring-blue-200/70 dark:ring-blue-900/35",
    chip: "from-blue-600 to-blue-400",
    bullet: "text-blue-600",
    bg: "from-blue-50/40 to-transparent dark:from-blue-900/10 dark:to-transparent",
    hover: "hover:shadow-blue-200/60 dark:hover:shadow-blue-900/30",
  };

  return (
    <Card
      className={cx(
        "relative rounded-2xl overflow-hidden transition-all duration-300",
        "border-l-4", // colored left rail
        theme.border,
        "ring-1 ring-inset", // soft inset ring (fixes corner artifacts)
        theme.ring,
        "bg-gradient-to-b", // subtle mist background
        theme.bg,
        "hover:scale-[1.02] hover:shadow-xl",
        theme.hover,
        className
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span
              className={cx(
                "inline-flex h-8 w-8 items-center justify-center rounded-xl text-white",
                "bg-gradient-to-br shadow",
                theme.chip
              )}
            >
              {icon}
            </span>
            {title}
          </CardTitle>
          {badge ? <Badge variant="secondary">{badge}</Badge> : null}
        </div>
        <CardDescription className="mt-2">{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
          {bullets.map((b) => (
            <li key={b} className="flex items-start">
              {/* tiny check icon (no extra deps) */}
              <svg
                className={cx("h-4 w-4 mr-2 mt-[2px]", theme.bullet)}
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M9 16.2l-3.5-3.5 1.4-1.4L9 13.4l7.1-7.1 1.4 1.4z" />
              </svg>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
