export interface Workload {
  id: number;
  name: string;
  display_name?: string;
  description?: string;
  workload_type: WorkloadType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export enum WorkloadType {
  OS = "os",
  BIG_DATA = "bigdata",
  DATABASE = "database",
  APP = "app",
}

export interface WorkloadCreate {
  name: string;
  display_name?: string;
  description?: string;
  workload_type: WorkloadType;
  is_active?: boolean;
}

export interface WorkloadUpdate {
  name?: string;
  display_name?: string;
  description?: string;
  workload_type?: WorkloadType;
  is_active?: boolean;
}

export interface WorkloadFormData {
  name: string;
  display_name: string;
  description: string;
  workload_type: WorkloadType;
  is_active: boolean;
}
