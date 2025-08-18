// src/hooks/use-add-workload.ts
import { useState, useCallback } from "react";
import {
  AddWorkloadFormData,
  WorkloadStep,
  ExcelUploadResult,
  WorkloadWithRules,
} from "@/types/add-workload";
import { WorkloadType } from "@/types/workload";
import { Rule, RuleSeverity, RuleType } from "@/types/rule";

export function useAddWorkload() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<AddWorkloadFormData>({
    name: "",
    display_name: "",
    description: "",
    workload_type: "",
    is_active: true,
    rules: [],
  });

  const steps: WorkloadStep[] = [
    {
      id: 1,
      title: "Basic Information",
      description: "Configure workload basic settings",
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

  // Mock function to simulate Excel parsing
  const parseExcelFile = useCallback(
    async (file: File): Promise<ExcelUploadResult> => {
      setLoading(true);
      setError(null);

      try {
        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Mock parsed rules
        const mockRules: Rule[] = [
          {
            name: "Password Complexity",
            description: "Ensure strong password policy",
            category: "Authentication",
            severity: RuleSeverity.HIGH,
            rule_type: RuleType.SECURITY,
            condition:
              "password_min_length >= 8 AND password_complexity = true",
            action: "enforce_password_policy",
            is_active: true,
          },
          {
            name: "Failed Login Attempts",
            description: "Monitor failed login attempts",
            category: "Authentication",
            severity: RuleSeverity.MEDIUM,
            rule_type: RuleType.SECURITY,
            condition: "failed_login_count > 5",
            action: "lock_account_temporary",
            is_active: true,
          },
          {
            name: "File Permissions",
            description: "Check critical file permissions",
            category: "File System",
            severity: RuleSeverity.CRITICAL,
            rule_type: RuleType.COMPLIANCE,
            condition: "file_permission != 644",
            action: "fix_file_permissions",
            is_active: true,
          },
          {
            name: "Service Status",
            description: "Monitor critical services",
            category: "Services",
            severity: RuleSeverity.HIGH,
            rule_type: RuleType.MONITORING,
            condition: "service_status != running",
            action: "restart_service",
            is_active: true,
          },
          {
            name: "Disk Usage",
            description: "Monitor disk space usage",
            category: "Resources",
            severity: RuleSeverity.MEDIUM,
            rule_type: RuleType.PERFORMANCE,
            condition: "disk_usage > 85",
            action: "alert_admin",
            is_active: true,
          },
        ];

        setFormData((prev) => ({
          ...prev,
          rules: mockRules,
        }));

        return {
          success: true,
          rules: mockRules,
          warnings: ["Some rules were modified to fit the current schema"],
        };
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
    []
  );

  const createWorkloadWithRules = useCallback(
    async (data: WorkloadWithRules): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        console.log("Creating workload with rules:", data);

        // Mock successful creation
        return Promise.resolve();
      } catch (err: any) {
        setError(err.message || "Failed to create workload");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
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
      display_name: "",
      description: "",
      workload_type: "",
      is_active: true,
      rules: [],
    });
    setCurrentStep(0);
    setError(null);
  }, []);

  // Validation for step 1
  const isStep1Valid = useCallback(() => {
    return !!formData.name.trim();
  }, [formData.name, formData.workload_type]);

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
