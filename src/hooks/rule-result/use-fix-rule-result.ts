import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import toastHelper from "@/utils/toast-helper";
import { ServerFixResponse, ServerFixRequest } from "@/types/fix";

interface UseServerFixReturn {
  executing: boolean;
  error: string | null;
  executeServerFix: (
    serverId: number,
    ruleResultIds: number[]
  ) => Promise<ServerFixResponse>;
}

export function useServerFix(): UseServerFixReturn {
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeServerFix = useCallback(
    async (
      instanceId: number,
      ruleResultIds: number[]
    ): Promise<ServerFixResponse> => {
      try {
        setExecuting(true);
        setError(null);

        if (!ruleResultIds || ruleResultIds.length === 0) {
          throw new Error("Rule result IDs cannot be empty");
        }

        const requestData: ServerFixRequest = {
          instance_id: instanceId,
          rule_result_ids: ruleResultIds,
        };

        console.log("Executing server fixes:", requestData);

        const response = await api.post<ServerFixResponse>(
          "/fixes/server",
          requestData
        );

        // Show success/warning messages based on results
        if (response.successful_fixes > 0) {
          toastHelper.success(
            `Successfully executed ${response.successful_fixes} fix(es) on instance ${response.instance_ip}`
          );
        }

        if (response.failed_fixes > 0) {
          toastHelper.warning(
            `${response.failed_fixes} fix(es) failed to execute`
          );
        }

        if (response.skipped_fixes > 0) {
          toastHelper.info(`${response.skipped_fixes} fix(es) were skipped`);
        }

        // Log detailed results for debugging
        response.fix_details.forEach((detail) => {
          console.log(`Fix for ${detail.rule_name}:`, {
            status: detail.status,
            message: detail.message,
            output: detail.execution_output,
            error: detail.error_details,
          });
        });

        return response;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to execute server fixes";
        setError(errorMessage);
        toastHelper.error(`Fix execution failed: ${errorMessage}`);
        console.error("Error executing server fixes:", err);
        throw err;
      } finally {
        setExecuting(false);
      }
    },
    []
  );

  return {
    executing,
    error,
    executeServerFix,
  };
}
