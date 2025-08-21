import { create } from "zustand";
import { persist } from "zustand/middleware";

/* =======================
   Setup Store
   ======================= */
interface SetupState {
  selectedAgentIds: string[];
  evaluationType: "POINTWISE" | "PAIRWISE" | "";
  groundTruthId: string | null;
  region: string | null;
  setSelectedAgentIds: (ids: string[]) => void;
  setEvaluationType: (type: "POINTWISE" | "PAIRWISE" | "") => void;
  setGroundTruthId: (id: string | null) => void;
  setRegion: (region: string | null) => void;
  clearRegionIfNotPharos: (agentIds: string[]) => void;
}

export const useSetupStore = create<SetupState>()(
  persist(
    (set) => ({
      selectedAgentIds: [],
      evaluationType: "",
      groundTruthId: null,
      region: null,
      setSelectedAgentIds: (ids) => set({ selectedAgentIds: ids }),
      setEvaluationType: (type) => set({ evaluationType: type }),
      setGroundTruthId: (id) => set({ groundTruthId: id }),
      setRegion: (region) => set({ region }),
      clearRegionIfNotPharos: (agentIds) => {
        const hasPharos = agentIds.some((id) => id === "pharos_udx");
        if (!hasPharos) set({ region: null });
      },
    }),
    { name: "setup-store" }
  )
);

/* =======================
   Ground Truth Store
   ======================= */
export interface GroundTruth {
  id: string;
  name: string;
  description?: string;
  rowsCount: number;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  filePath?: string;
  fileHash?: string;
  sample: Array<{
    index: number;
    question: string;
    answer: string;
    meta?: Record<string, any>;
  }>;

  // NEW optional fields (backward-compatible)
  sourceType?: "generated" | "uploaded";
  schemaMap?: Record<string, string>; // userCSVColumn → standardKey mapping
  metadata?: Record<string, any>; // generation metadata for CSV sources
}

interface GroundTruthState {
  groundTruths: GroundTruth[];
  lastUpdatedAt: string | null;
  addGroundTruth: (gt: GroundTruth) => void;
  updateGroundTruth: (id: string, updates: Partial<GroundTruth>) => void;
  deleteGroundTruth: (id: string) => void;
  setLastUpdatedAt: (timestamp: string) => void;
}

export const useGroundTruthStore = create<GroundTruthState>()(
  persist(
    (set, get) => ({
      groundTruths: [
        {
          id: "hr-qa-basic",
          name: "HR Q&A Basic",
          description: "Basic HR questions and answers for employee onboarding",
          rowsCount: 150,
          createdAt: "2024-01-15T10:00:00Z",
          updatedAt: "2024-01-20T14:30:00Z",
          tags: ["HR", "Onboarding"],
          sample: [
            {
              index: 1,
              question: "What is the company vacation policy?",
              answer: "Employees receive 15 days of PTO annually.",
            },
            {
              index: 2,
              question: "How do I submit a timesheet?",
              answer: "Timesheets are submitted through the HR portal.",
            },
            {
              index: 3,
              question: "What are the working hours?",
              answer: "Standard working hours are 9 AM to 6 PM.",
            },
            {
              index: 4,
              question: "Who do I contact for benefits?",
              answer: "Contact benefits@company.com.",
            },
          ],
        },
        {
          id: "legal-contracts",
          name: "Legal Contract Analysis",
          description: "Contract review and legal analysis questions",
          rowsCount: 89,
          createdAt: "2024-01-10T09:00:00Z",
          updatedAt: "2024-01-25T16:45:00Z",
          tags: ["Legal", "Contracts"],
          sample: [
            {
              index: 1,
              question: "What are the key terms in this NDA?",
              answer:
                "Key terms include confidentiality period, scope of information, and penalties.",
            },
            {
              index: 2,
              question: "What is an indemnity clause?",
              answer:
                "A clause that allocates risk by holding one party harmless for certain losses.",
            },
          ],
        },
        {
          id: "cust-support-faq",
          name: "Customer Support FAQ",
          description: "General support Q&A used by the help center",
          rowsCount: 220,
          createdAt: "2024-02-05T11:00:00Z",
          updatedAt: "2024-03-02T08:12:00Z",
          tags: ["Support", "FAQ"],
          sample: [
            {
              index: 1,
              question: "How do I reset my password?",
              answer:
                "Use the 'Forgot Password' link on the sign-in page and follow instructions.",
            },
            {
              index: 2,
              question: "How can I contact support?",
              answer: "Email support@example.com or use in-app chat.",
            },
          ],
        },
        {
          id: "it-helpdesk-kb",
          name: "IT Helpdesk KB",
          description: "Internal IT troubleshooting knowledge base",
          rowsCount: 300,
          createdAt: "2024-02-12T14:30:00Z",
          updatedAt: "2024-02-20T10:20:00Z",
          tags: ["IT", "Internal"],
          sample: [
            {
              index: 1,
              question: "VPN not connecting — what should I check?",
              answer:
                "Verify credentials, network access, and ensure the VPN client is up to date.",
            },
            {
              index: 2,
              question: "Outlook not syncing emails?",
              answer:
                "Check server status, restart Outlook, and clear cached credentials.",
            },
          ],
        },
        {
          id: "pharos-park-info",
          name: "Pharos Park Info (USJ)",
          description:
            "Park information Q&A used to evaluate Pharos UDX for Universal Studios Japan",
          rowsCount: 120,
          createdAt: "2024-03-03T09:00:00Z",
          updatedAt: "2024-03-05T09:30:00Z",
          tags: ["Pharos", "Parks", "Japan"],
          sample: [
            {
              index: 1,
              question: "What are park opening hours on weekends?",
              answer:
                "Usually 9:00–21:00; check official schedule for changes.",
            },
            {
              index: 2,
              question: "Are Express Passes available?",
              answer:
                "Yes, Express Pass options vary by day and attraction availability.",
            },
          ],
        },
      ],
      lastUpdatedAt: null,

      addGroundTruth: (gt) =>
        set((state) => ({
          groundTruths: [...state.groundTruths, gt],
          lastUpdatedAt: new Date().toISOString(),
        })),

      updateGroundTruth: (id, updates) =>
        set((state) => ({
          groundTruths: state.groundTruths.map((gt) =>
            gt.id === id
              ? { ...gt, ...updates, updatedAt: new Date().toISOString() }
              : gt
          ),
          lastUpdatedAt: new Date().toISOString(),
        })),

      deleteGroundTruth: (id) =>
        set((state) => ({
          groundTruths: state.groundTruths.filter((gt) => gt.id !== id),
          lastUpdatedAt: new Date().toISOString(),
        })),

      setLastUpdatedAt: (timestamp) => set({ lastUpdatedAt: timestamp }),
    }),
    { name: "ground-truth-store" }
  )
);
