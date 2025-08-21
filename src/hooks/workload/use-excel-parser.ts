import { useCallback } from "react";
import * as XLSX from "xlsx";

import { ExcelUploadResult } from "@/types/workload";
import { Command } from "@/types/command";
import { RuleSeverity, Rule } from "@/types/rule";

export function useExcelParser() {
  /**
   * Helper function để map severity từ Excel
   */
  const mapSeverity = useCallback((value: any): RuleSeverity => {
    const str = String(value).toLowerCase();
    switch (str) {
      case "critical":
        return RuleSeverity.CRITICAL;
      case "high":
        return RuleSeverity.HIGH;
      case "medium":
        return RuleSeverity.MEDIUM;
      case "low":
        return RuleSeverity.LOW;
      default:
        return RuleSeverity.MEDIUM;
    }
  }, []);

  /**
   * Parse JSON safely
   */
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
   * Parse Excel file theo format mới: Name | Description | Severity | Parameters_JSON | OS_Commands...
   */
  const parseExcelFile = useCallback(
    async (file: File): Promise<ExcelUploadResult> => {
      try {
        console.log("📄 Parsing Excel file:", file.name);

        // Đọc file Excel
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "buffer" });

        console.log("📋 Available sheets:", workbook.SheetNames);

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

        console.log("📊 Raw Excel data:", jsonData);

        // Lấy header row
        const headers = jsonData[0] as string[];
        console.log("📋 Headers:", headers);

        // Các cột bắt buộc cho rule
        const ruleColumns = [
          "Name",
          "Description",
          "Severity",
          "Parameters_JSON",
        ];

        // Kiểm tra có đủ cột bắt buộc không
        const missingColumns = ruleColumns.filter(
          (col) => !headers.includes(col)
        );
        if (missingColumns.length > 0) {
          throw new Error(
            `Thiếu các cột bắt buộc: ${missingColumns.join(", ")}`
          );
        }

        // Tìm các cột command (các cột còn lại không phải rule columns)
        const commandColumns = headers.filter(
          (header) => !ruleColumns.includes(header)
        );
        console.log("⚡ Command columns found:", commandColumns);

        const rules: Rule[] = [];
        const commands: Command[] = [];

        // Process từng row (bỏ qua header row)
        for (let rowIndex = 1; rowIndex < jsonData.length; rowIndex++) {
          const row = jsonData[rowIndex] as any[];

          if (!row || row.length === 0 || !row[0]) {
            continue; // Skip empty rows
          }

          // Tạo object từ row data
          const rowData: Record<string, any> = {};
          headers.forEach((header, colIndex) => {
            rowData[header] = row[colIndex];
          });

          // Tạo rule từ dữ liệu row
          const rule: Rule = {
            name: rowData["Name"] || `Rule ${rowIndex}`,
            description: rowData["Description"] || "",
            severity: mapSeverity(rowData["Severity"]),
            parameters: parseJsonSafely(rowData["Parameters_JSON"]) || {}, // ✅ Đây mới đúng!
            is_active: true, // Mặc định là active
            // Bỏ các field cũ không cần thiết
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
                rule_index: rowIndex - 1, // Index của rule (0-based)
                os_version: extractOsVersionFromColumnName(columnName),
                command_text: commandText.trim(),
                is_active: true,
              };

              commands.push(command);
            }
          });
        }

        console.log("✅ Parsed successfully:", {
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
        console.error("❌ Error parsing Excel file:", err);
        return {
          success: false,
          rules: [],
          errors: [err.message || "Failed to parse Excel file"],
        };
      }
    },
    [mapSeverity, parseJsonSafely, extractOsVersionFromColumnName]
  );

  return {
    parseExcelFile,
  };
}
