import { Rule, RuleCreate, RuleResponse } from "./rule";

export interface WorkloadResponse {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Workload {
  id?: number;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export interface AddWorkloadFormData {
  name: string;
  description: string;
  rules: Rule[];
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
  rules: Rule[];

  errors?: string[];
  warnings?: string[];
}

export interface WorkloadWithRules {
  name: string;
  description?: string;
  rules: Rule[];
}

// Schema sử dụng đối tượng types thay vì inline arrays
export interface CreateWorkloadRequest {
  workload: WorkloadCreate;
  rules: RuleCreate[];
}

export interface WorkloadCreate {
  name: string;
  description?: string;
}

export interface WorkloadUpdate {
  name?: string;
  description?: string;
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

export interface WorkLoadListResponse {
  workloads: Workload[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
