export interface Rule {
  id?: number;
  name: string;
  description?: string;

  parameters: Record<string, any>;

  is_active: boolean;
  workload_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface WorkloadRuleCreate {
  name: string;
  description?: string;
  is_active?: boolean;
  parameters?: Record<string, any>;
}
export interface RuleResponse {
  id: number;
  name: string;
  description?: string;

  workload_id: number;
  parameters?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RuleCreate {
  name: string;
  description?: string;

  workload_id: number;
  parameters?: Record<string, any>;
  is_active: boolean;
}

export interface RuleListResponse {
  rules: RuleResponse[];
  total_rules: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface RuleSearchParams {
  keyword?: string;
  workload_id?: number;
  page: number;
  page_size: number;
}
