export interface Agent {
  id: string
  name: string
  displayName: string
  category: string
  description: string
}

export interface GroundTruthDataset {
  id: string
  name: string
  filename: string
  category: string
  questionCount: number
  lastModified: string
  preview?: GroundTruthRow[]
}

export interface GroundTruthRow {
  question: string
  ground_truth: string
}

export interface EvaluationMetrics {
  Answer_Correctness: number
  Answer_Relevancy: number
  Coherence: number
  Conciseness: number
  "Ground Truth Coherence": number
  "Ground Truth Completeness": number
  "Ground Truth Specificity": number
}

export interface DetailedResult {
  Answer_Correctness: string
  Answer_Relevancy: string
  Coherence: string
  Conciseness: string
  "Ground Truth Coherence": string
  "Ground Truth Completeness": string
  "Ground Truth Specificity": string
  question: string
  response: string
  ground_truth: string
}

export interface EvaluationResult {
  evaluation_id: string
  evaluation_type: string
  agent_name: string
  total_questions: number
  timestamp: string
  username?: string
  file_path: string
  aggregated_results?: EvaluationMetrics
  detailed_results?: DetailedResult[]
}

export interface EvaluationRequest {
  evaluation_type: "POINTWISE" | "PAIRWISE"
  agent_names: string[]
  ground_truth_dataset: string
}

export type EvaluationStatus = "setup" | "running" | "completed" | "error"
