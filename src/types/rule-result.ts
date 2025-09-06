export interface RuleResult {
  id: number;
  compliance_result_id: number;
  rule_id: number;
  rule_name: string | null;
  status: "passed" | "failed" | "skipped" | "error";
  message: string | null;
  details: string | null;
  execution_time: number | null;
  output: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface RuleResultListResponse {
  results: RuleResult[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
