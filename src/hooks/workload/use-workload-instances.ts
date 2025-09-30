import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Instance, InstanceListResponse } from "@/types/instance";

export function useWorkloadInstances() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalInstances, setTotalInstances] = useState(0);

  const fetchInstancesByWorkload = useCallback(async (workloadId: number) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("workload_id", workloadId.toString());
      params.append("page", "1");
      params.append("page_size", "10");

      const response = await api.get<InstanceListResponse>(
        `/instance/?${params.toString()}`
      );

      if (response) {
        setInstances(response.instances || []);
        setTotalInstances(response.total_instances || 0);
      } else {
        setInstances([]);
        setTotalInstances(0);
      }
    } catch (err: any) {
      console.error("Error fetching instances by workload:", err);
      setError(err.message || "Failed to fetch instances");
      setInstances([]);
      setTotalInstances(0);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    instances,
    loading,
    error,
    totalInstances,
    fetchInstancesByWorkload,
  };
}
