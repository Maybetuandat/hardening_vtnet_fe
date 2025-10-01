import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import {
  WorkloadCreate,
  WorkLoadListResponse,
  WorkloadResponse,
  WorkloadUpdate,
} from "@/types/workload";

export function useWorkloads() {
  const [workloads, setWorkloads] = useState<WorkloadResponse[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch workloads with search and pagination
  const fetchWorkloads = useCallback(
    async (keyword?: string, page: number = 1, pageSize: number = 10) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (keyword?.trim()) {
          params.append("keyword", keyword.trim());
        }
        params.append("page", page.toString());
        params.append("page_size", pageSize.toString());

        const queryString = params.toString();
        const url = queryString ? `/workloads/?${queryString}` : "/workloads/";

        const response = await api.get<WorkLoadListResponse>(url);

        if (response) {
          setWorkloads(response.workloads || []);
          setTotalItems(response.total || 0);
          setCurrentPage(response.page || 1);
          setTotalPages(response.total_pages || 0);
        } else {
          setWorkloads([]);
          setTotalItems(0);
          setCurrentPage(1);
          setTotalPages(0);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch workloads");
        setWorkloads([]);
        setTotalItems(0);
        setCurrentPage(1);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getWorkloadById = useCallback(
    async (id: number): Promise<WorkloadResponse | null> => {
      try {
        const response = await api.get<WorkloadResponse>(`/workloads/${id}`);
        return response;
      } catch (err: any) {
        throw new Error(err.message || "Failed to fetch workload");
      }
    },
    []
  );

  const createWorkload = useCallback(
    async (workloadData: WorkloadCreate): Promise<void> => {
      try {
        const response = await api.post<WorkloadResponse>(
          "/workloads",
          workloadData
        );
        // Refresh the list after creation
        await fetchWorkloads();
      } catch (err: any) {
        throw new Error(err.message || "Failed to create workload");
      }
    },
    [fetchWorkloads]
  );

  const updateWorkload = useCallback(
    async (
      id: number,
      workloadData: WorkloadUpdate
    ): Promise<WorkloadResponse> => {
      try {
        const response = await api.put<WorkloadResponse>(
          `/workloads/${id}`,
          workloadData
        );

        return response;
      } catch (err: any) {
        throw new Error(err.message || "Failed to update workload");
      }
    },
    []
  );

  const deleteWorkload = useCallback(
    async (id: number): Promise<void> => {
      try {
        await api.delete(`/workloads/${id}`);

        setWorkloads((prev) => prev.filter((workload) => workload.id !== id));

        if (workloads.length === 1 && currentPage > 1) {
          await fetchWorkloads(undefined, currentPage - 1);
        } else {
          await fetchWorkloads(undefined, currentPage);
        }
      } catch (err: any) {
        throw new Error(err.message || "Failed to delete workload");
      }
    },
    [workloads.length, currentPage, fetchWorkloads]
  );

  const getNumberOfServersByWorkload = useCallback(
    async (workloadId: number): Promise<number> => {
      try {
        const response = await api.get<{ count: number }>(
          `/servers/workload/${workloadId}/count`
        );
        return response.count;
      } catch (err) {
        // Return 0 if failed to get count
        return 0;
      }
    },
    []
  );

  const searchWorkloads = useCallback(
    async (keyword: string, page: number = 1, pageSize: number = 10) => {
      await fetchWorkloads(keyword, page, pageSize);
    },
    [fetchWorkloads]
  );

  useEffect(() => {
    fetchWorkloads();
  }, [fetchWorkloads]);

  return {
    workloads,

    loading,
    error,
    totalItems,
    currentPage,
    totalPages,
    fetchWorkloads,
    searchWorkloads,
    getWorkloadById,
    createWorkload,
    updateWorkload,
    deleteWorkload,
    getNumberOfServersByWorkload,
  };
}
