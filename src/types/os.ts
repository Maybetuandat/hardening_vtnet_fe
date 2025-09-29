export interface OSVersion {
  id: number;
  name: string;
  display: string;
}

export interface OSCreate {
  name: string;
}

export interface OSUpdate {
  name: string;
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
