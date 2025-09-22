export interface ServerFixRequest {
  server_id: number;
  rule_result_ids: number[];
}

export interface FixDetail {
  rule_result_id: number;
  rule_name: string;
  fix_command: string | null;
  status: "success" | "failed" | "skipped";
  message: string;
  execution_output: string | null;
  error_details: string | null;
}

export interface ExecutionSummary {
  total_fixes: number;
  successful_fixes: number;
  failed_fixes: number;
  skipped_fixes: number;
  execution_time: number;
}

export interface ServerFixResponse {
  server_id: number;
  execution_summary: ExecutionSummary;
  playbook_output: string;
  fix_details: FixDetail[];
}

export interface FixableRule {
  rule_result_id: number;
  rule_name: string;
  suggested_fix: string;
  status: string;
  message: string | null;
}

export interface FixableRulesResponse {
  server_id: number;
  fixable_rule_results: FixableRule[];
  total_fixable: number;
}
