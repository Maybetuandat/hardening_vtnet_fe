import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Instance } from "@/types/instance";
import toastHelper from "@/utils/toast-helper";

interface InstanceListResponse {
  instances: Instance[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface AssignInstancesResponse {
  success: boolean;
  message: string;
  data: {
    assigned_count: number;
  };
}

interface UseWorkloadInstancesReturn {
  instances: Instance[];
  loading: boolean;
  error: string | null;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  fetchInstancesByWorkload: (
    workloadId: number,
    keyword?: string,
    page?: number,
    size?: number
  ) => Promise<void>;
  fetchInstanceNotInWorkLoad: (
    osId?: number,
    keyword?: string,
    page?: number,
    size?: number
  ) => Promise<void>;
  assignInstancesToWorkload: (
    workloadId: number,
    instanceIds: number[]
  ) => Promise<AssignInstancesResponse>;
}

export function useWorkloadInstances(): UseWorkloadInstancesReturn {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const handleError = useCallback((error: any, action: string) => {
    console.error(`Error ${action}:`, error);
    const message = error.message || `Failed to ${action}`;
    setError(message);
    toastHelper.error(message);
  }, []);

  const fetchInstancesByWorkload = useCallback(
    async (
      workloadId: number,
      keyword?: string,
      page: number = 1,
      size: number = 10
    ) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          workload_id: workloadId.toString(),
          page: page.toString(),
          page_size: size.toString(),
        });

        if (keyword?.trim()) {
          params.append("keyword", keyword.trim());
        }

        const response = await api.get<InstanceListResponse>(
          `/instance/?${params.toString()}`
        );

        console.log("Fetched instances:", response);
        setInstances(response.instances || []);
        setTotalItems(response.total || 0);
        setTotalPages(response.total_pages || 0);
        setCurrentPage(response.page || 1);
        setPageSize(response.page_size || size);
        setError(null);
      } catch (err) {
        handleError(err, "fetch instances");
        setInstances([]);
        setTotalItems(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    },
    [handleError]
  );

  // Fetch instances NOT assigned to any workload, filtered by OS ID
  const fetchInstanceNotInWorkLoad = useCallback(
    async (
      osId?: number,
      keyword?: string,
      page: number = 1,
      size: number = 100
    ) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          instance_not_in_workload: "true",
          page: page.toString(),
          page_size: size.toString(),
        });

        if (osId) {
          params.append("os_id", osId.toString());
        }

        if (keyword?.trim()) {
          params.append("keyword", keyword.trim());
        }

        const response = await api.get<InstanceListResponse>(
          `/instance/?${params.toString()}`
        );

        console.log("Fetched instances not in workload:", response);
        setInstances(response.instances || []);
        setTotalItems(response.total || 0);
        setTotalPages(response.total_pages || 0);
        setCurrentPage(response.page || 1);
        setPageSize(response.page_size || size);
        setError(null);
      } catch (err) {
        handleError(err, "fetch instances not in workload");
        setInstances([]);
        setTotalItems(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    },
    [handleError]
  );

  // Assign instances to workload using PUT /api/instance/assign-workload
  const assignInstancesToWorkload = useCallback(
    async (
      workloadId: number,
      instanceIds: number[]
    ): Promise<AssignInstancesResponse> => {
      try {
        const params = new URLSearchParams({
          workload_id: workloadId.toString(),
        });

        const response = await api.put<AssignInstancesResponse>(
          `/instance/assign-workload?${params.toString()}`,
          instanceIds // Send array directly as body
        );

        return response;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to assign instances";
        throw new Error(errorMessage);
      }
    },
    []
  );

  return {
    instances,
    loading,
    error,
    totalItems,
    currentPage,
    totalPages,
    pageSize,
    fetchInstancesByWorkload,
    fetchInstanceNotInWorkLoad,
    assignInstancesToWorkload,
  };
}
