import { WorkloadRuleCreate } from "@/types/rule";
import { WorkloadTemplateRow } from "@/types/workload";
import * as XLSX from "xlsx";

export interface WorkloadWithRulesAndCommandsRequest {
  workload: {
    name: string;
    description?: string;
  };
  rules: WorkloadRuleCreate[];
}

// Updated interface for the new template format
interface SimpleTemplateRow {
  Name: string;
  Description: string;
  Parameters_JSON: string;
  command: string;
}

export class ExcelTemplateGenerator {
  static createSampleData(): SimpleTemplateRow[] {
    return [
      {
        Name: "file-max",
        Description:
          "Giới hạn tối đa số file mà toàn bộ hệ thống Linux có thể mở cùng lúc",
        Parameters_JSON: JSON.stringify({
          default_value: "9223372036854775807",
        }),
        command: "cat /proc/sys/fs/file-max",
      },
      {
        Name: "net.ipv4.tcp_rmem",
        Description:
          "Tham số quy định ba giá trị ngưỡng cho bộ đệm nhận của TCP socket, tính theo byte",
        Parameters_JSON: JSON.stringify({
          recommended: "4096 87380 56623104",
        }),
        command: "cat /proc/sys/net/ipv4/tcp_rmem",
      },
      {
        Name: "password_policy",
        Description: "Chính sách mật khẩu cho tài khoản",
        Parameters_JSON: JSON.stringify({
          condition: "ucredit=-1 lcredit=-1 dcredit=-1 ocredit=-1",
        }),
        command:
          "grep -E 'ucredit\\|lcredit\\|dcredit\\|ocredit' /etc/pam.d/common-password /etc/security/pwquality.conf 2>/dev/null",
      },
    ];
  }

  static parseExcelToBackendFormat(
    excelData: SimpleTemplateRow[]
  ): WorkloadWithRulesAndCommandsRequest {
    const rules: WorkloadRuleCreate[] = [];

    excelData.forEach((row, index) => {
      const rule: WorkloadRuleCreate = {
        name: row.Name || "",
        description: row.Description || "",
        parameters: this.parseJsonSafely(row.Parameters_JSON),
        is_active: true,
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
