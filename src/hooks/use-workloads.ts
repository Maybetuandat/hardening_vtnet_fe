import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { Workload, WorkloadCreate, WorkloadUpdate } from "@/types/workload";

export function useWorkloads() {
  const [workloads, setWorkloads] = useState<Workload[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkloads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Workload[]>("/workloads");
      setWorkloads(response || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch workloads");
      setWorkloads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getWorkloadById = useCallback(
    async (id: number): Promise<Workload | null> => {
      try {
        const response = await api.get<Workload>(`/workloads/${id}`);

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
        const response = await api.post<Workload>("/workloads", workloadData);

        // Add to local state
        setWorkloads((prev) => [...prev, response]);
      } catch (err: any) {
        throw new Error(err.message || "Failed to create workload");
      }
    },
    []
  );

  const updateWorkload = useCallback(
    async (id: number, workloadData: WorkloadUpdate): Promise<void> => {
      try {
        const response = await api.put<Workload>(
          `/workloads/${id}`,
          workloadData
        );

        // Update local state
        setWorkloads((prev) =>
          prev.map((workload) => (workload.id === id ? response : workload))
        );
      } catch (err: any) {
        throw new Error(err.message || "Failed to update workload");
      }
    },
    []
  );

  const deleteWorkload = useCallback(async (id: number): Promise<void> => {
    try {
      await api.delete(`/workloads/${id}`);

      // Remove from local state
      setWorkloads((prev) => prev.filter((workload) => workload.id !== id));
    } catch (err: any) {
      throw new Error(err.message || "Failed to delete workload");
    }
  }, []);
  const getNumberOfServersByWorkload = useCallback(
    async (workloadid: number): Promise<number> => {
      try {
        const response = await api.get<{ count: number }>(
          `/servers/workload/${workloadid}/count`
        );
        return response.count;
      } catch (err) {
        throw err;
      }
    },
    []
  );

  // Fetch workloads on mount
  useEffect(() => {
    fetchWorkloads();
  }, [fetchWorkloads]);

  return {
    workloads,
    loading,
    error,
    fetchWorkloads,
    getWorkloadById,
    createWorkload,
    updateWorkload,
    deleteWorkload,
    getNumberOfServersByWorkload,
  };
}
