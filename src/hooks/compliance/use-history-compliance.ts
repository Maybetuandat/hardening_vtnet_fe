import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import {
  ComplianceResult,
  ComplianceResultDetail,
  ComplianceResultListResponse,
  ComplianceScanResponse,
} from "@/types/compliance";

export interface UseComplianceReturn {
  complianceResults: ComplianceResult[];
  loading: boolean;
  error: string | null;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;

  // Actions
  fetchComplianceResults: (
    keyword?: string,
    serverId?: number,
    status?: string,
    page?: number,
    pageSize?: number
  ) => Promise<void>;

  getComplianceDetail: (
    complianceId: number
  ) => Promise<ComplianceResultDetail | null>;

  refreshData: () => Promise<void>;
}

export function useHistoryCompliance(): UseComplianceReturn {
  const [complianceResults, setComplianceResults] = useState<
    ComplianceResult[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Store current search params for refresh
  const [currentSearchParams, setCurrentSearchParams] = useState({
    keyword: "",
    serverId: undefined as number | undefined,
    status: undefined as string | undefined,
  });

  const fetchComplianceResults = useCallback(
    async (
      keyword?: string,
      serverId?: number,
      status?: string,
      page: number = 1,
      size: number = 10
    ) => {
      try {
        setLoading(true);
        setError(null);

        // Build query params
        const params = new URLSearchParams();
        if (keyword?.trim()) params.append("keyword", keyword.trim());
        if (serverId) params.append("server_id", serverId.toString());

        if (status && status !== "all") params.append("status", status);
        params.append("page", page.toString());
        params.append("page_size", size.toString());

        const queryString = params.toString();
        const url = queryString ? `/compliance?${queryString}` : "compliance";

        const data = await api.get<ComplianceResultListResponse>(url);

        setComplianceResults(data.results || []);
        setTotalItems(data.total || 0);
        setCurrentPage(data.page || 1);
        setTotalPages(data.total_pages || 0);
        setPageSize(data.page_size || 10);

        // Store current search params
        setCurrentSearchParams({ keyword: keyword ?? "", serverId, status });
      } catch (err: any) {
        const errorMessage = err.message || "Có lỗi xảy ra khi tải dữ liệu";
        setError(errorMessage);
        console.error("Error fetching compliance results:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getComplianceDetail = useCallback(
    async (complianceId: number): Promise<ComplianceResultDetail | null> => {
      try {
        setLoading(true);
        setError(null);

        const data = await api.get<ComplianceResultDetail>(
          `/compliance/${complianceId}`
        );
        return data;
      } catch (err: any) {
        const errorMessage = err.message || "Có lỗi xảy ra khi tải chi tiết";
        setError(errorMessage);
        console.error("Error fetching compliance detail:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const refreshData = useCallback(async () => {
    await fetchComplianceResults(
      currentSearchParams.keyword,
      currentSearchParams.serverId,
      currentSearchParams.status,
      currentPage,
      pageSize
    );
  }, [fetchComplianceResults, currentSearchParams, currentPage, pageSize]);

  return {
    complianceResults,
    loading,
    error,
    totalItems,
    currentPage,
    totalPages,
    pageSize,

    // Actions
    fetchComplianceResults,
    getComplianceDetail,

    refreshData,
  };
}
