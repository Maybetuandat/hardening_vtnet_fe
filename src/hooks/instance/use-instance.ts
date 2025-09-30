import { useState, useEffect, useCallback } from "react";
import {
  Instance,
  InstanceCreate,
  InstanceUpdate,
  InstanceListResponse,
  AssignInstancesPayload,
  AssignInstancesResponse,
} from "@/types/instance";
import { api } from "@/lib/api";

interface UseInstancesReturn {
  instances: Instance[];
  loading: boolean;
  error: string | null;
  totalInstances: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  fetchInstances: (
    page?: number,
    pageSize?: number,
    keyword?: string,
    status?: string
  ) => Promise<void>;
  getInstanceById: (id: number) => Promise<Instance>;
  createInstance: (InstanceData: InstanceCreate) => Promise<Instance>;
  updateInstance: (
    id: number,
    InstanceData: InstanceUpdate
  ) => Promise<Instance>;
  deleteInstance: (id: number) => Promise<void>;
  searchInstances: (
    keyword?: string,
    status?: string,
    page?: number,
    pageSize?: number
  ) => Promise<void>;
  assignInstancesToWorkload: (
    workloadId: number,
    instanceIds: number[]
  ) => Promise<AssignInstancesResponse>;
  syncFromDCIM: () => Promise<void>;
}

export function useInstances(): UseInstancesReturn {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalInstances, setTotalInstances] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleError = useCallback((error: any, action: string) => {
    console.error(`Error ${action}:`, error);
    const message = error.message || `Failed to ${action}`;
    setError(message);
  }, []);

  const fetchInstances = useCallback(
    async (page = 1, size = 10, keyword?: string, status?: string) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("page_size", size.toString());

        if (keyword && keyword.trim()) {
          params.append("keyword", keyword.trim());
        }

        if (status && status !== "status") {
          params.append("status", status);
        }

        const response = await api.get<InstanceListResponse>(
          `/instance/?${params.toString()}`
        );

        setInstances(response.instances);
        setTotalInstances(response.total_instances);
        setTotalPages(response.total_pages);
        setCurrentPage(response.page);
        setPageSize(response.page_size);

        console.log("Fetched Instances:", response);
      } catch (err) {
        handleError(err, "fetch Instances");
        setInstances([]);
        setTotalInstances(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    },
    [handleError]
  );

  const searchInstances = useCallback(
    async (keyword?: string, status?: string, page = 1, size = 10) => {
      await fetchInstances(page, size, keyword, status);
    },
    [fetchInstances]
  );

  const getInstanceById = useCallback(
    async (id: number): Promise<Instance> => {
      try {
        const Instance = await api.get<Instance>(`/instance/${id}`);
        if (!Instance) throw new Error("Instance not found");
        return Instance;
      } catch (err: any) {
        if (err.message.includes("404")) {
          throw new Error("Instance not found");
        }
        handleError(err, "get Instance by ID");
        throw err;
      }
    },
    [handleError]
  );

  const assignInstancesToWorkload = useCallback(
    async (
      workloadId: number,
      instanceIds: number[]
    ): Promise<AssignInstancesResponse> => {
      try {
        const response = await api.put<AssignInstancesResponse>(
          `/instance/assign-workload?workload_id=${workloadId}`,
          instanceIds
        );
        return response;
      } catch (err) {
        handleError(err, "assign instances to workload");
        throw err;
      }
    },
    [handleError]
  );

  const createInstance = useCallback(
    async (InstanceData: InstanceCreate): Promise<Instance> => {
      try {
        const newInstance = await api.post<Instance>("/instance", InstanceData);
        await fetchInstances(currentPage, pageSize);
        return newInstance;
      } catch (err) {
        handleError(err, "create Instance");
        throw err;
      }
    },
    [handleError, fetchInstances, currentPage, pageSize]
  );

  const updateInstance = useCallback(
    async (id: number, InstanceData: InstanceUpdate): Promise<Instance> => {
      try {
        const updatedInstance = await api.put<Instance>(
          `/instance/${id}`,
          InstanceData
        );
        setInstances((prev) =>
          prev.map((Instance) =>
            Instance.id === id ? updatedInstance : Instance
          )
        );
        return updatedInstance;
      } catch (err) {
        handleError(err, "update Instance");
        throw err;
      }
    },
    [handleError]
  );

  const deleteInstance = useCallback(
    async (id: number): Promise<void> => {
      try {
        await api.delete(`/instance/${id}`);
        setInstances((prev) => prev.filter((Instance) => Instance.id !== id));
        setTotalInstances((prev) => prev - 1);
      } catch (err) {
        handleError(err, "delete Instance");
        throw err;
      }
    },
    [handleError]
  );

  const syncFromDCIM = useCallback(async (): Promise<void> => {
    try {
      const response = await api.get<InstanceListResponse>("/dcim/instances");
      console.log("DCIM Sync result:", response);
      return;
    } catch (err) {
      handleError(err, "sync from DCIM");
      throw err;
    }
  }, [handleError]);

  useEffect(() => {
    fetchInstances(1, 10);
  }, [fetchInstances]);

  return {
    instances,
    loading,
    error,
    totalInstances,
    totalPages,
    currentPage,
    pageSize,
    fetchInstances,
    getInstanceById,
    createInstance,
    updateInstance,
    deleteInstance,
    searchInstances,
    assignInstancesToWorkload,
    syncFromDCIM,
  };
}
