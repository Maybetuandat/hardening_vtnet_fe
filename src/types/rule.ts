export interface RuleResponse {
  id: number;
  name: string;
  description?: string;
  command: string;
  workload_id: number;
  parameters?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RuleCreate {
  name: string;
  description?: string;

  workload_id?: number;
  parameters?: Record<string, any>;
  is_active: boolean;
  command: string;
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
