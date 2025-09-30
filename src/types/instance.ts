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

export interface InstanceConnectionInfo {
  ip: string;
  ssh_user: string;
  ssh_password: string;
  ssh_port: number;
}

export interface InstanceConnectionResult {
  ip: string;
  ssh_user: string;
  ssh_port: number;
  status: string;
  message: string;
  hostname?: string;
  os_version?: string;
  error_details?: string;
}

export interface TestConnectionRequest {
  Instances: InstanceConnectionInfo[];
}

export interface TestConnectionResponse {
  results: InstanceConnectionResult[];
  total_Instances: number;
  successful_connections: number;
  failed_connections: number;
}

export interface ValidationResult {
  hostname: string;
  exists: boolean;
  valid: boolean;
  message: string;
}

export interface IpValidationResult {
  ip_address: string;
  exists: boolean;
  valid: boolean;
  message: string;
}

// doi tuong su dung trong form upload Instance
export interface InstanceUploadData {
  id: string;
  ip_address: string;
  ssh_user: string;
  ssh_port: number;
  ssh_password: string;
  hostname?: string;
  os_version?: string;
  status: string;
  connection_status?: "untested" | "testing" | "success" | "failed";
  connection_message?: string;
}
export interface UseInstanceUploadReturn {
  dragActive: boolean;
  uploading: boolean;
  testing: boolean;
  adding: boolean;
  Instances: InstanceUploadData[];
  uploadedFileName: string;
  errors: string[];
  isDirty: boolean;
  allInstancesConnected: boolean;
  anyInstanceTesting: boolean;
  hasFailedConnections: boolean;
  canAddInstances: boolean;

  setDragActive: (active: boolean) => void;
  handleFileUpload: (file: File) => Promise<void>;
  removeInstance: (InstanceId: string) => void;
  handleDiscard: () => void;
  handleTestConnection: () => Promise<void>;
  cancelAllOperations: () => void;
  handleAddInstancesWithWorkload: (
    workloadId: number,
    onSuccess?: () => void,
    onRefreshList?: () => void
  ) => Promise<void>;
}
