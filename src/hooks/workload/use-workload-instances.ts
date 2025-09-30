import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Instance, InstanceListResponse } from "@/types/instance";

export interface AssignInstancesResponse {
  success: boolean;
  message: string;
  data: {
    assigned_count: number;
    failed_count: number;
    assigned_instances: number[];
    failed_instances: number[];
  };
}

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
      params.append("page_size", "100");

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

  const fetchInstanceNotInWorkLoad = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("instance_not_in_workload", "true");
      params.append("page", "1");
      params.append("page_size", "100");

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
      console.error("Error fetching instances not in workload:", err);
      setError(err.message || "Failed to fetch instances");
      setInstances([]);
      setTotalInstances(0);
    } finally {
      setLoading(false);
    }
  }, []);

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
      } catch (err: any) {
        console.error("Error assigning instances to workload:", err);
        throw new Error(
          err.message || "Failed to assign instances to workload"
        );
      }
    },
    []
  );

  return {
    instances,
    loading,
    error,
    totalInstances,
    fetchInstancesByWorkload,
    fetchInstanceNotInWorkLoad,
    assignInstancesToWorkload,
  };
}
