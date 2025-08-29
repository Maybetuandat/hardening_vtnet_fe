import { useState, useCallback, useRef } from "react";
import { api } from "@/lib/api";

export interface WorkloadNameValidationResult {
  exists: boolean;
  message: string;
}

export function useWorkloadNameValidation() {
  const [validatingWorkloadName, setValidatingWorkloadName] = useState(false);
  const [workloadNameValidation, setWorkloadNameValidation] = useState({
    isValid: true,
    message: "",
  });

  const timeoutRef = useRef<NodeJS.Timeout>();

  /**
   * Validate workload name against database
   * @param workloadName - The workload name to validate
   */
  const validateWorkloadName = useCallback(
    async (workloadName: string): Promise<void> => {
      if (!workloadName.trim()) {
        setWorkloadNameValidation({
          isValid: true,
          message: "",
        });
        return;
      }

      setValidatingWorkloadName(true);
      try {
        const response = await api.post<WorkloadNameValidationResult>(
          `/workloads/validate/workload-name/${encodeURIComponent(
            workloadName.trim()
          )}`
        );

        const isValid = !response.exists; // Tên workload hợp lệ khi chưa tồn tại

        setWorkloadNameValidation({
          isValid: isValid,
          message: response.message,
        });
      } catch (error: any) {
        console.error("Error validating workload name:", error);
        setWorkloadNameValidation({
          isValid: false,
          message: "Lỗi khi kiểm tra tên workload",
        });
      } finally {
        setValidatingWorkloadName(false);
      }
    },
    []
  );

  /**
   * Debounced validation with 5-10s delay
   * @param workloadName - The workload name to validate
   */
  const debouncedValidateWorkloadName = useCallback(
    (workloadName: string) => {
      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (!workloadName.trim()) {
        setWorkloadNameValidation({
          isValid: true,
          message: "",
        });
        return;
      }

      // Set new timeout with 7 seconds delay (between 5-10s as requested)
      timeoutRef.current = setTimeout(() => {
        validateWorkloadName(workloadName);
      }, 1000);
    },
    [validateWorkloadName]
  );

  /**
   * Reset validation state
   */
  const resetValidation = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setWorkloadNameValidation({
      isValid: true,
      message: "",
    });
    setValidatingWorkloadName(false);
  }, []);

  return {
    validatingWorkloadName,
    workloadNameValidation,
    validateWorkloadName,
    debouncedValidateWorkloadName,
    resetValidation,
  };
}
