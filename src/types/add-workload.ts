// src/types/add-workload.ts
import { Rule } from "./rule";

export interface AddWorkloadFormData {
  // Step 1: Basic Information - chỉ có name và description
  name: string;
  description: string;

  // Step 2: Rules (from Excel upload)
  rules: Rule[];

  // Commands (from Excel upload)
  commands?: WorkloadCommand[];
}

export interface WorkloadCommand {
  rule_index: number;
  os_version: string;
  command_text: string;
  is_active: boolean;
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
  commands?: WorkloadCommand[];
  errors?: string[];
  warnings?: string[];
}

export interface WorkloadWithRules {
  name: string;
  description?: string;
  rules: Rule[];
}

// API Request/Response types để match với backend
export interface CreateWorkloadRequest {
  workload: {
    name: string;
    description?: string;
  };
  rules: Array<{
    name: string;
    description?: string;
    severity: "low" | "medium" | "high" | "critical";
    parameters?: Record<string, any>;
    is_active: boolean;
  }>;
  commands: Array<{
    rule_index: number;
    os_version: string;
    command_text: string;
    is_active: boolean;
  }>;
}

export interface CreateWorkloadResponse {
  success: boolean;
  data: {
    workload: {
      id: number;
      name: string;
      description?: string;
      created_at: string;
      updated_at: string;
    };
    rules: Array<{
      id: number;
      name: string;
      description?: string;
      severity: string;
      workload_id: number;
      parameters?: Record<string, any>;
      is_active: boolean;
      created_at: string;
      updated_at: string;
    }>;
    commands: Array<{
      id: number;
      rule_id: number;
      os_version: string;
      command_text: string;
      is_active: boolean;
      created_at: string;
      updated_at: string;
    }>;
    message: string;
  };
  message: string;
}
