import { useCallback } from "react";
import * as XLSX from "xlsx";

import { ExcelUploadResult } from "@/types/workload";

import { Rule } from "@/types/rule";

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

  const createRuleHashKey = useCallback((rule: Rule): string => {
    const parametersString = rule.parameters
      ? JSON.stringify(rule.parameters, Object.keys(rule.parameters).sort())
      : "";
    return `${rule.name.toLowerCase().trim()}|${parametersString}`;
  }, []);

  const removeDuplicateRules = useCallback(
    (rules: Rule[]) => {
      const seenRules = new Set<string>();
      const uniqueRules: Rule[] = [];
      const duplicates: { rule: Rule; index: number; reason: string }[] = [];

      rules.forEach((rule, index) => {
        const hashKey = createRuleHashKey(rule);

        if (seenRules.has(hashKey)) {
          duplicates.push({
            rule,
            index,
            reason: `Rule "${rule.name}" với cùng parameters đã tồn tại trong file`,
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
          throw new Error("Không tìm thấy sheet nào trong file Excel");
        }

        // Parse sheet thành array of objects
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!jsonData || jsonData.length < 2) {
          throw new Error("File Excel không có dữ liệu hoặc thiếu header");
        }

        console.log(" Raw Excel data:", jsonData);

        const headers = jsonData[0] as string[];
        console.log(" Headers:", headers);

        // Required columns theo format mới
        const ruleColumns = [
          "Name",
          "Description",
          "Parameters_JSON",
          "command",
        ];

        const missingColumns = ruleColumns.filter(
          (col) => !headers.includes(col)
        );
        if (missingColumns.length > 0) {
          throw new Error(
            `Thiếu các cột bắt buộc: ${missingColumns.join(", ")}`
          );
        }

        console.log("⚡ All required columns found:", ruleColumns);

        const rules: Rule[] = [];

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

          const rule: Rule = {
            name: rowData["Name"] || `Rule ${rowIndex}`,
            description: rowData["Description"] || "",
            parameters: parseJsonSafely(rowData["Parameters_JSON"]) || {},
            command:
              rowData["command"] && typeof rowData["command"] === "string"
                ? rowData["command"].trim()
                : undefined,
            is_active: true,
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
          format: "Name | Description | Parameters_JSON | command",
        });

        // Tạo warnings và errors
        const warnings: string[] = [
          `Đã parse thành công ${uniqueRules.length} rules từ Excel file`,
          `Format: Name | Description | Parameters_JSON | command`,
        ];

        const errors: string[] = [];

        if (removedCount > 0) {
          warnings.push(
            ` Đã loại bỏ ${removedCount} rules trùng lặp trong file Excel`
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
