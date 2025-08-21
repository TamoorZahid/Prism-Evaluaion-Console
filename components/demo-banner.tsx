"use client";

import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info, X, Zap } from "lucide-react";

export function DemoBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20 mb-6">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Zap className="h-3 w-3 text-blue-600" />
            <span className="font-medium text-blue-900 dark:text-blue-100">
              Demo Mode Active
            </span>
          </div>
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200"
          >
            Simulated Data
          </Badge>
          <span className="text-sm text-blue-700 dark:text-blue-300">
            All evaluations use mock data for demonstration purposes
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/40"
        >
          <X className="h-3 w-3" />
        </Button>
      </AlertDescription>
    </Alert>
  );
}
