"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, BookOpen, Settings, BarChart3, Cloud } from "lucide-react";
import { glossaryTerms } from "@/data/mock-data";

interface GlossaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlossaryDialog({ open, onOpenChange }: GlossaryDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Categorize terms
  const categories = {
    evaluation: {
      icon: BarChart3,
      label: "Evaluation Concepts",
      terms: [
        "Pointwise evaluation",
        "Pairwise evaluation",
        "LLM Judge",
        "Chain-of-thought (CoT)",
        "Evaluation ID",
      ],
    },
    metrics: {
      icon: Settings,
      label: "Metrics & Scoring",
      terms: [
        "Answer Correctness",
        "Answer Relevancy",
        "Coherence",
        "Conciseness",
        "Ground Truth Completeness",
        "Ground Truth Specificity",
        "Ground Truth Coherence",
      ],
    },
    data: {
      icon: BookOpen,
      label: "Data & Datasets",
      terms: ["Ground truth dataset"],
    },
    azure: {
      icon: Cloud,
      label: "Azure & Infrastructure",
      terms: [
        "Azure AI Foundry",
        "Prompt flow",
        "Azure Blob Storage",
        "Function App",
        "PRISM",
      ],
    },
  };

  const filteredTerms = Object.entries(glossaryTerms).filter(
    ([term, definition]) =>
      term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTermsByCategory = (categoryTerms: string[]) => {
    return categoryTerms
      .filter(
        (term) =>
          term.toLowerCase().includes(searchTerm.toLowerCase()) ||
          glossaryTerms[term as keyof typeof glossaryTerms]
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      )
      .map((term) => [term, glossaryTerms[term as keyof typeof glossaryTerms]]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
            Evaluation Glossary
          </DialogTitle>
          <DialogDescription>
            Comprehensive definitions for GenAI agent evaluation terms and
            concepts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search terms and definitions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All Terms</TabsTrigger>
              <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
              <TabsTrigger value="azure">Azure</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <ScrollArea className="h-[50vh] pr-4">
                <div className="space-y-6">
                  {filteredTerms.length > 0 ? (
                    filteredTerms.map(([term, definition]) => (
                      <div key={term} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="font-medium">
                            {term}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          {definition}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No terms found matching &quot;{searchTerm}&quot;</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {Object.entries(categories).map(([key, category]) => (
              <TabsContent key={key} value={key}>
                <ScrollArea className="h-[50vh] pr-4">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <category.icon className="h-4 w-4 text-blue-600" />
                      <h3 className="font-medium text-slate-900 dark:text-slate-100">
                        {category.label}
                      </h3>
                    </div>
                    {getTermsByCategory(category.terms).map(
                      ([term, definition]) => (
                        <div key={term} className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="font-medium">
                              {term}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            {definition}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
