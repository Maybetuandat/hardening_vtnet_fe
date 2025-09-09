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
    status?: string,
    page?: number,
    pageSize?: number
  ) => Promise<void>;

  getComplianceDetail: (
    complianceId: number
  ) => Promise<ComplianceResultDetail | null>;

  deleteCompliance: (complianceId: number) => Promise<boolean>;

  startScan: (serverIds?: number[], batchSize?: number) => Promise<boolean>;
  refreshData: () => Promise<void>;

  updateComplianceResult: (completedData: any) => void;
}

export function useCompliance(): UseComplianceReturn {
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
    status: undefined as string | undefined,
  });

  const fetchComplianceResults = useCallback(
    async (
      keyword?: string,
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

        params.append("today", "true");
        if (status && status !== "all") params.append("status", status);
        params.append("page", page.toString());
        params.append("page_size", size.toString());

        const queryString = params.toString();
        console.log("Query String:", queryString);
        const url = queryString ? `/compliance?${queryString}` : "compliance";
        console.log("Fetching URL:", url);
        const data = await api.get<ComplianceResultListResponse>(url);

        setComplianceResults(data.results || []);
        setTotalItems(data.total || 0);
        setCurrentPage(data.page || 1);
        setTotalPages(data.total_pages || 0);
        setPageSize(data.page_size || 10);

        setCurrentSearchParams({
          keyword: keyword ?? "",
          status: status,
        });
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
      currentSearchParams.status,
      currentPage,
      pageSize
    );
  }, [fetchComplianceResults, currentSearchParams, currentPage, pageSize]);

  const deleteCompliance = useCallback(
    async (complianceId: number): Promise<boolean> => {
      try {
        setError(null);

        await api.delete(`/compliance/${complianceId}`);

        // Refresh data after successful delete
        await refreshData();

        return true;
      } catch (err: any) {
        const errorMessage =
          err.message || "Có lỗi xảy ra khi xóa compliance result";
        setError(errorMessage);
        console.error("Error deleting compliance:", err);
        return false;
      }
    },
    [refreshData]
  );

  const startScan = useCallback(
    async (serverIds?: number[], batchSize: number = 100): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const requestBody = {
          server_ids: serverIds,
          batch_size: Math.min(batchSize, 50),
        };

        const data = await api.post<ComplianceScanResponse>(
          "/compliance/scan",
          requestBody
        );

        if (data.success) {
          await refreshData();
          return true;
        }

        return false;
      } catch (err: any) {
        const errorMessage = err.message || "Có lỗi xảy ra khi khởi động scan";
        setError(errorMessage);
        console.error("Error starting compliance scan:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [refreshData]
  );

  const updateComplianceResult = useCallback(
    (completedData: ComplianceResult) => {
      console.log("SSE updating compliance result ID:", completedData.id);

      setComplianceResults((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.id === completedData.id
        );

        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            status: completedData.status,
            total_rules: completedData.total_rules,
            passed_rules: completedData.passed_rules,
            failed_rules: completedData.failed_rules,
            score: completedData.score,
            scan_date: completedData.scan_date,
            updated_at: completedData.updated_at,
          };

          console.log(
            ` Updated compliance ${completedData.id}: running → completed (Score: ${completedData.score}%)`
          );
          return updated;
        } else {
          console.log(
            ` Compliance ${completedData.id} not found in current page, ignoring update`
          );
          return prev;
        }
      });
    },
    []
  );

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
    deleteCompliance,
    startScan,
    refreshData,
    updateComplianceResult, // 🔥 NEW
  };
}
