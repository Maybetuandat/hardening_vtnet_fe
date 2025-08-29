import { Command, CommandCreate, CommandResponse } from "./command";
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
  commands?: Command[];
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
  commands?: Command[];
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
  commands: CommandCreate[];
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
    commands: CommandResponse[];
    message: string;
  };
  message: string;
}

export interface WorkloadTemplateRow {
  Name: string;
  Description: string;
  Parameters_JSON: string;
  "Ubuntu 22.04": string;
  CentOS7: string;
  CentOS8: string;
  [key: string]: any;
}

export interface WorkLoadListResponse {
  workloads: Workload[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
