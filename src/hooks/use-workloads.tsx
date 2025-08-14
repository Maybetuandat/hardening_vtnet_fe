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
      console.log("🔄 Fetching workloads...");
      const response = await api.get<Workload[]>("/workloads");
      console.log("✅ Workloads fetched:", response);
      setWorkloads(response || []);
    } catch (err: any) {
      console.error("❌ Error fetching workloads:", err);
      setError(err.message || "Failed to fetch workloads");
      setWorkloads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getWorkloadById = useCallback(
    async (id: number): Promise<Workload | null> => {
      try {
        console.log(`🔍 Fetching workload by ID: ${id}`);
        const response = await api.get<Workload>(`/workloads/${id}`);
        console.log("✅ Workload fetched by ID:", response);
        return response;
      } catch (err: any) {
        console.error("❌ Error fetching workload by ID:", err);
        throw new Error(err.message || "Failed to fetch workload");
      }
    },
    []
  );

  const createWorkload = useCallback(
    async (workloadData: WorkloadCreate): Promise<void> => {
      try {
        console.log("🆕 Creating workload:", workloadData);
        const response = await api.post<Workload>("/workloads", workloadData);
        console.log("✅ Workload created:", response);

        // Add to local state
        setWorkloads((prev) => [...prev, response]);
      } catch (err: any) {
        console.error("❌ Error creating workload:", err);
        throw new Error(err.message || "Failed to create workload");
      }
    },
    []
  );

  const updateWorkload = useCallback(
    async (id: number, workloadData: WorkloadUpdate): Promise<void> => {
      try {
        console.log(`📝 Updating workload ${id}:`, workloadData);
        const response = await api.put<Workload>(
          `/workloads/${id}`,
          workloadData
        );
        console.log("✅ Workload updated:", response);

        // Update local state
        setWorkloads((prev) =>
          prev.map((workload) => (workload.id === id ? response : workload))
        );
      } catch (err: any) {
        console.error("❌ Error updating workload:", err);
        throw new Error(err.message || "Failed to update workload");
      }
    },
    []
  );

  const deleteWorkload = useCallback(async (id: number): Promise<void> => {
    try {
      console.log(`🗑️ Deleting workload ${id}`);
      await api.delete(`/workloads/${id}`);
      console.log("✅ Workload deleted");

      // Remove from local state
      setWorkloads((prev) => prev.filter((workload) => workload.id !== id));
    } catch (err: any) {
      console.error("❌ Error deleting workload:", err);
      throw new Error(err.message || "Failed to delete workload");
    }
  }, []);

  const getWorkloadsByType = useCallback(
    async (workloadType: string): Promise<Workload[]> => {
      try {
        console.log(`🔍 Fetching workloads by type: ${workloadType}`);
        const response = await api.get<Workload[]>(
          `/workloads?workload_type=${workloadType}`
        );
        console.log("✅ Workloads fetched by type:", response);
        return response || [];
      } catch (err: any) {
        console.error("❌ Error fetching workloads by type:", err);
        throw new Error(err.message || "Failed to fetch workloads by type");
      }
    },
    []
  );

  const getActiveWorkloads = useCallback(async (): Promise<Workload[]> => {
    try {
      console.log("🔍 Fetching active workloads");
      const response = await api.get<Workload[]>("/workloads?active_only=true");
      console.log("✅ Active workloads fetched:", response);
      return response || [];
    } catch (err: any) {
      console.error("❌ Error fetching active workloads:", err);
      throw new Error(err.message || "Failed to fetch active workloads");
    }
  }, []);

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
    getWorkloadsByType,
    getActiveWorkloads,
  };
}
