export type Run = {
  id: string;
  agentId: string;
  createdAt: string; // ISO
  isExperiment: boolean;
  metrics: {
    Answer_Correctness?: number;
    Answer_Relevancy?: number;
    Coherence?: number;
    Conciseness?: number;
    // extend if you add more metrics
  };
};
