import { useState, useCallback } from "react";

import { useExcelParser } from "@/hooks/workload/use-excel-parser";
import { useWorkloadNameValidation } from "@/hooks/workload/use-workload-name-validation";
import {
  WorkloadStep,
  ExcelUploadResult,
  CreateWorkloadRequest,
  CreateWorkloadResponse,
} from "@/types/workload";
import { api } from "@/lib/api";

import { RuleCreate } from "@/types/rule";

export function useAddWorkload() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State để track duplicate warnings
  const [duplicateWarnings, setDuplicateWarnings] = useState<string[]>([]);

  const [formData, setFormData] = useState<CreateWorkloadRequest>({
    workload: {
      name: "",
      description: "",
      os_id: 0,
    },
    rules: [],
  });

  // Hooks
  const { parseExcelFile: parseExcel } = useExcelParser();
  const {
    validatingWorkloadName,
    workloadNameValidation,
    validateWorkloadName,
    debouncedValidateWorkloadName,
    resetValidation,
  } = useWorkloadNameValidation();

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

  const steps: WorkloadStep[] = [
    {
      id: 1,
      title: "Thông tin cơ bản",
      description: "Cấu hình tên và mô tả workload",
      isCompleted: false,
      isActive: currentStep === 0,
    },
    {
      id: 2,
      title: "Upload Rules",
      description: "Tải lên file Excel chứa cấu hình rules",
      isCompleted: false,
      isActive: currentStep === 1,
    },
  ];

  /**
   * Parse Excel file với duplicate detection
   * Sử dụng parser đã được cải tiến để tự động loại bỏ duplicates
   */
  const parseExcelFile = useCallback(
    async (file: File): Promise<ExcelUploadResult> => {
      setLoading(true);
      setError(null);
      setDuplicateWarnings([]); // Reset warnings

      try {
        console.log("📋 Starting Excel parsing for file:", file.name);

        if (!parseExcel) {
          throw new Error("Excel parser không khả dụng");
        }

        const result = await parseExcel(file);

        if (result.success) {
          console.log("✅ Excel parsing successful:", {
            rules: result.rules.length,

            warnings: result.warnings?.length || 0,
          });

          // Update form data với rules và commands đã được deduplicated
          setFormData((prev) => ({
            ...prev,
            rules: result.rules,
          }));

          // Lưu duplicate warnings để hiển thị cho user - FIX: Add type annotation
          if (result.warnings && result.warnings.length > 0) {
            const duplicateWarnings = result.warnings.filter(
              (warning: string) =>
                warning.includes("trùng lặp") || warning.includes("Row")
            );
            setDuplicateWarnings(duplicateWarnings);
          }

          // Log thành công với chi tiết
          console.log("📊 Form data updated:", {
            totalRules: result.rules.length,

            duplicateWarnings: duplicateWarnings.length,
          });
        } else {
          console.error("❌ Excel parsing failed:", result.errors);
          setError(result.errors?.[0] || "Không thể parse file Excel");
        }

        return result;
      } catch (err: any) {
        console.error("💥 Exception during Excel parsing:", err);
        setError(err.message || "Không thể đọc file Excel");
        return {
          success: false,
          rules: [],
          errors: [err.message || "Không thể đọc file Excel"],
        };
      } finally {
        setLoading(false);
      }
    },
    [parseExcel]
  );

  // Missing functions that are used in the return
  const updateFormData = useCallback((data: Partial<CreateWorkloadRequest>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  }, [steps.length]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const resetForm = useCallback(() => {
    console.log("🔄 Resetting form data");
    setFormData({
      workload: {
        name: "",
        description: "",
        os_id: 0,
      },
      rules: [],
    });
    setCurrentStep(0);
    setError(null);
    setDuplicateWarnings([]);
    resetValidation();
  }, [resetValidation]);

  /**
   * Tạo workload với rules và commands
   * Rules đã được deduplicated từ Excel parsing
   */
  const createWorkloadWithRules = useCallback(
    async (data: CreateWorkloadRequest): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        console.log("🔧 Preparing workload creation with:", {
          workloadName: data.workload.name,
          osVersion: data.workload.os_id,
          rulesCount: data.rules.length,
        });

        // Convert rules to API format
        const rulesForApi: RuleCreate[] = data.rules.map((rule) => ({
          name: rule.name,
          description: rule.description || "",
          workload_id: 0, // Will be set by backend
          parameters: rule.parameters || {},
          is_active: rule.is_active !== false,
          command: rule.command || "",
        }));

        const requestData: CreateWorkloadRequest = {
          workload: {
            name: data.workload.name,
            description: data.workload.description || "",
            os_id: data.workload.os_id,
          },
          rules: rulesForApi,
        };

        console.log(
          "📤 Sending workload creation request:",
          JSON.stringify(requestData, null, 2)
        );

        const response = await createWorkloadWithRulesAndCommands(requestData);

        console.log("🎉 Workload creation completed successfully:", response);

        // Reset form sau khi tạo thành công
        resetForm();

        return Promise.resolve();
      } catch (err: any) {
        console.error("❌ Error creating workload:", err);
        setError(err.message || "Có lỗi xảy ra khi tạo workload");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [createWorkloadWithRulesAndCommands, resetForm]
  );

  // Validation functions
  const isStep1Valid = useCallback(() => {
    return (
      formData.workload.name.trim() !== "" &&
      formData.workload.os_id !== 0 &&
      workloadNameValidation.isValid &&
      !validatingWorkloadName
    );
  }, [
    formData.workload.name,
    formData.workload.os_id,
    workloadNameValidation.isValid,
    validatingWorkloadName,
  ]);
  const isStep2Valid = useCallback(() => {
    return formData.rules.length > 0;
  }, [formData.rules]);

  const canProceedToNextStep = useCallback(() => {
    if (currentStep === 0) return isStep1Valid();
    if (currentStep === 1) return isStep2Valid();
    return false;
  }, [currentStep, isStep1Valid, isStep2Valid]);

  return {
    // Steps và navigation
    currentStep,
    steps: steps.map((step, index) => ({
      ...step,
      isActive: index === currentStep,
      isCompleted:
        index < currentStep ||
        (index === currentStep && canProceedToNextStep()),
    })),

    // Form data
    formData,

    // Loading và error states
    loading,
    error,

    // Duplicate warnings từ Excel parsing
    duplicateWarnings,

    // Core functions
    parseExcelFile,
    createWorkloadWithRules,
    updateFormData,
    nextStep,
    prevStep,
    resetForm,

    // Validation functions
    canProceedToNextStep,
    isStep1Valid,
    isStep2Valid,

    // Workload name validation states
    validatingWorkloadName,
    workloadNameValidation,
    validateWorkloadName,
    debouncedValidateWorkloadName,
    resetValidation,
  };
}
