export interface Server {
  id: number;
  hostname: string;
  ip_address: string;
  os_version?: string;
  ssh_port: number;
  ssh_user?: string;
  status?: boolean;
  created_at: string;
  updated_at: string;
  ssh_password: string;
  workload_id?: number;
  workload_name?: string;
}

export interface ServerCreate {
  hostname: string;
  ip_address: string;
  os_version: string;
  ssh_port: number;
  ssh_user: string;
  ssh_password: string;
  workload_id?: number;
}

export interface ServerUpdate {
  hostname?: string;
  ip_address?: string;
  os_version?: string;
  ssh_port?: number;
  ssh_user?: string;
  ssh_password?: string;
  workload_id?: number;
}

export interface ServerUploadItem {
  hostname: string;
  ip_address: string;
  os_version: string;
  ssh_port: number;
  ssh_user: string;
  ssh_password: string;
  workload_name: string;
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
  servers: ServerResponse[];
  total_servers: number;
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
