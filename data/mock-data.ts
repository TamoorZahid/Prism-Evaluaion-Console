import type {
  Agent,
  GroundTruthDataset,
  EvaluationResult,
} from "@/types/evaluation";

export type Run = {
  id: string;
  agentId: string;
  createdAt: string; // ISO
  metrics: Record<string, number | undefined>;
  isExperiment: boolean; // persistent
};

export const mockAgents: Agent[] = [
  {
    id: "hr_copilot",
    name: "hr_copilot",
    displayName: "HR Copilot",
    category: "HR",
    description: "AI assistant for HR-related queries and policies",
  },
  {
    id: "legal_copilot",
    name: "legal_copilot",
    displayName: "Legal Copilot",
    category: "Legal",
    description: "AI assistant for legal compliance and documentation",
  },
  {
    id: "pharos_udx",
    name: "pharos_udx",
    displayName: "Pharos UDX",
    category: "Universal",
    description: "Universal data experience agent for theme park information",
  },
];

export const mockGroundTruthDatasets: GroundTruthDataset[] = [
  {
    id: "hr_data_v4",
    name: "HR Policy Dataset v4",
    filename: "hr_data_v4.csv",
    category: "HR",
    questionCount: 85,
    lastModified: "2024-12-15T10:30:00Z",
    preview: [
      {
        question: "What is the company's remote work policy?",
        ground_truth:
          "Employees can work remotely up to 3 days per week with manager approval. Full remote work requires VP approval and is evaluated case-by-case based on role requirements.",
      },
      {
        question: "How many vacation days do employees get?",
        ground_truth:
          "New employees receive 15 vacation days annually. After 3 years of service, this increases to 20 days. After 7 years, employees receive 25 vacation days per year.",
      },
    ],
  },
  {
    id: "legal_data_v1",
    name: "Legal Compliance Dataset v1",
    filename: "legal_data_v1.csv",
    category: "Legal",
    questionCount: 62,
    lastModified: "2024-11-28T14:20:00Z",
    preview: [
      {
        question: "What are the data retention requirements?",
        ground_truth:
          "Customer data must be retained for 7 years after account closure. Employee records must be kept for 5 years after termination. Financial records require 10-year retention.",
      },
    ],
  },
  {
    id: "universal_data_v2",
    name: "Universal Parks Dataset v2",
    filename: "universal_data_v2.csv",
    category: "Universal",
    questionCount: 48,
    lastModified: "2024-12-10T09:15:00Z",
    preview: [
      {
        question: "What hotels are pet-friendly?",
        ground_truth:
          "The pet-friendly hotels at Universal Orlando Resort include: Loews Portofino Bay Hotel (Garden View & Bay View rooms only), Hard Rock Hotel (Garden View rooms only), Loews Royal Pacific Resort (Standard rooms only), and Loews Sapphire Falls Resort (Standard rooms only).",
      },
    ],
  },
];

// Mock recent evaluation results for "Last 5 runs" feature
export const mockRecentEvaluations: EvaluationResult[] = [
  {
    evaluation_id: "74041cc2-60ad-4556-ab8a-eb586c805fd1",
    evaluation_type: "Pointwise",
    agent_name: "pharos_udx",
    total_questions: 48,
    timestamp: "2024-12-14T20:51:16Z",
    file_path:
      "pointwise/pharos_udx/2024-12-14/2024-12-14T20:51:16Z_74041cc2-60ad-4556-ab8a-eb586c805fd1_pointwise_aggregated_.json",
    aggregated_results: {
      Answer_Correctness: 70.83,
      Answer_Relevancy: 72.92,
      Coherence: 85.42,
      Conciseness: 47.92,
      "Ground Truth Coherence": 100.0,
      "Ground Truth Completeness": 95.83,
      "Ground Truth Specificity": 97.92,
    },
  },
  {
    evaluation_id: "9cf2abba-af69-4536-87d7-c5c30a913add",
    evaluation_type: "Pointwise",
    agent_name: "pharos_udx",
    total_questions: 48,
    timestamp: "2024-12-13T20:33:38Z",
    file_path:
      "pointwise/pharos_udx/2024-12-13/2024-12-13T20:33:38Z_9cf2abba-af69-4536-87d7-c5c30a913add_pointwise_detailed.json",
    aggregated_results: {
      Answer_Correctness: 68.75,
      Answer_Relevancy: 70.83,
      Coherence: 83.33,
      Conciseness: 45.83,
      "Ground Truth Coherence": 100.0,
      "Ground Truth Completeness": 93.75,
      "Ground Truth Specificity": 95.83,
    },
  },
  {
    evaluation_id: "abc123def-456-789-ghi-jklmnop890",
    evaluation_type: "Pointwise",
    agent_name: "hr_copilot",
    total_questions: 85,
    timestamp: "2024-12-12T15:22:10Z",
    file_path:
      "pointwise/hr_copilot/2024-12-12/2024-12-12T15:22:10Z_abc123def-456-789-ghi-jklmnop890_pointwise_aggregated_.json",
    aggregated_results: {
      Answer_Correctness: 82.35,
      Answer_Relevancy: 88.24,
      Coherence: 91.76,
      Conciseness: 76.47,
      "Ground Truth Coherence": 100.0,
      "Ground Truth Completeness": 98.82,
      "Ground Truth Specificity": 96.47,
    },
  },
];

export const metricColors = {
  Answer_Correctness: "#3b82f6", // blue
  Answer_Relevancy: "#10b981", // emerald
  Coherence: "#f59e0b", // amber
  Conciseness: "#ef4444", // red
};

export const mockTrendData = {
  hr_copilot: [
    {
      run: 1,
      timestamp: "2024-12-01T10:00:00Z",
      Answer_Correctness: 78.5,
      Answer_Relevancy: 82.1,
      Coherence: 88.3,
      Conciseness: 72.4,
    },
    {
      run: 2,
      timestamp: "2024-12-02T14:30:00Z",
      Answer_Correctness: 78.2,
      Answer_Relevancy: 77.6,
      Coherence: 89.1,
      Conciseness: 77.8,
    },
    {
      run: 3,
      timestamp: "2024-12-03T09:15:00Z",
      Answer_Correctness: 80.8,
      Answer_Relevancy: 81.9,
      Coherence: 84.5,
      Conciseness: 70.2,
    },
    {
      run: 4,
      timestamp: "2024-12-04T16:45:00Z",
      Answer_Correctness: 81.7,
      Answer_Relevancy: 86.3,
      Coherence: 90.2,
      Conciseness: 75.9,
    },
    {
      run: 5,
      timestamp: "2024-12-05T11:20:00Z",
      Answer_Correctness: 83.1,
      Answer_Relevancy: 87.8,
      Coherence: 91.4,
      Conciseness: 77.3,
    },
    {
      run: 6,
      timestamp: "2024-12-06T13:10:00Z",
      Answer_Correctness: 82.9,
      Answer_Relevancy: 87.2,
      Coherence: 90.8,
      Conciseness: 76.8,
    },
    {
      run: 7,
      timestamp: "2024-12-07T15:35:00Z",
      Answer_Correctness: 84.3,
      Answer_Relevancy: 88.9,
      Coherence: 92.1,
      Conciseness: 78.5,
    },
    {
      run: 8,
      timestamp: "2024-12-08T10:50:00Z",
      Answer_Correctness: 83.7,
      Answer_Relevancy: 88.1,
      Coherence: 91.6,
      Conciseness: 77.9,
    },
    {
      run: 9,
      timestamp: "2024-12-09T14:25:00Z",
      Answer_Correctness: 85.2,
      Answer_Relevancy: 89.7,
      Coherence: 93.3,
      Conciseness: 79.8,
    },
    {
      run: 10,
      timestamp: "2024-12-10T12:40:00Z",
      Answer_Correctness: 88.8,
      Answer_Relevancy: 89.2,
      Coherence: 90.8,
      Conciseness: 79.1,
    },
    {
      run: 11,
      timestamp: "2024-12-11T16:15:00Z",
      Answer_Correctness: 86.1,
      Answer_Relevancy: 90.4,
      Coherence: 94.1,
      Conciseness: 80.7,
    },
    {
      run: 12,
      timestamp: "2024-12-12T15:22:10Z",
      Answer_Correctness: 75.35,
      Answer_Relevancy: 93.24,
      Coherence: 94.76,
      Conciseness: 70.47,
    },
  ],
  legal_copilot: [
    {
      run: 1,
      timestamp: "2024-12-01T11:30:00Z",
      Answer_Correctness: 75.2,
      Answer_Relevancy: 79.8,
      Coherence: 85.6,
      Conciseness: 68.9,
    },
    {
      run: 2,
      timestamp: "2024-12-02T15:45:00Z",
      Answer_Correctness: 76.8,
      Answer_Relevancy: 81.3,
      Coherence: 86.9,
      Conciseness: 70.4,
    },
    {
      run: 3,
      timestamp: "2024-12-03T10:20:00Z",
      Answer_Correctness: 77.5,
      Answer_Relevancy: 82.1,
      Coherence: 87.3,
      Conciseness: 71.2,
    },
    {
      run: 4,
      timestamp: "2024-12-04T14:10:00Z",
      Answer_Correctness: 78.9,
      Answer_Relevancy: 83.7,
      Coherence: 88.5,
      Conciseness: 72.8,
    },
    {
      run: 5,
      timestamp: "2024-12-05T12:55:00Z",
      Answer_Correctness: 79.3,
      Answer_Relevancy: 84.2,
      Coherence: 89.1,
      Conciseness: 73.5,
    },
    {
      run: 6,
      timestamp: "2024-12-06T16:30:00Z",
      Answer_Correctness: 80.1,
      Answer_Relevancy: 85.0,
      Coherence: 89.8,
      Conciseness: 74.3,
    },
    {
      run: 7,
      timestamp: "2024-12-07T11:15:00Z",
      Answer_Correctness: 81.4,
      Answer_Relevancy: 86.3,
      Coherence: 90.7,
      Conciseness: 75.9,
    },
    {
      run: 8,
      timestamp: "2024-12-08T13:40:00Z",
      Answer_Correctness: 80.8,
      Answer_Relevancy: 85.7,
      Coherence: 90.2,
      Conciseness: 75.1,
    },
    {
      run: 9,
      timestamp: "2024-12-09T15:25:00Z",
      Answer_Correctness: 82.3,
      Answer_Relevancy: 87.1,
      Coherence: 91.4,
      Conciseness: 76.8,
    },
    {
      run: 10,
      timestamp: "2024-12-10T10:50:00Z",
      Answer_Correctness: 81.9,
      Answer_Relevancy: 86.8,
      Coherence: 91.0,
      Conciseness: 76.2,
    },
  ],
  pharos_udx: [
    {
      run: 1,
      timestamp: "2024-12-01T09:45:00Z",
      Answer_Correctness: 65.3,
      Answer_Relevancy: 68.7,
      Coherence: 78.9,
      Conciseness: 42.1,
    },
    {
      run: 2,
      timestamp: "2024-12-02T13:20:00Z",
      Answer_Correctness: 66.8,
      Answer_Relevancy: 70.2,
      Coherence: 80.3,
      Conciseness: 43.7,
    },
    {
      run: 3,
      timestamp: "2024-12-03T11:35:00Z",
      Answer_Correctness: 67.9,
      Answer_Relevancy: 71.5,
      Coherence: 81.7,
      Conciseness: 44.9,
    },
    {
      run: 4,
      timestamp: "2024-12-04T15:10:00Z",
      Answer_Correctness: 69.2,
      Answer_Relevancy: 72.8,
      Coherence: 82.9,
      Conciseness: 46.2,
    },
    {
      run: 5,
      timestamp: "2024-12-05T10:25:00Z",
      Answer_Correctness: 68.5,
      Answer_Relevancy: 71.9,
      Coherence: 82.1,
      Conciseness: 45.6,
    },
    {
      run: 6,
      timestamp: "2024-12-06T14:50:00Z",
      Answer_Correctness: 70.1,
      Answer_Relevancy: 73.6,
      Coherence: 83.8,
      Conciseness: 47.3,
    },
    {
      run: 7,
      timestamp: "2024-12-07T12:15:00Z",
      Answer_Correctness: 71.4,
      Answer_Relevancy: 74.9,
      Coherence: 84.7,
      Conciseness: 48.5,
    },
    {
      run: 8,
      timestamp: "2024-12-08T16:40:00Z",
      Answer_Correctness: 70.9,
      Answer_Relevancy: 74.2,
      Coherence: 84.1,
      Conciseness: 47.8,
    },
    {
      run: 9,
      timestamp: "2024-12-09T11:05:00Z",
      Answer_Correctness: 72.3,
      Answer_Relevancy: 75.7,
      Coherence: 85.6,
      Conciseness: 49.1,
    },
    {
      run: 10,
      timestamp: "2024-12-10T13:30:00Z",
      Answer_Correctness: 71.8,
      Answer_Relevancy: 75.1,
      Coherence: 85.0,
      Conciseness: 48.7,
    },
    {
      run: 11,
      timestamp: "2024-12-11T15:45:00Z",
      Answer_Correctness: 69.7,
      Answer_Relevancy: 73.4,
      Coherence: 83.9,
      Conciseness: 47.2,
    },
    {
      run: 12,
      timestamp: "2024-12-12T17:20:00Z",
      Answer_Correctness: 70.5,
      Answer_Relevancy: 74.1,
      Coherence: 84.6,
      Conciseness: 48.0,
    },
    {
      run: 13,
      timestamp: "2024-12-13T20:33:38Z",
      Answer_Correctness: 68.75,
      Answer_Relevancy: 70.83,
      Coherence: 83.33,
      Conciseness: 45.83,
    },
    {
      run: 14,
      timestamp: "2024-12-14T20:51:16Z",
      Answer_Correctness: 70.83,
      Answer_Relevancy: 72.92,
      Coherence: 85.42,
      Conciseness: 47.92,
    },
  ],
};

export const glossaryTerms = {
  "Ground truth dataset":
    "A curated collection of high-quality, human-annotated data that serves as the gold standard for evaluating a RAG application. This dataset includes a categorically exhaustive set of user queries and the desired, accurate, and contextually appropriate answers that the RAG agent should generate based on relevant documents retrieved from its vector database.",
  "Pointwise evaluation":
    "Pointwise or Single point evaluation involves assessing the quality of the final output of the RAG application's generated response in isolation, without direct comparison to other outputs or variations. Each data point is evaluated based on a predefined set of metrics or criteria such as correctness, relevancy, coherence, and conciseness.",
  "Pairwise evaluation":
    "Pairwise evaluation involves comparing two generated responses side by side — typically from different agents (e.g., Copilot vs. RAGPile) — to assess which one performs better across predefined criteria such as factual correctness, relevancy, conciseness, and coherence.",
  "Azure AI Foundry":
    "Azure AI Foundry provides a comprehensive platform and tooling for evaluating LLMs and generative AI applications (RAG), offering capabilities for data preparation, metric computation, and model comparison in the Azure environment.",
  "Prompt flow":
    "Azure AI Foundry supports building modularized prompt flows which are sequential blocks of LLM Judge prompts executed on a set of input parameters to output certain output scores. For PRISM evaluation, the standard prompt flow includes prompt templates for each evaluation metric, scoring a binary 1 or 0 to assess the agent response's alignment with the user question and ground truth.",
  "Chain-of-thought (CoT)":
    "Chain of thought reasoning is a form of prompt engineering which allows LLMs acting as judges to break down complex problems into a series of intermediate steps, mimicking human-like deliberation. This allows them to explicitly consider evidence and logic before arriving at a final judgment.",
  "LLM Judge":
    "An AI model that acts as an evaluator, using structured prompts to assess the quality of agent responses against ground truth data. The LLM Judge provides binary scores (0 or 1) for various metrics like correctness, relevancy, coherence, and conciseness.",
  "Answer Correctness":
    "A metric that evaluates whether the agent's response is factually accurate when compared to the ground truth answer. Scored as 1 (correct) or 0 (incorrect).",
  "Answer Relevancy":
    "A metric that assesses whether the agent's response directly addresses the user's question and is pertinent to the query. Scored as 1 (relevant) or 0 (irrelevant).",
  Coherence:
    "A metric that evaluates whether the agent's response is logically structured, easy to understand, and free of contradictions. Scored as 1 (coherent) or 0 (incoherent).",
  Conciseness:
    "A metric that assesses whether the agent's response is brief and to the point, without unnecessary verbosity or irrelevant information. Scored as 1 (concise) or 0 (verbose).",
  "Ground Truth Completeness":
    "A guardrail metric that evaluates whether the ground truth answer provides all necessary information to fully address the question. Ensures the reference data is comprehensive.",
  "Ground Truth Specificity":
    "A guardrail metric that assesses whether the ground truth answer is precise and detailed, avoiding vague or generic statements. Ensures high-quality reference standards.",
  "Ground Truth Coherence":
    "A guardrail metric that evaluates whether the ground truth answer is logically structured, easy to read, and free of contradictions within itself.",
  "Azure Blob Storage":
    "Cloud storage service used to store evaluation datasets, results, and configuration files. Results are organized by agent name, date, and evaluation ID for easy retrieval and analysis.",
  "Function App":
    "Azure serverless compute service that hosts the evaluation API endpoints. Receives evaluation requests and triggers the LLM Judge workflow, returning evaluation IDs for tracking.",
  "Evaluation ID":
    "A unique identifier generated for each evaluation run, used to track progress and retrieve results. Format typically includes timestamp and random components for uniqueness.",
  PRISM:
    "The internal framework at NBCU that hosts Azure-based services for GenAI evaluation, including Function Apps, AI Foundry prompt flows, and Blob Storage for datasets and results.",
};

export default mockRecentEvaluations;
