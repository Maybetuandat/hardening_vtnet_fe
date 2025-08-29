import { useCallback } from "react";
import * as XLSX from "xlsx";

import { ExcelUploadResult } from "@/types/workload";
import { Command } from "@/types/command";
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

  /**
   * Extract OS version từ tên cột (ví dụ: Ubuntu_Command -> ubuntu)
   */
  const extractOsVersionFromColumnName = useCallback(
    (columnName: string): string => {
      const cleanName = columnName.replace(/_Command$/i, "").toLowerCase();

      // Map một số tên OS phổ biến
      const osMapping: Record<string, string> = {
        ubuntu: "ubuntu",
        centos7: "centos7",
        centos8: "centos8",
        rhel7: "rhel7",
        rhel8: "rhel8",
        debian: "debian",
      };

      return osMapping[cleanName] || cleanName;
    },
    []
  );

  /**
   * Parse Excel file theo format mới: Name | Description  | Parameters_JSON | OS_Commands...
   */
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

        console.log("Raw Excel data:", jsonData);

        const headers = jsonData[0] as string[];
        console.log(" Headers:", headers);

        const ruleColumns = ["Name", "Description", "Parameters_JSON"];

        const missingColumns = ruleColumns.filter(
          (col) => !headers.includes(col)
        );
        if (missingColumns.length > 0) {
          throw new Error(
            `Thiếu các cột bắt buộc: ${missingColumns.join(", ")}`
          );
        }

        const commandColumns = headers.filter(
          (header) => !ruleColumns.includes(header)
        );
        console.log("⚡ Command columns found:", commandColumns);

        const rules: Rule[] = [];
        const commands: Command[] = [];

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
            is_active: true,
          };

          rules.push(rule);

          // Tạo commands từ các cột command
          commandColumns.forEach((columnName) => {
            const commandText = rowData[columnName];

            if (
              commandText &&
              typeof commandText === "string" &&
              commandText.trim()
            ) {
              const command: Command = {
                rule_index: rowIndex - 1,
                os_version: extractOsVersionFromColumnName(columnName),
                command_text: commandText.trim(),
                is_active: true,
              };

              commands.push(command);
            }
          });
        }

        console.log(" Parsed successfully:", {
          rules: rules.length,
          commands: commands.length,
          ruleColumns,
          commandColumns,
        });

        return {
          success: true,
          rules,
          commands,
          warnings: [
            `Đã parse thành công ${rules.length} rules và ${commands.length} commands từ Excel file`,
            `Tìm thấy ${commandColumns.length} loại OS: ${commandColumns.join(
              ", "
            )}`,
          ],
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
    [parseJsonSafely, extractOsVersionFromColumnName]
  );

  return {
    parseExcelFile,
  };
}
