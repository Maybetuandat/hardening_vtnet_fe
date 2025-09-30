// src/types/fix-log.ts

export interface FixLog {
  id: number;
  user_id: number;
  username: string;
  rule_result_id: number;
  compliance_result_id: number;
  rule_name: string;
  old_status: string;
  new_status: string;
  command: string;
  execution_output: string;
  error_message: string | null;
  is_success: boolean;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

// Khớp với FixActionLogListResponse từ backend
export interface FixLogListResponse {
  items: FixLog[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface FixLogSearchParams {
  compliance_id?: number;
  rule_result_id?: number;
  user_id?: number;
  keyword?: string;
  page: number;
  page_size: number;
}
