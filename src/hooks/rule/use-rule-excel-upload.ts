import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { RuleCreate } from "@/types/rule";
import { Command } from "@/types/command";
import { ExcelUploadResult } from "@/types/workload";
import { useExcelParser } from "@/hooks/workload/use-excel-parser";
import { useCommands } from "@/hooks/command/use-commands";
import { useRules } from "@/hooks/rule/use-rules";

export interface RuleCheckResult {
  name: string;
  description?: string;
  workload_id: number;
  parameters?: Record<string, any>;
  is_active: boolean;
  is_duplicate: boolean;
  duplicate_reason?: "name" | "parameter_hash";
}

interface UseRuleExcelUploadReturn {
  loading: boolean;
  checkingExistence: boolean;
  error: string | null;
  rules: RuleCreate[];
  commands: Command[];
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
  const [commands, setCommands] = useState<Command[]>([]);
  const [checkResults, setCheckResults] = useState<RuleCheckResult[] | null>(
    null
  );

  // Hooks - tái sử dụng existing hooks
  const { parseExcelFile: parseExcel } = useExcelParser();
  const { createRule } = useRules();
  const { createCommand } = useCommands();

  /**
   * Parse Excel file - tái sử dụng logic từ useExcelParser
   */
  const parseExcelFile = useCallback(
    async (file: File): Promise<ExcelUploadResult> => {
      setLoading(true);
      setError(null);
      setCheckResults(null);

      try {
        if (!parseExcel) {
          throw new Error("Excel parser không khả dụng");
        }

        const result = await parseExcel(file);

        if (result.success && result.rules) {
          // Convert sang RuleCreate format
          const rulesForApi = result.rules.map((rule) => ({
            name: rule.name,
            description: rule.description || "",
            workload_id: 0, // Sẽ được set sau
            parameters: rule.parameters || {},
            is_active: rule.is_active !== false,
          }));

          setRules(rulesForApi);
          setCommands(result.commands || []);
        }

        return result;
      } catch (err: any) {
        const errorMessage = err.message || "Không thể parse file Excel";
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
        toast.error("Không có rules để kiểm tra");
        return;
      }

      setCheckingExistence(true);
      setError(null);

      try {
        console.log("🔍 Checking rules existence:", {
          workloadId,
          rulesCount: rules.length,
        });

        // Update workload_id cho rules
        const rulesToCheck = rules.map((rule) => ({
          ...rule,
          workload_id: workloadId,
        }));

        // FIX: Gọi API với workload_id là query parameter
        const response = await api.post<RuleCheckResult[]>(
          `/rules/check-existence?workload_id=${workloadId}`,
          rulesToCheck // rules array sẽ là request body
        );

        console.log("✅ Rules existence check completed:", response);
        setCheckResults(response);

        const duplicateCount = response.filter((r) => r.is_duplicate).length;
        const uniqueCount = response.filter((r) => !r.is_duplicate).length;

        if (duplicateCount > 0) {
          toast.warning(
            `Phát hiện ${duplicateCount} rules trùng lặp. Chỉ có thể tạo ${uniqueCount} rules mới.`
          );
        } else {
          toast.success(`Tất cả ${uniqueCount} rules đều có thể được tạo.`);
        }
      } catch (err: any) {
        console.error("❌ Error checking rules existence:", err);
        const errorMessage = err.message || "Không thể kiểm tra rule existence";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setCheckingExistence(false);
      }
    },
    [rules]
  );

  /**
   * Tạo các rules unique (đã được check)
   */
  const createUniqueRules = useCallback(
    async (workloadId: number): Promise<void> => {
      if (!checkResults) {
        toast.error("Vui lòng kiểm tra rule existence trước");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Chỉ tạo rules không duplicate
        const uniqueResults = checkResults.filter(
          (result) => !result.is_duplicate
        );

        if (uniqueResults.length === 0) {
          toast.error("Không có rules mới để tạo");
          return;
        }

        console.log("🚀 Creating unique rules:", {
          workloadId,
          uniqueCount: uniqueResults.length,
          totalCommands: commands.length,
        });

        // Tạo rules
        const createdRules = [];
        for (const result of uniqueResults) {
          const ruleData = {
            name: result.name,
            description: result.description || "",
            workload_id: workloadId,
            parameters: result.parameters || {},
            is_active: result.is_active,
          };
          const createdRule = await createRule(ruleData);
          createdRules.push(createdRule);
        }

        console.log("✅ Rules created successfully:", createdRules.length);

        // Tạo commands cho unique rules
        if (commands.length > 0) {
          const originalUniqueIndices = checkResults
            .map((result, index) => ({ result, originalIndex: index }))
            .filter(({ result }) => !result.is_duplicate)
            .map(({ originalIndex }) => originalIndex);

          const uniqueCommands = commands.filter((cmd) =>
            originalUniqueIndices.includes(cmd.rule_index ?? 0)
          );

          // Tạo commands với rule_id từ created rules
          let commandsCreated = 0;
          for (const command of uniqueCommands) {
            const ruleIndex = originalUniqueIndices.indexOf(
              command.rule_index ?? 0
            );
            const correspondingRule = createdRules[ruleIndex];

            if (correspondingRule) {
              const commandData = {
                rule_id: correspondingRule.id,
                os_version: command.os_version,
                command_text: command.command_text,
                is_active: command.is_active,
              };
              await createCommand(commandData);
              commandsCreated++;
            }
          }

          console.log("✅ Commands created successfully:", commandsCreated);
        }

        toast.success(
          `Đã tạo thành công ${createdRules.length} rules và ${commands.length} commands`
        );
      } catch (err: any) {
        console.error("❌ Error creating rules:", err);
        const errorMessage = err.message || "Không thể tạo rules";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [checkResults, commands, createRule, createCommand]
  );

  const resetState = useCallback(() => {
    setLoading(false);
    setCheckingExistence(false);
    setError(null);
    setRules([]);
    setCommands([]);
    setCheckResults(null);
  }, []);

  // Logic để enable/disable nút Add
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
    commands,
    checkResults,
    canAddRules,
    parseExcelFile,
    checkRulesExistence,
    createUniqueRules,
    resetState,
  };
}
