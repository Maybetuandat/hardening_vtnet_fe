// src/hooks/use-add-workload.ts
import { useState, useCallback } from "react";
import {
  AddWorkloadFormData,
  WorkloadStep,
  ExcelUploadResult,
  WorkloadWithRules,
  CreateWorkloadRequest,
} from "@/types/add-workload";
import { useWorkloadApi } from "@/hooks/workload/use-workload-api";
import { useExcelParser } from "@/hooks/workload/use-excel-parser";

export function useAddWorkload() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<AddWorkloadFormData>({
    name: "",
    description: "",
    rules: [],
    commands: [],
  });

  // Hooks
  const { createWorkloadWithRulesAndCommands } = useWorkloadApi();
  const { parseExcelFile: parseExcel } = useExcelParser();

  const steps: WorkloadStep[] = [
    {
      id: 1,
      title: "Basic Information",
      description: "Configure workload name and description",
      isCompleted: false,
      isActive: currentStep === 0,
    },
    {
      id: 2,
      title: "Upload Rules",
      description: "Upload Excel file with rules configuration",
      isCompleted: false,
      isActive: currentStep === 1,
    },
  ];

  /**
   * Parse Excel file và cập nhật formData
   */
  const parseExcelFile = useCallback(
    async (file: File): Promise<ExcelUploadResult> => {
      setLoading(true);
      setError(null);

      try {
        const result = await parseExcel(file);

        if (result.success) {
          // Cập nhật formData với rules và commands từ Excel
          setFormData((prev) => ({
            ...prev,
            rules: result.rules,
            commands: result.commands || [],
          }));
        }

        return result;
      } catch (err: any) {
        setError(err.message || "Failed to parse Excel file");
        return {
          success: false,
          rules: [],
          errors: [err.message || "Failed to parse Excel file"],
        };
      } finally {
        setLoading(false);
      }
    },
    [parseExcel]
  );

  /**
   * Tạo workload với rules và commands thông qua API
   */
  const createWorkloadWithRules = useCallback(
    async (data: WorkloadWithRules): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        // Chuyển đổi dữ liệu rules từ frontend format sang backend format
        const rulesForApi = data.rules.map((rule) => ({
          name: rule.name,
          description: rule.description || "",
          severity: rule.severity.toLowerCase() as
            | "low"
            | "medium"
            | "high"
            | "critical",
          parameters: {
            category: rule.category,
            rule_type: rule.rule_type,
            condition: rule.condition,
            action: rule.action,
          },
          is_active: rule.is_active,
        }));

        // Lấy commands từ formData (đã được parse từ Excel)
        const commandsForApi = formData.commands || [];

        // Tạo request payload theo format backend yêu cầu
        const requestData: CreateWorkloadRequest = {
          workload: {
            name: data.name,
            description: data.description || "",
          },
          rules: rulesForApi,
          commands: commandsForApi,
        };

        console.log("🚀 Creating workload with request data:", requestData);

        // Gọi API
        const response = await createWorkloadWithRulesAndCommands(requestData);

        console.log("✅ Workload created successfully:", response);

        // Reset form sau khi tạo thành công
        resetForm();

        return Promise.resolve();
      } catch (err: any) {
        setError(err.message || "Failed to create workload");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [formData.commands, createWorkloadWithRulesAndCommands]
  );

  const updateFormData = useCallback(
    (updates: Partial<AddWorkloadFormData>) => {
      setFormData((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, steps.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      description: "",
      rules: [],
      commands: [],
    });
    setCurrentStep(0);
    setError(null);
  }, []);

  // Validation for step 1
  const isStep1Valid = useCallback(() => {
    return !!formData.name.trim();
  }, [formData.name]);

  // Validation for step 2
  const isStep2Valid = useCallback(() => {
    return formData.rules.length > 0;
  }, [formData.rules]);

  const canProceedToNextStep = useCallback(() => {
    if (currentStep === 0) return isStep1Valid();
    if (currentStep === 1) return isStep2Valid();
    return false;
  }, [currentStep, isStep1Valid, isStep2Valid]);

  return {
    currentStep,
    steps: steps.map((step, index) => ({
      ...step,
      isActive: index === currentStep,
      isCompleted:
        index < currentStep ||
        (index === currentStep && canProceedToNextStep()),
    })),
    formData,
    loading,
    error,
    parseExcelFile,
    createWorkloadWithRules,
    updateFormData,
    nextStep,
    prevStep,
    resetForm,
    canProceedToNextStep,
    isStep1Valid,
    isStep2Valid,
  };
}
