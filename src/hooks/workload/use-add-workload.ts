import { useState, useCallback } from "react";

import { useExcelParser } from "@/hooks/workload/use-excel-parser";
import {
  AddWorkloadFormData,
  WorkloadStep,
  ExcelUploadResult,
  WorkloadWithRules,
  CreateWorkloadRequest,
  CreateWorkloadResponse,
} from "@/types/workload";
import { api } from "@/lib/api";
import { CommandCreate } from "@/types/command";
import { RuleCreate } from "@/types/rule";

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

  const createWorkloadWithRulesAndCommands = useCallback(
    async (data: CreateWorkloadRequest): Promise<CreateWorkloadResponse> => {
      try {
        console.log("Creating workload with data:", data);

        const response = await api.post<CreateWorkloadResponse>(
          "/workloads/create-with-rules-commands",
          data
        );

        console.log("Workload created successfully:", response);
        return response;
      } catch (error: any) {
        console.error("Error creating workload:", error);
        throw new Error(error.message || "Có lỗi xảy ra khi tạo workload");
      }
    },
    []
  );
  const { parseExcelFile: parseExcel } = useExcelParser();

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

  /**
   * Tạo workload với rules và commands thông qua API
   * Sử dụng RuleCreate[] và CommandCreate[] objects
   */
  const createWorkloadWithRules = useCallback(
    async (data: WorkloadWithRules): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const rulesForApi: RuleCreate[] = data.rules.map((rule) => ({
          name: rule.name,
          description: rule.description || "",
          workload_id: 0,
          parameters: rule.parameters || {},
          is_active: rule.is_active !== false,
        }));

        const commandsForApi: CommandCreate[] = (formData.commands || []).map(
          (cmd, index) => ({
            rule_id: 0,
            rule_index: cmd.rule_index ?? index,
            os_version: cmd.os_version,
            command_text: cmd.command_text,
            is_active: cmd.is_active !== false,
          })
        );

        const requestData: CreateWorkloadRequest = {
          workload: {
            name: data.name,
            description: data.description || "",
          },
          rules: rulesForApi,
          commands: commandsForApi,
        };

        console.log(
          "Đang tạo workload với dữ liệu:",
          JSON.stringify(requestData, null, 2)
        );

        const response = await createWorkloadWithRulesAndCommands(requestData);

        console.log("Tạo workload thành công:", response);

        resetForm();

        return Promise.resolve();
      } catch (err: any) {
        console.error("Chi tiết lỗi:", err);
        setError(err.message || "Không thể tạo workload");
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
