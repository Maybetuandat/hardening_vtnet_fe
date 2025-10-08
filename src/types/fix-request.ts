// src/types/fix-request.ts

export interface FixRequestCreate {
  rule_result_id: number;
  instance_id: number; // CHANGED: from string to number to match backend
  title: string;
  description: string;
}

export interface FixRequestApprove {
  admin_comment?: string;
}

export interface FixRequestResponse {
  id: number;
  rule_result_id: number;
  instance_id: number; // CHANGED: from string to number to match backend
  title: string;
  description: string;
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "executing"
    | "completed"
    | "failed";
  created_by: string;
  created_at: string;
  admin_id?: number;
  approved_at?: string;
  admin_comment?: string;
  executed_at?: string;
  execution_result?: Record<string, any>;
  error_message?: string;
}

export interface FixRequestListResponse {
  requests: FixRequestResponse[];
  total: number;
}
