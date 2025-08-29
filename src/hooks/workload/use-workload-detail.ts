import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import { WorkloadResponse, WorkloadUpdate } from "@/types/workload";
import { toast } from "sonner";

interface UseWorkloadDetailReturn {
  workload: WorkloadResponse | null;
  loading: boolean;
  error: string | null;
  fetchWorkloadDetail: (workloadId: number) => Promise<void>;
  updateWorkload: (workloadId: number, data: WorkloadUpdate) => Promise<void>;
}

export function useWorkloadDetail(): UseWorkloadDetailReturn {
  const [workload, setWorkload] = useState<WorkloadResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkloadDetail = useCallback(async (workloadId: number) => {
    if (!workloadId || workloadId <= 0) {
      setError("Invalid workload ID");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.get<WorkloadResponse>(
        `/workloads/${workloadId}`
      );
      setWorkload(response);
    } catch (err: any) {
      console.error("Error fetching workload detail:", err);
      setError(err.message || "Failed to fetch workload detail");
      setWorkload(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateWorkload = useCallback(
    async (workloadId: number, data: WorkloadUpdate) => {
      try {
        const response = await api.put<WorkloadResponse>(
          `/workloads/${workloadId}`,
          data
        );
        setWorkload(response);
        toast.success("Cập nhật workload thành công");
      } catch (err: any) {
        console.error("Error updating workload:", err);
        const errorMessage = err.message || "Failed to update workload";
        toast.error(`Có lỗi xảy ra khi cập nhật workload: ${errorMessage}`);
        throw err;
      }
    },
    []
  );

  return {
    workload,
    loading,
    error,
    fetchWorkloadDetail,
    updateWorkload,
  };
}
