export interface Server {
  id: number;
  name: string;
  hostname: string;
  ip_address: string;
  workload_id: number;
  server_role?: string;
  os_type: string;
  os_name?: string;
  os_version?: string;
  cpu_cores?: number;
  memory_gb?: number;
  environment: string;
  status: string;
  compliance_score?: number;
  ssh_port: number;
  ssh_key_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServerCreate {
  name: string;
  hostname: string;
  ip_address: string;
  workload_id: number;
  server_role?: string;
  os_type: string;
  os_name?: string;
  os_version?: string;
  cpu_cores?: number;
  memory_gb?: number;
  environment: string;
  status: string;
  compliance_score?: number;
  ssh_port?: number;
  ssh_key_id?: number;
  is_active?: boolean;
}

export interface ServerUpdate {
  name?: string;
  hostname?: string;
  ip_address?: string;
  workload_id?: number;
  server_role?: string;
  os_type?: string;
  os_name?: string;
  os_version?: string;
  cpu_cores?: number;
  memory_gb?: number;
  environment?: string;
  status?: string;
  compliance_score?: number;
  ssh_port?: number;
  ssh_key_id?: number;
  is_active?: boolean;
}

export enum ServerEnvironment {
  PRODUCTION = "production",
  STAGING = "staging",
  DEVELOPMENT = "development",
  TESTING = "testing",
}

export enum ServerStatus {
  ONLINE = "online",
  OFFLINE = "offline",
  MAINTENANCE = "maintenance",
  ERROR = "error",
  UNKNOWN = "unknown",
}

export enum ServerOSType {
  LINUX = "linux",
  WINDOWS = "windows",
  UNIX = "unix",
  MACOS = "macos",
}
