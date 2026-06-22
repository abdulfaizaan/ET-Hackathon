export type Role = 'user' | 'assistant' | 'system';

export interface Citation {
  id: string;
  source: string;
  type: 'manual' | 'pid' | 'work_order' | 'regulation';
  snippet: string;
  relevanceUrl?: string; // Mock URL
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  citations?: Citation[];
  confidenceScore?: number;
  timestamp: Date;
}

export interface GraphNode {
  id: string;
  group: number;
  label: string;
  type: 'equipment' | 'document' | 'concept' | 'work_order';
}

export interface GraphEdge {
  source: string;
  target: string;
  label: string;
  value: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphEdge[];
}

export interface Equipment {
  tag: string;
  name: string;
  status: 'operational' | 'warning' | 'critical' | 'offline';
  lastMaintenance: string;
  type: string;
}

export interface RootCauseAnalysisResult {
  equipmentTag: string;
  issueDescription: string;
  likelyCauses: {  cause: string; probability: number; supportingEvidence: Citation[] }[];
  recommendedActions: string[];
}
