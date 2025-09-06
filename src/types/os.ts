export interface OSVersion {
  id: number;
  version: string;
  create_at: string;
  updated_at: string;
}

export interface OSCreate {
  version: string;
}

export interface OSUpdate {
  version: string;
}

export interface OSListResponse {
  os: OSVersion[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface OSSearchParams {
  keyword?: string;
  page: number;
  size: number;
}
