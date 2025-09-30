export interface Instance {
  id: number;
  name: string;

  os_version?: string;
  ssh_port: number;
  ssh_user?: string;
  status?: boolean;
  created_at: string;
  updated_at: string;
  ssh_password: string;
  workload_id?: number;
  workload_name?: string;
  nameofmanager: string;
}

export interface InstanceCreate {
  name: string;

  os_version: string;
  ssh_port: number;
  ssh_user: string;
  ssh_password: string;
  workload_id?: number;
}

export interface InstanceUpdate {
  name?: string;

  os_version?: string;
  ssh_port?: number;
  ssh_user?: string;
  ssh_password?: string;
  workload_id?: number;
}

export interface InstanceResponse extends Instance {
  workload?: {
    id: number;
    name: string;
    description?: string;
  };
}

// Response từ API list Instances
export interface InstanceListResponse {
  instances: InstanceResponse[];
  total_instances: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AssignInstancesPayload {
  workload_id: number;
  instance_ids: number[];
}

export interface AssignInstancesResponse {
  success: boolean;
  message: string;
  data: {
    assigned_count: number;
    failed_count: number;
    assigned_instances: number[];
    failed_instances: number[];
  };
}
