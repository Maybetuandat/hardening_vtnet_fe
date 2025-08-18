// src/types/add-workload.ts
import { WorkloadType } from "./workload";
import { Rule } from "./rule";

export interface AddWorkloadFormData {
  // Step 1: Basic Information
  name: string;
  display_name: string;
  description: string;
  workload_type: WorkloadType | "";
  is_active: boolean;

  // Step 2: Rules (from Excel upload)
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
  display_name?: string;
  description?: string;
  workload_type: WorkloadType;
  is_active: boolean;
  rules: Rule[];
}
