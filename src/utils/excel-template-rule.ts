import { RuleCreate } from "@/types/rule";
import * as XLSX from "xlsx";

export interface WorkloadWithRulesAndCommandsRequest {
  workload: {
    name: string;
    description?: string;
  };
  rules: RuleCreate[];
}

// Updated interface for the new template format
interface SimpleTemplateRow {
  Name: string;
  Description: string;
  Parameters: string;
  Command: string;
  Suggested_fix: string;
}

export class ExcelTemplateGenerator {
  static createSampleData(): SimpleTemplateRow[] {
    return [
      {
        Name: "file-max",
        Description:
          "Giới hạn tối đa số file mà toàn bộ hệ thống Linux có thể mở cùng lúc",
        Parameters: JSON.stringify({
          default_value: "9223372036854775807",
        }),
        Command: "cat /proc/sys/fs/file-max",
        Suggested_fix: "echo 9223372036854775807 > /proc/sys/fs/file-max",
      },
      {
        Name: "net.ipv4.tcp_rmem",
        Description:
          "Tham số quy định ba giá trị ngưỡng cho bộ đệm nhận của TCP socket, tính theo byte",
        Parameters: JSON.stringify({
          recommended: "4096 87380 56623104",
        }),
        Command: "cat /proc/sys/net/ipv4/tcp_rmem",
        Suggested_fix:
          "echo '4096 87380 56623104' > /proc/sys/net/ipv4/tcp_rmem",
      },
    ];
  }

  static parseExcelToBackendFormat(
    excelData: SimpleTemplateRow[]
  ): WorkloadWithRulesAndCommandsRequest {
    const rules: RuleCreate[] = [];

    excelData.forEach((row, index) => {
      const rule: RuleCreate = {
        name: row.Name || "",
        description: row.Description || "",
        parameters: this.parseJsonSafely(row.Parameters) || {},
        suggested_fix: row.Suggested_fix || "",
        is_active: "active",
        command: row.Command || "",
      };

      rules.push(rule);
    });

    return {
      workload: {
        name: "",
        description: "",
      },
      rules,
    };
  }

  private static parseJsonSafely(
    jsonString: string
  ): Record<string, any> | undefined {
    if (!jsonString || typeof jsonString !== "string") {
      return undefined;
    }

    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.warn("Failed to parse JSON:", jsonString, error);
      return undefined;
    }
  }

  static downloadTemplate(filename: string = "workload-template.xlsx") {
    const sampleData = this.createSampleData();

    const workbook = XLSX.utils.book_new();

    const worksheet = XLSX.utils.json_to_sheet(sampleData);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Rules");

    XLSX.writeFile(workbook, filename);
  }
}
