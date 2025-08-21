"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useGroundTruthStore, type GroundTruth } from "@/lib/stores";
import {
  Search,
  Plus,
  Edit,
  Copy,
  Download,
  Trash2,
  ArrowLeft,
  FileText,
  Calendar,
  Hash,
  Play,
  Upload,
  Wand2,
} from "lucide-react";

const PANEL_HEIGHT = "h-[32rem]";
const STANDARD_SCHEMA = [
  // Order displayed in the mapping dialog (add/remove as needed)
  { key: "question", label: "question (required)" },
  { key: "ground_truth", label: "ground_truth (required)" },
  { key: "category", label: "category (optional)" },
  { key: "id", label: "id (optional)" },
];

type SchemaMap = Record<string, string>;

export default function GroundTruthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const { groundTruths, addGroundTruth, updateGroundTruth, deleteGroundTruth } =
    useGroundTruthStore();

  const [selectedGroundTruth, setSelectedGroundTruth] =
    useState<GroundTruth | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");

  // CREATE (legacy simple dialog removed in favor of the two explicit flows)
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  // GENERATE dialog state
  const [genName, setGenName] = useState("");
  const [genRows, setGenRows] = useState<number | "">("");
  const [genTags, setGenTags] = useState<string[]>([]);
  const [genDesc, setGenDesc] = useState("");
  const [genFile, setGenFile] = useState<File | null>(null);
  const [genMetaJson, setGenMetaJson] = useState<string>(""); // only for CSV sources

  // UPLOAD & MAP dialog state
  const [uplName, setUplName] = useState("");
  const [uplTags, setUplTags] = useState<string[]>([]);
  const [uplDesc, setUplDesc] = useState("");
  const [uplFile, setUplFile] = useState<File | null>(null);
  const [uplHeaders, setUplHeaders] = useState<string[]>([]);
  const [uplSchemaMap, setUplSchemaMap] = useState<SchemaMap>({});
  const [uplRowCount, setUplRowCount] = useState<number>(0);
  const [uplSampleRows, setUplSampleRows] = useState<
    Array<{ index: number; question: string; answer: string; meta?: any }>
  >([]);

  // Back navigation + preselect from URL
  const backRef = searchParams.get("backRef") || "/evaluation/setup";
  const preselectedId = searchParams.get("groundTruthId");

  // Incoming context (conditionally show banner)
  const agent = searchParams.get("agent"); // "pharos_udx" etc.
  const regionParam = searchParams.get("region");
  const evalType = searchParams.get("type"); // "POINTWISE" | "PAIRWISE"

  const getAgentDisplayName = (name?: string | null) => {
    const map: Record<string, string> = {
      hr_copilot: "HR Copilot",
      legal_copilot: "Legal Copilot",
      pharos_udx: "Pharos UDX",
    };
    return name ? map[name] ?? name : "";
  };

  useEffect(() => {
    if (preselectedId) {
      const gt = groundTruths.find((g) => g.id === preselectedId);
      if (gt) setSelectedGroundTruth(gt);
    }
  }, [preselectedId, groundTruths]);

  // Filter ground truths
  const filteredGroundTruths = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return groundTruths.filter((gt) => {
      const matchesSearch =
        gt.name.toLowerCase().includes(q) ||
        gt.description?.toLowerCase().includes(q);
      const matchesTag =
        selectedTag === "all" || gt.tags?.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [groundTruths, searchQuery, selectedTag]);

  // Unique tags
  const allTags = useMemo(
    () => Array.from(new Set(groundTruths.flatMap((gt) => gt.tags || []))),
    [groundTruths]
  );

  // Helpers
  const fakeHash = () => `sha256:${Math.random().toString(36).slice(2, 12)}`;
  const fakePath = (file: File) => `/uploads/${file.name}`;
  const isCsvFile = (f?: File | null) =>
    !!f && /\.csv$/i.test(f.name || "") && f.type !== "text/plain";

  const parseCsvHeaders = async (file: File): Promise<string[]> => {
    const text = await file.text();
    // Grab the first non-empty line as header. (Simple split; good for clean CSV headers.)
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (!lines.length) return [];
    // Basic header split; if you expect quotes/commas-inside, consider PapaParse.
    return lines[0]
      .split(",")
      .map((h) => h.trim().replace(/^"|"$/g, ""))
      .filter(Boolean);
  };

  const countCsvRows = async (file: File): Promise<number> => {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    return Math.max(0, lines.length - 1);
  };

  const buildSampleFromCsv = async (
    file: File,
    schemaMap: SchemaMap,
    limit = 10
  ) => {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) return [];

    const header = lines[0]
      .split(",")
      .map((h) => h.trim().replace(/^"|"$/g, ""));
    const idx = (col: string) => header.findIndex((h) => h === col);

    const questionCol = schemaMap["question"];
    const answerCol = schemaMap["ground_truth"];
    const qIdx = idx(questionCol);
    const aIdx = idx(answerCol);

    const catCol = schemaMap["category"] ? idx(schemaMap["category"]) : -1;
    const idCol = schemaMap["id"] ? idx(schemaMap["id"]) : -1;

    const items: Array<{
      index: number;
      question: string;
      answer: string;
      meta?: any;
    }> = [];

    // NOTE: naive CSV split (commas in fields will break). Replace with PapaParse in prod.
    for (let i = 1; i < lines.length && items.length < limit; i++) {
      const cells = lines[i]
        .split(",")
        .map((c) => c.trim().replace(/^"|"$/g, ""));
      const question = cells[qIdx] ?? "";
      const answer = cells[aIdx] ?? "";

      const meta: Record<string, any> = {};
      if (catCol >= 0) meta.category = cells[catCol] ?? "";
      if (idCol >= 0) meta.id = cells[idCol] ?? "";

      if (question || answer) {
        items.push({
          index: items.length + 1,
          question,
          answer,
          meta: Object.keys(meta).length ? meta : undefined,
        });
      }
    }
    return items;
  };

  /* =========================
     NAV
     ========================= */
  const handleReturnToSetup = () => router.push(backRef);

  const openEditDialog = (gt: GroundTruth) => {
    // keep the existing edit modal behavior (unchanged)
    setEditingGroundTruth(gt);
    setFormData({
      name: gt.name,
      description: gt.description || "",
      tags: gt.tags || [],
      rows: gt.rowsCount || 0,
      file: null,
    });
    setShowEditDialog(true);
  };

  /* =========================
     START EVALUATION
     ========================= */
  const handleStartEvaluation = () => {
    if (!selectedGroundTruth) {
      toast({
        title: "Select a dataset",
        description: "Choose a ground truth to run the evaluation.",
        variant: "destructive",
      });
      return;
    }

    const evaluationId = `evaluation_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 9)}`;

    const params = new URLSearchParams({
      id: evaluationId,
      agent: agent ?? "",
      type: evalType ?? "",
      groundTruthId: selectedGroundTruth.id,
      ...(agent === "pharos_udx" && regionParam ? { region: regionParam } : {}),
    });

    router.push(`/evaluation/progress?${params.toString()}`);
  };

  /* =========================
     GENERATE: submit
     ========================= */
  const handleGenerate = async () => {
    const name = genName.trim();
    const rows =
      typeof genRows === "number"
        ? genRows
        : parseInt(String(genRows) || "0", 10);

    if (!name || !genFile || !rows || rows <= 0) {
      toast({
        title: "Missing info",
        description:
          "Please provide a dataset name, a source file (.csv or .txt), and a valid number of questions (≥ 1).",
        variant: "destructive",
      });
      return;
    }

    // Basic JSON validation when CSV has metadata
    let parsedMeta: Record<string, any> | undefined;
    if (isCsvFile(genFile) && genMetaJson.trim()) {
      try {
        parsedMeta = JSON.parse(genMetaJson);
      } catch {
        toast({
          title: "Invalid metadata JSON",
          description: "Please provide valid JSON in the Metadata field.",
          variant: "destructive",
        });
        return;
      }
    }

    const newGroundTruth: GroundTruth = {
      id: `gt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description: genDesc.trim() || undefined,
      rowsCount: rows,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: genTags.length ? genTags : undefined,
      filePath: genFile ? fakePath(genFile) : undefined,
      fileHash: genFile ? fakeHash() : undefined,
      sourceType: "generated",
      metadata: parsedMeta,
      sample: Array.from({ length: Math.min(10, rows) }, (_, i) => ({
        index: i + 1,
        question: `Generated question ${i + 1}`,
        answer: `Generated answer ${i + 1}`,
        meta: {},
      })),
    };

    addGroundTruth(newGroundTruth);
    setSelectedGroundTruth(newGroundTruth);

    // reset generate form
    setGenName("");
    setGenRows("");
    setGenTags([]);
    setGenDesc("");
    setGenFile(null);
    setGenMetaJson("");
    setShowGenerateDialog(false);

    toast({
      title: "Ground Truth created",
      description: `${newGroundTruth.name} with ${rows} rows has been created from source.`,
    });
  };

  /* =========================
     UPLOAD & MAP: file load
     ========================= */
  const handleUploadFileChange = async (file: File | null) => {
    setUplFile(file);
    setUplHeaders([]);
    setUplRowCount(0);
    setUplSchemaMap({});
    setUplSampleRows([]);

    if (!file) return;

    if (!/\.csv$/i.test(file.name)) {
      toast({
        title: "CSV required",
        description: "Please upload a .csv file for ground truth mapping.",
        variant: "destructive",
      });
      return;
    }

    const headers = await parseCsvHeaders(file);
    if (!headers.length) {
      toast({
        title: "No headers found",
        description:
          "We couldn’t find a header row in your CSV. Ensure the first row contains column names.",
        variant: "destructive",
      });
      return;
    }
    setUplHeaders(headers);

    const count = await countCsvRows(file);
    setUplRowCount(count);

    // Try auto-map by exact (case-sensitive) match first, then by lower-cased match
    const lower = headers.map((h) => h.toLowerCase());
    const auto: SchemaMap = {};
    STANDARD_SCHEMA.forEach(({ key }) => {
      const exactIdx = headers.indexOf(key);
      if (exactIdx >= 0) {
        auto[key] = headers[exactIdx];
        return;
      }
      const lcIdx = lower.indexOf(key.toLowerCase());
      if (lcIdx >= 0) {
        auto[key] = headers[lcIdx];
      }
    });
    setUplSchemaMap(auto);
  };

  const validateUploadMapping = () => {
    const required = ["question", "ground_truth"];
    const missing = required.filter((k) => !uplSchemaMap[k]);
    if (missing.length) {
      toast({
        title: "Missing required mappings",
        description: `Please map: ${missing.join(", ")}`,
        variant: "destructive",
      });
      return false;
    }
    if (!uplFile) {
      toast({
        title: "CSV file missing",
        description: "Please upload your ground truth CSV file.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  /* =========================
     UPLOAD & MAP: submit
     ========================= */
  const handleUploadAndMap = async () => {
    if (!validateUploadMapping()) return;

    const name =
      uplName.trim() || (uplFile ? uplFile.name.replace(/\.csv$/i, "") : "");
    if (!name) {
      toast({
        title: "Name required",
        description:
          "Please enter a dataset name (or upload file to use its name).",
        variant: "destructive",
      });
      return;
    }

    const preview = await buildSampleFromCsv(uplFile!, uplSchemaMap, 10);

    const newGroundTruth: GroundTruth = {
      id: `gt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description: uplDesc.trim() || undefined,
      rowsCount: uplRowCount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: uplTags.length ? uplTags : undefined,
      filePath: uplFile ? fakePath(uplFile) : undefined,
      fileHash: uplFile ? fakeHash() : undefined,
      sourceType: "uploaded",
      schemaMap: uplSchemaMap,
      sample: preview.length
        ? preview
        : [
            {
              index: 1,
              question: "Sample question",
              answer: "Sample answer",
            },
          ],
    };

    addGroundTruth(newGroundTruth);
    setSelectedGroundTruth(newGroundTruth);

    // reset upload form
    setUplName("");
    setUplTags([]);
    setUplDesc("");
    setUplFile(null);
    setUplHeaders([]);
    setUplRowCount(0);
    setUplSchemaMap({});
    setUplSampleRows([]);
    setShowUploadDialog(false);

    toast({
      title: "Ground Truth uploaded",
      description: `${newGroundTruth.name} has been added with ${newGroundTruth.rowsCount} rows.`,
    });
  };

  /* =========================
     Existing EDIT dialog logic (untouched)
     ========================= */
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingGroundTruth, setEditingGroundTruth] =
    useState<GroundTruth | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tags: [] as string[],
    rows: 0,
    file: null as File | null,
  });

  const handleEditGroundTruth = () => {
    if (!editingGroundTruth) return;

    const name = formData.name.trim();
    const rows = Number(formData.rows) || 0;

    if (!name || rows <= 0) {
      toast({
        title: "Invalid input",
        description: "Please provide a name and a valid number of rows (≥ 1).",
        variant: "destructive",
      });
      return;
    }

    if (
      groundTruths.some(
        (gt) => gt.id !== editingGroundTruth.id && gt.name === name
      )
    ) {
      toast({
        title: "Name already exists",
        description: "Please choose a different dataset name.",
        variant: "destructive",
      });
      return;
    }

    const updates: Partial<GroundTruth> = {
      name,
      description: formData.description.trim() || undefined,
      tags: formData.tags.length ? formData.tags : undefined,
      rowsCount: rows,
      sample: Array.from({ length: Math.min(10, rows) }, (_, i) => ({
        index: i + 1,
        question: `Placeholder question ${i + 1}`,
        answer: `Placeholder answer ${i + 1}`,
        meta: {},
      })),
      ...(formData.file
        ? {
            filePath: fakePath(formData.file),
            fileHash: fakeHash(),
          }
        : {}),
    };

    updateGroundTruth(editingGroundTruth.id, updates);

    if (selectedGroundTruth?.id === editingGroundTruth.id) {
      setSelectedGroundTruth({ ...editingGroundTruth, ...updates });
    }

    setShowEditDialog(false);
    setEditingGroundTruth(null);
    setFormData({ name: "", description: "", tags: [], rows: 0, file: null });

    toast({
      title: "Ground Truth updated",
      description: "Changes have been saved successfully.",
    });
  };

  /* =========================
     DELETE / DUPLICATE
     ========================= */
  const handleDeleteGroundTruth = (gt: GroundTruth) => {
    deleteGroundTruth(gt.id);
    if (selectedGroundTruth?.id === gt.id) setSelectedGroundTruth(null);
    toast({
      title: "Ground Truth deleted",
      description: `${gt.name} has been deleted.`,
    });
  };

  const handleDuplicate = (gt: GroundTruth) => {
    const duplicate: GroundTruth = {
      ...gt,
      id: `gt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${gt.name} Copy`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addGroundTruth(duplicate);
    setSelectedGroundTruth(duplicate);
    toast({
      title: "Ground Truth duplicated",
      description: `Created ${duplicate.name}`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Ground Truth Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage your ground truth datasets for AI agent evaluation
            </p>
          </div>
          {backRef && (
            <Button onClick={handleReturnToSetup} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Setup
            </Button>
          )}
        </div>
      </div>

      {(agent || evalType || regionParam) && (
        <Card className="mb-6 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-3 text-base md:text-lg">
              <span className="text-slate-700 dark:text-slate-300">
                Run Context
              </span>
              <div className="flex flex-wrap gap-2">
                {agent && (
                  <Badge variant="outline">
                    Agent: {getAgentDisplayName(agent)}
                  </Badge>
                )}
                {evalType && <Badge variant="outline">Type: {evalType}</Badge>}
                {agent === "pharos_udx" && regionParam && (
                  <Badge variant="secondary">Region: {regionParam}</Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Panel - Table */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Ground Truth Datasets</CardTitle>
                <div className="flex gap-2">
                  {/* Generate from source */}
                  <Dialog
                    open={showGenerateDialog}
                    onOpenChange={setShowGenerateDialog}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Generate Ground Truth
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-3xl p-6 md:p-8">
                      <DialogHeader className="mb-2">
                        <DialogTitle>Generate Ground Truth</DialogTitle>
                        <DialogDescription>
                          Upload a source document (.csv or any types), choose
                          how many questions to generate, and (for CSV)
                          optionally attach a metadata JSON.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-5">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <Label htmlFor="gen-name">Name *</Label>
                            <Input
                              id="gen-name"
                              value={genName}
                              onChange={(e) => setGenName(e.target.value)}
                              placeholder="Enter dataset name"
                            />
                          </div>

                          <div>
                            <Label htmlFor="gen-rows"># of Questions *</Label>
                            <Input
                              id="gen-rows"
                              type="number"
                              min={1}
                              value={genRows}
                              onChange={(e) => {
                                const v = e.target.value;
                                setGenRows(v === "" ? "" : parseInt(v) || "");
                              }}
                              placeholder="e.g. 50"
                            />
                          </div>

                          <div>
                            <Label htmlFor="gen-tags">
                              Tags (comma separated)
                            </Label>
                            <Input
                              id="gen-tags"
                              value={genTags.join(", ")}
                              onChange={(e) =>
                                setGenTags(
                                  e.target.value
                                    .split(",")
                                    .map((t) => t.trim())
                                    .filter(Boolean)
                                )
                              }
                              placeholder="e.g. HR, Onboarding"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <Label htmlFor="gen-file">Source Document *</Label>
                            <Input
                              id="gen-file"
                              type="file"
                              accept=".csv,.txt, .pdf, .docx, .doc"
                              onChange={(e) =>
                                setGenFile(e.target.files?.[0] || null)
                              }
                            />
                            <p className="text-xs text-slate-500 mt-1">
                              CSV enables optional metadata (JSON) input below.
                            </p>
                          </div>

                          {isCsvFile(genFile) && (
                            <div className="md:col-span-2">
                              <Label htmlFor="gen-description">
                                Description
                              </Label>
                              <Textarea
                                id="gen-description"
                                value={genDesc}
                                onChange={(e) => setGenDesc(e.target.value)}
                                placeholder="Add your description here..."
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setShowGenerateDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleGenerate}>
                            <Wand2 className="h-4 w-4 mr-2" />
                            Generate
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Upload & Map */}
                  <Dialog
                    open={showUploadDialog}
                    onOpenChange={setShowUploadDialog}
                  >
                    <DialogTrigger asChild>
                      <Button variant="secondary">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-3xl p-6 md:p-8">
                      <DialogHeader className="mb-2">
                        <DialogTitle>
                          Upload Ground Truth CSV & Map Columns
                        </DialogTitle>
                        <DialogDescription>
                          Map your CSV columns to the standard schema used by
                          evaluation.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <Label htmlFor="upl-file">CSV File *</Label>
                            <Input
                              id="upl-file"
                              type="file"
                              accept=".csv"
                              onChange={(e) =>
                                handleUploadFileChange(
                                  e.target.files?.[0] || null
                                )
                              }
                            />
                            <p className="text-xs text-slate-500 mt-1">
                              First row must contain column names (headers).
                            </p>
                          </div>

                          <div className="md:col-span-2">
                            <Label htmlFor="upl-name">Name *</Label>
                            <Input
                              id="upl-name"
                              value={uplName}
                              onChange={(e) => setUplName(e.target.value)}
                              placeholder="If empty, file name (without .csv) will be used"
                            />
                          </div>

                          <div>
                            <Label htmlFor="upl-tags">
                              Tags (comma separated)
                            </Label>
                            <Input
                              id="upl-tags"
                              value={uplTags.join(", ")}
                              onChange={(e) =>
                                setUplTags(
                                  e.target.value
                                    .split(",")
                                    .map((t) => t.trim())
                                    .filter(Boolean)
                                )
                              }
                              placeholder="e.g. Legal, Contracts"
                            />
                          </div>

                          <div>
                            <Label htmlFor="upl-desc">Description</Label>
                            <Input
                              id="upl-desc"
                              value={uplDesc}
                              onChange={(e) => setUplDesc(e.target.value)}
                              placeholder="Optional description"
                            />
                          </div>
                        </div>

                        {/* Mapping Grid */}
                        <div className="rounded-lg border p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium">Column Mapping</h3>
                            <div className="text-sm text-slate-500">
                              {uplFile
                                ? `${uplRowCount} rows detected`
                                : "No file selected"}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {STANDARD_SCHEMA.map(({ key, label }) => (
                              <div
                                key={key}
                                className="flex items-center gap-3"
                              >
                                <div className="w-full md:w-1/2">
                                  <Label className="text-xs uppercase tracking-wide text-slate-500">
                                    {label}
                                  </Label>
                                  <div className="mt-1 text-sm font-medium">
                                    {key}
                                  </div>
                                </div>
                                <div className="w-full md:w-1/2">
                                  <Label className="text-xs text-slate-500">
                                    Map to
                                  </Label>
                                  <Select
                                    value={uplSchemaMap[key] ?? undefined}
                                    onValueChange={(v) =>
                                      setUplSchemaMap((prev) => {
                                        const next = { ...prev };
                                        if (v === "__NONE__") {
                                          delete next[key];
                                        } else {
                                          next[key] = v;
                                        }
                                        return next;
                                      })
                                    }
                                    disabled={!uplHeaders.length}
                                  >
                                    <SelectTrigger>
                                      <SelectValue
                                        placeholder={
                                          uplHeaders.length
                                            ? "Select a column"
                                            : "Upload CSV to load columns"
                                        }
                                      />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {uplHeaders.map((h) => (
                                        <SelectItem key={h} value={h}>
                                          {h}
                                        </SelectItem>
                                      ))}
                                      <SelectItem key="__none__" value="__">
                                        — Not Mapped —
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-slate-500 mt-3">
                            <span className="font-medium">Required:</span>{" "}
                            question, ground_truth
                          </p>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setShowUploadDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleUploadAndMap}>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload & Save
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Search + Tags */}
              <div className="flex space-x-2 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search ground truths..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All tags" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All tags</SelectItem>
                    {allTags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            {/* Scroll to match preview height */}
            <CardContent className="p-0">
              <ScrollArea className={PANEL_HEIGHT}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Rows</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGroundTruths.map((gt) => (
                      <TableRow
                        key={gt.id}
                        className={`cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 ${
                          selectedGroundTruth?.id === gt.id
                            ? "bg-blue-50 dark:bg-blue-950/20"
                            : ""
                        }`}
                        onClick={() => setSelectedGroundTruth(gt)}
                      >
                        <TableCell className="font-medium">{gt.name}</TableCell>
                        <TableCell>{gt.rowsCount}</TableCell>
                        <TableCell>
                          {new Date(gt.updatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {gt.tags?.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditDialog(gt);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicate(gt);
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="sm:max-w-lg p-6 md:p-8">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Ground Truth
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{gt.name}"?
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteGroundTruth(gt)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Preview */}
        <div className="lg:col-span-2">
          {selectedGroundTruth ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>{selectedGroundTruth.name}</span>
                    </CardTitle>
                    <div className="flex items-center flex-wrap gap-4 mt-2 text-sm text-slate-500">
                      <div className="flex items-center space-x-1">
                        <Hash className="h-3 w-3" />
                        <span>{selectedGroundTruth.rowsCount} rows</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(
                            selectedGroundTruth.updatedAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      {selectedGroundTruth.sourceType && (
                        <Badge variant="outline">
                          {selectedGroundTruth.sourceType}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!selectedGroundTruth.filePath}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      File
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={handleStartEvaluation}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Start Evaluation
                    </Button>
                  </div>
                </div>

                {selectedGroundTruth.tags && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedGroundTruth.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {selectedGroundTruth.schemaMap && (
                  <div className="mt-3">
                    <Label className="text-xs font-medium text-slate-500">
                      Column Mapping
                    </Label>
                    <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {Object.entries(selectedGroundTruth.schemaMap).map(
                        ([std, src]) =>
                          src ? (
                            <span key={std} className="mr-3">
                              <span className="font-mono">{std}</span> →{" "}
                              <span className="font-mono">{src}</span>
                            </span>
                          ) : null
                      )}
                    </div>
                  </div>
                )}

                {selectedGroundTruth.metadata && (
                  <div className="mt-3">
                    <Label className="text-xs font-medium text-slate-500">
                      Metadata
                    </Label>
                    <pre className="mt-1 text-xs bg-slate-50 dark:bg-slate-900 p-3 rounded-md overflow-auto">
                      {JSON.stringify(selectedGroundTruth.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </CardHeader>

              <CardContent className="p-0">
                <ScrollArea className={PANEL_HEIGHT}>
                  <div className="p-4 space-y-3">
                    {selectedGroundTruth.sample.map((item) => (
                      <Card key={item.index} className="p-3">
                        <div className="space-y-2">
                          <div>
                            <Label className="text-xs font-medium text-slate-500">
                              Question {item.index}
                            </Label>
                            <p className="text-sm">{item.question}</p>
                          </div>
                          <Separator />
                          <div>
                            <Label className="text-xs font-medium text-slate-500">
                              Answer
                            </Label>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              {item.answer}
                            </p>
                          </div>
                          {item.meta && Object.keys(item.meta).length > 0 && (
                            <>
                              <Separator />
                              <div>
                                <Label className="text-xs font-medium text-slate-500">
                                  Meta
                                </Label>
                                <pre className="text-xs bg-slate-50 dark:bg-slate-900 p-2 rounded-md overflow-auto">
                                  {JSON.stringify(item.meta, null, 2)}
                                </pre>
                              </div>
                            </>
                          )}
                        </div>
                      </Card>
                    ))}
                    {selectedGroundTruth.sample.length === 0 && (
                      <div className="text-sm text-slate-500 p-4">
                        No preview rows available.
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent
                className={`flex items-center justify-center ${PANEL_HEIGHT}`}
              >
                <div className="text-center text-slate-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a ground truth to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Dialog (unchanged, but bigger padding) */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-lg p-6 md:p-8">
          <DialogHeader className="mb-2">
            <DialogTitle>Edit Ground Truth</DialogTitle>
            <DialogDescription>Update dataset details</DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter dataset name"
                />
              </div>

              <div>
                <Label htmlFor="edit-rows">Number of Rows *</Label>
                <Input
                  id="edit-rows"
                  type="number"
                  min={1}
                  value={formData.rows || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      rows: parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder="e.g. 50"
                />
              </div>

              <div>
                <Label htmlFor="edit-tags">Tags (comma separated)</Label>
                <Input
                  id="edit-tags"
                  value={formData.tags.join(", ")}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tags: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    }))
                  }
                  placeholder="e.g. HR, Onboarding"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Optional description"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="edit-file">Replace File (optional)</Label>
                <Input
                  id="edit-file"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.md,.csv"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      file: e.target.files?.[0] || null,
                    }))
                  }
                />
                <p className="text-xs text-slate-500 mt-1">
                  Leave empty to keep existing file metadata.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleEditGroundTruth}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
