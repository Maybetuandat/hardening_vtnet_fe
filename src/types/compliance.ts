export interface ComplianceResult {
  id: number;
  server_id: number;
  status: string; // "pending" | "running" | "completed" | "failed"
  total_rules: number;
  passed_rules: number;
  failed_rules: number;
  score: number;
  scan_date: string;
  created_at: string;
  updated_at: string;
  detail_error?: string;
  server_ip?: string;
}

export interface ComplianceResultDetail extends ComplianceResult {
  server_hostname: string;
  workload_name: string;
}

export interface ComplianceResultCreate {
  server_id: number;
  status: string;
  total_rules?: number;
  passed_rules?: number;
  failed_rules?: number;
  score?: number;
  server_ip?: string;
}

export interface ComplianceResultUpdate {
  status?: string;
  total_rules?: number;
  passed_rules?: number;
  failed_rules?: number;
  score?: number;
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
  success: any;
  message: string;
  total_servers: number;
  started_scans: number[];
}
