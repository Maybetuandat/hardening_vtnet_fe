// src/types/compliance.ts
export interface ComplianceResult {
  id: number;
  server_id: number;
  server_ip: string;
  status: string; // "running" | "completed" | "failed" | "pending" | "cancelled"
  total_rules: number;
  passed_rules: number;
  failed_rules: number;
  score: number;
  scan_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ComplianceResultDetail extends ComplianceResult {
  server_hostname: string;
  workload_name: string;
}

export interface ComplianceSearchParams {
  keyword?: string;
  server_id?: number;
  status?: string;
  page: number;
  page_size: number;
}

export interface ComplianceResultListResponse {
  results: ComplianceResult[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ComplianceScanRequest {
  server_ids?: number[];
  batch_size?: number;
}

export interface ComplianceScanResponse {
  success: boolean;
  message: string;
  compliance_ids?: number[];
  total_servers?: number;
  estimated_time?: number;
}
