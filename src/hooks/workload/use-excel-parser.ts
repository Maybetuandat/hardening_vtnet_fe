import { useCallback } from "react";
import * as XLSX from "xlsx";

import { ExcelUploadResult } from "@/types/workload";

import { RuleCreate } from "@/types/rule";

export function useExcelParser() {
  const parseJsonSafely = useCallback(
    (jsonString: string): Record<string, any> | null => {
      if (!jsonString || typeof jsonString !== "string") {
        return null;
      }

      try {
        return JSON.parse(jsonString);
      } catch (error) {
        console.warn("Failed to parse JSON:", jsonString, error);
        return null;
      }
    },
    []
  );

  const createRuleHashKey = useCallback((rule: RuleCreate): string => {
    const parametersString = rule.parameters
      ? JSON.stringify(rule.parameters, Object.keys(rule.parameters).sort())
      : "";
    return `${rule.name.toLowerCase().trim()}|${parametersString}`;
  }, []);

  const removeDuplicateRules = useCallback(
    (rules: RuleCreate[]) => {
      const seenRules = new Set<string>();
      const uniqueRules: RuleCreate[] = [];
      const duplicates: { rule: RuleCreate; index: number; reason: string }[] =
        [];

      rules.forEach((rule, index) => {
        const hashKey = createRuleHashKey(rule);

        if (seenRules.has(hashKey)) {
          duplicates.push({
            rule,
            index,
            reason: `Rule "${rule.name}" with same name and parameters already exists`,
          });
        } else {
          seenRules.add(hashKey);
          uniqueRules.push(rule);
        }
      });

      return {
        uniqueRules,
        duplicates,
        removedCount: duplicates.length,
      };
    },
    [createRuleHashKey]
  );

  const parseExcelFile = useCallback(
    async (file: File): Promise<ExcelUploadResult> => {
      try {
        console.log(" Parsing Excel file:", file.name);

        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "buffer" });

        console.log(" Available sheets:", workbook.SheetNames);

        // Lấy sheet đầu tiên hoặc sheet có tên chứa "rule"
        const sheetName =
          workbook.SheetNames.find((name) =>
            name.toLowerCase().includes("rule")
          ) || workbook.SheetNames[0];

        if (!sheetName) {
          throw new Error("Error reading Excel file: No sheets found");
        }

        // Parse sheet thành array of objects
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!jsonData || jsonData.length < 2) {
          throw new Error("Error reading Excel file: No data found");
        }

        console.log(" Raw Excel data:", jsonData);

        const headers = jsonData[0] as string[];

        // Required columns theo format mới
        const ruleColumns = [
          "Name",
          "Description",
          "Parameters",
          "Command",
          "Suggested_fix",
        ];

        const missingColumns = ruleColumns.filter(
          (col) => !headers.includes(col)
        );
        if (missingColumns.length > 0) {
          throw new Error(
            `Missing required columns: ${missingColumns.join(", ")}`
          );
        }

        console.log("⚡ All required columns found:", ruleColumns);

        const rules: RuleCreate[] = [];

        // Parse tất cả rules
        for (let rowIndex = 1; rowIndex < jsonData.length; rowIndex++) {
          const row = jsonData[rowIndex] as any[];

          if (!row || row.length === 0 || !row[0]) {
            continue;
          }

          // Tạo object từ row data
          const rowData: Record<string, any> = {};
          headers.forEach((header, colIndex) => {
            rowData[header] = row[colIndex];
          });

          const rule: RuleCreate = {
            name: rowData["Name"] || `Rule ${rowIndex}`,
            description: rowData["Description"] || "",
            parameters: parseJsonSafely(rowData["Parameters"]) || {},
            command:
              rowData["Command"] && typeof rowData["Command"] === "string"
                ? rowData["Command"].trim()
                : "",
            is_active: "active",
            suggested_fix: rowData["Suggested_fix"] || "",
          };

          rules.push(rule);
        }

        // Check và loại bỏ duplicate rules
        const { uniqueRules, duplicates, removedCount } =
          removeDuplicateRules(rules);

        console.log(" Parsed successfully:", {
          totalRules: rules.length,
          uniqueRules: uniqueRules.length,
          duplicatesRemoved: removedCount,
          format: "Name | Description | Parameters | Command | Suggested_fix",
        });

        // Tạo warnings và errors
        const warnings: string[] = [
          `Parsed ${uniqueRules.length} rules from Excel file`,
          `Format: Name | Description | Parameters | Command | Suggested_fix`,
        ];

        const errors: string[] = [];

        if (removedCount > 0) {
          warnings.push(
            `Removed ${removedCount} duplicate rules from Excel file`
          );
          duplicates.forEach((duplicate) => {
            warnings.push(
              `   - Row ${duplicate.index + 2}: ${duplicate.reason}`
            );
          });
        }

        return {
          success: true,
          rules: uniqueRules,
          warnings,
          errors: errors.length > 0 ? errors : undefined,
        };
      } catch (err: any) {
        console.error(" Error parsing Excel file:", err);
        return {
          success: false,
          rules: [],
          errors: [err.message || "Failed to parse Excel file"],
        };
      }
    },
    [parseJsonSafely, removeDuplicateRules, createRuleHashKey]
  );

  return {
    parseExcelFile,
  };
}
