// src/hooks/workload/use-workload-api.ts
import { useCallback } from "react";
import { api } from "@/lib/api";
import {
  CreateWorkloadRequest,
  CreateWorkloadResponse,
} from "@/types/add-workload";

export function useWorkloadApi() {
  /**
   * Tạo workload cùng với rules và commands
   */
  const createWorkloadWithRulesAndCommands = useCallback(
    async (data: CreateWorkloadRequest): Promise<CreateWorkloadResponse> => {
      try {
        console.log("🚀 Creating workload with data:", data);

        const response = await api.post<CreateWorkloadResponse>(
          "/workloads/create-with-rules-commands",
          data
        );

        console.log("✅ Workload created successfully:", response);
        return response;
      } catch (error: any) {
        console.error("❌ Error creating workload:", error);
        throw new Error(error.message || "Có lỗi xảy ra khi tạo workload");
      }
    },
    []
  );

  return {
    createWorkloadWithRulesAndCommands,
  };
}
