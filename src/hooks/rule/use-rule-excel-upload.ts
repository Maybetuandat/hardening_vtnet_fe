import { useState, useCallback } from "react";
import { api } from "@/lib/api";

import { RuleCreate } from "@/types/rule";

import { ExcelUploadResult } from "@/types/workload";
import { useExcelParser } from "@/hooks/workload/use-excel-parser";

import { useRules } from "@/hooks/rule/use-rules";
import toastHelper from "@/utils/toast-helper";

export interface RuleCheckResult {
  name: string;
  description?: string;
  workload_id: number;
  parameters?: Record<string, any>;
  is_active: boolean;
  is_duplicate: boolean;
  duplicate_reason?: "name" | "parameter_hash";
  command: string;
}

interface UseRuleExcelUploadReturn {
  loading: boolean;
  checkingExistence: boolean;
  error: string | null;
  rules: RuleCreate[];

  checkResults: RuleCheckResult[] | null;
  canAddRules: boolean;
  parseExcelFile: (file: File) => Promise<ExcelUploadResult>;
  checkRulesExistence: (workloadId: number) => Promise<void>;
  createUniqueRules: (workloadId: number) => Promise<void>;
  resetState: () => void;
}

export function useRuleExcelUpload(): UseRuleExcelUploadReturn {
  const [loading, setLoading] = useState(false);
  const [checkingExistence, setCheckingExistence] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data state
  const [rules, setRules] = useState<RuleCreate[]>([]);

  const [checkResults, setCheckResults] = useState<RuleCheckResult[] | null>(
    null
  );

  const { parseExcelFile: parseExcel } = useExcelParser();
  const { createBulkRules } = useRules();

  const parseExcelFile = useCallback(
    async (file: File): Promise<ExcelUploadResult> => {
      setLoading(true);
      setError(null);
      setCheckResults(null);

      try {
        if (!parseExcel) {
          throw new Error("Excel parser is not available");
        }

        const result = await parseExcel(file);

        if (result.success && result.rules) {
          const rulesForApi = result.rules.map((rule) => ({
            name: rule.name,
            description: rule.description || "",
            workload_id: 0,
            parameters: rule.parameters || {},
            is_active: "active",
            command: rule.command,
            suggested_fix: "", // Add default or parsed value for suggested_fix
          }));

          setRules(rulesForApi);
        }

        return result;
      } catch (err: any) {
        const errorMessage = err.message || "Error parsing Excel file";
        setError(errorMessage);
        return {
          success: false,
          rules: [],
          errors: [errorMessage],
        };
      } finally {
        setLoading(false);
      }
    },
    [parseExcel]
  );

  const checkRulesExistence = useCallback(
    async (workloadId: number): Promise<void> => {
      if (rules.length === 0) {
        toastHelper.error("No rules to check");
        return;
      }

      setCheckingExistence(true);
      setError(null);

      try {
        console.log(" Checking rules existence:", {
          workloadId,
          rulesCount: rules.length,
        });

        const rulesToCheck = rules.map((rule) => ({
          ...rule,
          workload_id: workloadId,
          command: rule.command,
        }));

        const response = await api.post<RuleCheckResult[]>(
          "/rules/check-existence",
          {
            workload_id: workloadId,
            rules: rulesToCheck,
          }
        );

        console.log(" Rules existence check completed:", response);
        setCheckResults(response);
      } catch (err: any) {
        console.error(" Error checking rules existence:", err);
        const errorMessage = err.message || "Error checking rules existence";
        setError(errorMessage);
        toastHelper.error(errorMessage);
      } finally {
        setCheckingExistence(false);
      }
    },
    [rules]
  );

  const createUniqueRules = useCallback(
    async (workloadId: number): Promise<void> => {
      if (!checkResults) {
        toastHelper.error("Please check rules existence first");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const uniqueResults = checkResults.filter(
          (result) => !result.is_duplicate
        );

        if (uniqueResults.length === 0) {
          toastHelper.error("Do not have unique rules to add");
          return;
        }

        console.log("Creating unique rules:", {
          workloadId,
          uniqueCount: uniqueResults.length,
        });

        // Build list of rules from unique results
        const ruleDataList: RuleCreate[] = uniqueResults.map((result) => ({
          name: result.name,
          description: result.description || "",
          workload_id: workloadId,
          parameters: result.parameters || {},
          is_active: "active",
          command: result.command,
          suggested_fix: "", // Add default or parsed value for suggested_fix
        }));

        console.log(" Rule data to create:", ruleDataList);
        // Call bulk API
        const createdRules = await createBulkRules?.(ruleDataList);

        if (createdRules) {
          toastHelper.success(
            `Created  ${createdRules.length} new rules successfully`
          );
        }
      } catch (err: any) {
        console.error("Error creating rules:", err);
        const errorMessage = err.message || "Cannot create new rules";
        setError(errorMessage);
        toastHelper.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [checkResults, createBulkRules]
  );

  const resetState = useCallback(() => {
    setLoading(false);
    setCheckingExistence(false);
    setError(null);
    setRules([]);

    setCheckResults(null);
  }, []);

  const canAddRules =
    checkResults !== null &&
    checkResults.some((r) => !r.is_duplicate) &&
    !loading &&
    !checkingExistence;

  return {
    loading,
    checkingExistence,
    error,
    rules,

    checkResults,
    canAddRules,
    parseExcelFile,
    checkRulesExistence,
    createUniqueRules,
    resetState,
  };
}
