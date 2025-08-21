"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs() {
  const pathname = usePathname();

  const pathSegments = pathname.split("/").filter(Boolean);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    ...pathSegments.map((segment, index) => {
      const href = "/" + pathSegments.slice(0, index + 1).join("/");
      const label = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      return { label, href };
    }),
  ];

  // Custom labels for specific paths
  const customLabels: Record<string, string> = {
    "/evaluation": "Evaluation",
    "/evaluation/setup": "Setup",
    "/evaluation/progress": "Progress",
    "/evaluation/results": "Results",
  };

  return (
    <nav className="flex items-center space-x-1 text-sm text-slate-600 dark:text-slate-400">
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        const displayLabel = customLabels[item.href] || item.label;

        return (
          <div key={item.href} className="flex items-center space-x-1">
            {index === 0 && <Home className="h-3 w-3" />}
            {index > 0 && <ChevronRight className="h-3 w-3" />}
            {isLast ? (
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {displayLabel}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-blue-600 transition-colors"
              >
                {displayLabel}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
