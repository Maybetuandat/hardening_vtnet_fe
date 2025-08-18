// src/types/rule.ts
export interface Rule {
  id?: number;
  name: string;
  description?: string;
  category: string;
  severity: RuleSeverity;
  rule_type: RuleType;
  condition: string;
  action: string;
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

export enum RuleType {
  SECURITY = "security",
  PERFORMANCE = "performance",
  COMPLIANCE = "compliance",
  MONITORING = "monitoring",
}

export interface RuleCreate {
  name: string;
  description?: string;
  category: string;
  severity: RuleSeverity;
  rule_type: RuleType;
  condition: string;
  action: string;
  is_active?: boolean;
  workload_id?: number;
}

export interface RuleUpdate {
  name?: string;
  description?: string;
  category?: string;
  severity?: RuleSeverity;
  rule_type?: RuleType;
  condition?: string;
  action?: string;
  is_active?: boolean;
}

export interface RuleFormData {
  name: string;
  description: string;
  category: string;
  severity: RuleSeverity;
  rule_type: RuleType;
  condition: string;
  action: string;
  is_active: boolean;
}
