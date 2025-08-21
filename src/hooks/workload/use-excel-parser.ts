// src/hooks/workload/use-excel-parser.ts
import { useCallback } from "react";
import * as XLSX from "xlsx";
import { Rule, RuleSeverity, RuleType } from "@/types/rule";
import { WorkloadCommand, ExcelUploadResult } from "@/types/add-workload";

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
   * Helper function để map rule type từ Excel
   */
  const mapRuleType = useCallback((value: any): RuleType => {
    const str = String(value).toLowerCase();
    switch (str) {
      case "security":
        return RuleType.SECURITY;
      case "compliance":
        return RuleType.COMPLIANCE;
      case "performance":
        return RuleType.PERFORMANCE;
      case "monitoring":
        return RuleType.MONITORING;
      default:
        return RuleType.SECURITY;
    }
  }, []);

  /**
   * Parse Excel file và chuyển đổi thành rules và commands
   */
  const parseExcelFile = useCallback(
    async (file: File): Promise<ExcelUploadResult> => {
      try {
        console.log("📄 Parsing Excel file:", file.name);

        // Đọc file Excel
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "buffer" });

        console.log("📋 Available sheets:", workbook.SheetNames);

        // Tìm sheet Rules và Commands
        const rulesSheetName =
          workbook.SheetNames.find((name) =>
            name.toLowerCase().includes("rule")
          ) || workbook.SheetNames[0];
        const commandsSheetName =
          workbook.SheetNames.find((name) =>
            name.toLowerCase().includes("command")
          ) || workbook.SheetNames[1];

        if (!rulesSheetName) {
          throw new Error("Không tìm thấy sheet Rules trong file Excel");
        }

        // Parse Rules sheet
        const rulesSheet = workbook.Sheets[rulesSheetName];
        const rulesData = XLSX.utils.sheet_to_json(rulesSheet, { header: 1 });

        console.log("📊 Rules data:", rulesData);

        // Parse Commands sheet (nếu có)
        let commandsData: any[] = [];
        if (commandsSheetName && workbook.Sheets[commandsSheetName]) {
          const commandsSheet = workbook.Sheets[commandsSheetName];
          commandsData = XLSX.utils.sheet_to_json(commandsSheet, { header: 1 });
          console.log("⚡ Commands data:", commandsData);
        }

        // Chuyển đổi dữ liệu Excel thành Rules
        const rules: Rule[] = [];
        const commands: WorkloadCommand[] = [];

        // Process rules (bỏ qua header row)
        for (let i = 1; i < rulesData.length; i++) {
          const row = rulesData[i] as any[];
          if (row.length < 3) continue; // Skip empty rows

          const rule: Rule = {
            name: row[0] || `Rule ${i}`,
            description: row[1] || "",
            category: row[2] || "General",
            severity: mapSeverity(row[3]),
            rule_type: mapRuleType(row[4]),
            condition: row[5] || "",
            action: row[6] || "",
            is_active: row[7] !== false && row[7] !== "false",
          };

          rules.push(rule);
        }

        // Process commands (bỏ qua header row)
        for (let i = 1; i < commandsData.length; i++) {
          const row = commandsData[i] as any[];
          if (row.length < 4) continue; // Skip empty rows

          const command: WorkloadCommand = {
            rule_index: parseInt(row[0]) || 0,
            os_version: row[1] || "ubuntu24",
            command_text: row[2] || "",
            is_active: row[3] !== false && row[3] !== "false",
          };

          commands.push(command);
        }

        console.log("✅ Parsed successfully:", {
          rules: rules.length,
          commands: commands.length,
        });

        return {
          success: true,
          rules,
          commands,
          warnings: [
            `Đã parse thành công ${rules.length} rules và ${commands.length} commands từ Excel file`,
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
    [mapSeverity, mapRuleType]
  );

  return {
    parseExcelFile,
  };
}
