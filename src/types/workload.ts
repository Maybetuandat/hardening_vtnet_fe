import { RuleCreate, RuleResponse } from "./rule";

export interface WorkloadCreate {
  name: string;
  description?: string;
  os_id: number;
}

// doi tuong de tao cung voi file excel
export interface CreateWorkloadRequest {
  workload: WorkloadCreate;
  rules: RuleCreate[];
}
export interface CreateWorkloadResponse {
  success: boolean;
  data: {
    workload: WorkloadResponse;
    rules: RuleResponse[];

    message: string;
  };
  message: string;
}

export interface WorkloadResponse {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  os_version: string;
}

export interface WorkloadUpdate {
  name?: string;
  description?: string;
  os_id?: number;
}

export interface WorkLoadListResponse {
  workloads: WorkloadResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface WorkloadStep {
  id: number;
  title: string;
  description?: string;
  isCompleted: boolean;
  isActive: boolean;
}

export interface ExcelUploadResult {
  success: boolean;
  rules: RuleCreate[];

  errors?: string[];
  warnings?: string[];
}
