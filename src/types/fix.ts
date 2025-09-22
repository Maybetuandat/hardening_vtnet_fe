export interface ServerFixRequest {
  server_id: number;
  rule_result_ids: number[];
}
export interface SingleRuleFixResult {
  rule_result_id: number;
  rule_name: string;
  fix_command?: string;
  status: string;
  message: string;
  execution_output?: string;
  error_details?: string;
}
export interface ServerFixResponse {
  message: string;
  server_id: number;
  server_ip: string;
  total_fixes: number;
  successful_fixes: number;
  failed_fixes: number;
  skipped_fixes: number;
  fix_details: SingleRuleFixResult[];
}
