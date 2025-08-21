// src/types/rule.ts
export interface Rule {
  id?: number;
  name: string;
  description?: string;

  severity: RuleSeverity;
  parameters: Record<string, any>;

  is_active: boolean;
  workload_id?: number;
  created_at?: string;
  updated_at?: string;
}

export enum RuleSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}
export interface WorkloadRuleCreate {
  name: string;
  description?: string;
  severity: string;
  parameters?: Record<string, any>;
}
