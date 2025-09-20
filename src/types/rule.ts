export interface RuleResponse {
  id: number;
  name: string;
  description?: string;
  command: string;
  workload_id: number;
  parameters?: Record<string, any>;
  is_active: string;
  created_at: string;
  updated_at: string;
  can_be_copied: boolean;
  suggested_fix: string;
}

export interface RuleCreate {
  name: string;
  description?: string;

  workload_id?: number;
  parameters?: Record<string, any>;
  is_active: string;
  command: string;
  suggested_fix: string;
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
