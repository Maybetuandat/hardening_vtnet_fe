export interface Server {
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

export interface ServerCreate {
  name: string;

  os_version: string;
  ssh_port: number;
  ssh_user: string;
  ssh_password: string;
  workload_id?: number;
}

export interface ServerUpdate {
  name?: string;

  os_version?: string;
  ssh_port?: number;
  ssh_user?: string;
  ssh_password?: string;
  workload_id?: number;
}

export interface ServerResponse extends Server {
  workload?: {
    id: number;
    name: string;
    description?: string;
  };
}

// Response từ API list servers
export interface ServerListResponse {
  instances: ServerResponse[];
  total_instances: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ServerConnectionInfo {
  ip: string;
  ssh_user: string;
  ssh_password: string;
  ssh_port: number;
}

export interface ServerConnectionResult {
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
  servers: ServerConnectionInfo[];
}

export interface TestConnectionResponse {
  results: ServerConnectionResult[];
  total_servers: number;
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

// doi tuong su dung trong form upload server
export interface ServerUploadData {
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
export interface UseServerUploadReturn {
  dragActive: boolean;
  uploading: boolean;
  testing: boolean;
  adding: boolean;
  servers: ServerUploadData[];
  uploadedFileName: string;
  errors: string[];
  isDirty: boolean;
  allServersConnected: boolean;
  anyServerTesting: boolean;
  hasFailedConnections: boolean;
  canAddServers: boolean;

  setDragActive: (active: boolean) => void;
  handleFileUpload: (file: File) => Promise<void>;
  removeServer: (serverId: string) => void;
  handleDiscard: () => void;
  handleTestConnection: () => Promise<void>;
  cancelAllOperations: () => void;
  handleAddServersWithWorkload: (
    workloadId: number,
    onSuccess?: () => void,
    onRefreshList?: () => void
  ) => Promise<void>;
}
