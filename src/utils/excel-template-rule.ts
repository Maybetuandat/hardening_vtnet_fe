import { WorkloadCommandCreate } from "@/types/command";
import { WorkloadRuleCreate } from "@/types/rule";
import { WorkloadTemplateRow } from "@/types/workload";
import * as XLSX from "xlsx";

export interface WorkloadWithRulesAndCommandsRequest {
  workload: {
    name: string;
    description?: string;
  };
  rules: WorkloadRuleCreate[];
  commands: WorkloadCommandCreate[];
}

export class ExcelTemplateGenerator {
  static createSampleData(): WorkloadTemplateRow[] {
    return [
      {
        Name: "file-max",
        Description:
          "Giới hạn tối đa số file mà toàn bộ hệ thống Linux có thể mở cùng lúc",

        Parameters_JSON: JSON.stringify({
          default_value: "9223372036854775807",
        }),
        "Ubuntu 22.04": "cat /proc/sys/fs/file-max",
        CentOS7: "cat /proc/sys/fs/file-max",
        CentOS8: "cat /proc/sys/fs/file-max",
      },
      {
        Name: "net.ipv4.tcp_rmem",
        Description:
          "Tham số quy định ba giá trị ngưỡng cho bộ đệm nhận của TCP socket, tính theo byte",

        Parameters_JSON: JSON.stringify({
          recommended: "4096 87380 56623104",
        }),
        "Ubuntu 22.04": "cat /proc/sys/net/ipv4/tcp_rmem",
        CentOS7: "cat /proc/sys/net/ipv4/tcp_rmem",
        CentOS8: "cat /proc/sys/net/ipv4/tcp_rmem",
      },
      {
        Name: "password_policy",
        Description: "Chính sách mật khẩu cho tài khoản",
        Parameters_JSON: JSON.stringify({
          condition: "ucredit=-1 lcredit=-1 dcredit=-1 ocredit=-1",
        }),
        "Ubuntu 22.04":
          "grep -E 'ucredit\\|lcredit\\|dcredit\\|ocredit' /etc/pam.d/common-password /etc/security/pwquality.conf 2>/dev/null",
        CentOS7:
          "grep -E 'ucredit\\|lcredit\\|dcredit\\|ocredit' /etc/pam.d/system-auth /etc/security/pwquality.conf 2>/dev/null",
        CentOS8:
          "grep -E 'ucredit\\|lcredit\\|dcredit\\|ocredit' /etc/pam.d/system-auth /etc/security/pwquality.conf 2>/dev/null",
      },
    ];
  }

  static parseExcelToBackendFormat(
    excelData: WorkloadTemplateRow[]
  ): WorkloadWithRulesAndCommandsRequest {
    const rules: WorkloadRuleCreate[] = [];
    const commands: WorkloadCommandCreate[] = [];

    const ruleColumns = ["Name", "Description", "Parameters_JSON"];

    excelData.forEach((row, index) => {
      const rule: WorkloadRuleCreate = {
        name: row.Name || "",
        description: row.Description || "",

        parameters: this.parseJsonSafely(row.Parameters_JSON),
        is_active: true,
      };

      rules.push(rule);

      Object.keys(row).forEach((columnName) => {
        if (ruleColumns.includes(columnName)) {
          return;
        }

        const commandText = row[columnName];

        if (
          commandText &&
          typeof commandText === "string" &&
          commandText.trim()
        ) {
          const osVersion = this.extractOsVersionFromColumnName(columnName);

          const command: WorkloadCommandCreate = {
            rule_index: index,
            os_version: osVersion,
            command_text: commandText.trim(),
            is_active: true,
          };

          commands.push(command);
        }
      });
    });

    return {
      workload: {
        name: "",
        description: "",
      },
      rules,
      commands,
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

  private static extractOsVersionFromColumnName(columnName: string): string {
    const cleanName = columnName.replace(/_Command$/i, "").toLowerCase();

    const osMapping: Record<string, string> = {
      ubuntu: "ubuntu",
      centos7: "centos7",
      centos8: "centos8",
      rhel7: "rhel7",
      rhel8: "rhel8",
      debian: "debian",
    };

    return osMapping[cleanName] || cleanName;
  }

  static downloadTemplate(filename: string = "workload-template.xlsx") {
    const sampleData = this.createSampleData();

    const workbook = XLSX.utils.book_new();

    const worksheet = XLSX.utils.json_to_sheet(sampleData);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Rules");

    XLSX.writeFile(workbook, filename);
  }
}
