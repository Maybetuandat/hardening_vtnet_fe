export interface Server {
  id: number;
  hostname: string;
  ip_address: string;
  os_version?: string;
  ssh_port: number;
  ssh_user?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface ServerCreate {
  hostname: string;
  ip_address: string;
  os_version: string;
  ssh_port: number;
  ssh_user: string;
  ssh_password: string;
}

export interface ServerUpdate {
  hostname?: string;
  ip_address?: string;
  os_version?: string;
  ssh_port?: number;
  ssh_user?: string;
  ssh_password?: string;
}

// Response từ API list servers
export interface ServerListResponse {
  servers: Server[];
  total_servers: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export enum ServerStatus {
  ONLINE = "online",
  OFFLINE = "offline",
  MAINTENANCE = "maintenance",
  ERROR = "error",
  UNKNOWN = "unknown",
}

export enum ServerEnvironment {
  PRODUCTION = "production",
  STAGING = "staging",
  DEVELOPMENT = "development",
  TESTING = "testing",
}

export enum ServerOSType {
  LINUX = "linux",
  WINDOWS = "windows",
  UNIX = "unix",
  MACOS = "macos",
}
