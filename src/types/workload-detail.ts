// File: src/types/workload-detail.ts

import { WorkloadType } from "@/types/workload";

export interface WorkloadDetail {
  id: number;
  name: string;
  display_name: string;
  description: string;
  workload_type: WorkloadType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  compliance_standard: string;
  server_count: number;
  rule_count: number;
  last_scan: string;
  scan_status: "success" | "warning" | "error";
}

export interface Rule {
  id: number;
  name: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  category: string;
  condition: string;
  action: string;
  is_enabled: boolean;
  last_execution: string;
  execution_status: "success" | "failed" | "pending";
}

export interface Server {
  id: number;
  name: string;
  ip_address: string;
  os: string;
  status: "online" | "offline" | "maintenance";
  compliance_score: number;
  last_check: string;
}
