import * as XLSX from "xlsx";

export interface WorkloadTemplateRow {
  Name: string;
  Description: string;
  Severity: string;
  Parameters_JSON: string;
  Ubuntu_Command: string;
  CentOS7_Command: string;
  CentOS8_Command: string;
  [key: string]: any; // Cho phép thêm các cột OS khác
}

// Backend compatible types
export interface WorkloadRuleCreate {
  name: string;
  description?: string;
  severity: string;
  parameters?: Record<string, any>; // ✅ Đây mới đúng!
  is_active: boolean;
}

export interface WorkloadCommandCreate {
  rule_index: number;
  os_version: string;
  command_text: string;
  is_active: boolean;
}

export interface WorkloadWithRulesAndCommandsRequest {
  workload: {
    name: string;
    description?: string;
  };
  rules: WorkloadRuleCreate[];
  commands: WorkloadCommandCreate[];
}

export class ExcelTemplateGenerator {
  /**
   * Tạo dữ liệu mẫu cho workload template
   */
  static createSampleData(): WorkloadTemplateRow[] {
    return [
      {
        Name: "file-max",
        Description:
          "Giới hạn tối đa số file mà toàn bộ hệ thống Linux có thể mở cùng lúc",
        Severity: "medium",
        Parameters_JSON: JSON.stringify({
          default_value: "9223372036854775807",
          recommended_value: "5000000",
          note: "Check lại con số này",
          docs: "file-max-docs",
        }),
        Ubuntu_Command: "cat /proc/sys/fs/file-max",
        CentOS7_Command: "cat /proc/sys/fs/file-max",
        CentOS8_Command: "cat /proc/sys/fs/file-max",
      },
      {
        Name: "net.ipv4.tcp_rmem",
        Description:
          "Tham số quy định ba giá trị ngưỡng cho bộ đệm nhận của TCP socket, tính theo byte",
        Severity: "high",
        Parameters_JSON: JSON.stringify({
          min: 4096,
          default: 87380,
          max: 87380,
          unit: "byte",
          range: "4096-6291456",
          recommended: "4096 87380 56623104",
        }),
        Ubuntu_Command: "cat /proc/sys/net/ipv4/tcp_rmem",
        CentOS7_Command: "cat /proc/sys/net/ipv4/tcp_rmem",
        CentOS8_Command: "cat /proc/sys/net/ipv4/tcp_rmem",
      },
      {
        Name: "password_policy",
        Description: "Chính sách mật khẩu cho tài khoản",
        Severity: "high",
        Parameters_JSON: JSON.stringify({
          rule_type: "password_policy",
          condition: "ucredit=-1 lcredit=-1 dcredit=-1 ocredit=-1",
          action: "enforce_password_policy",
          note: "Mật khẩu phải có chữ hoa, chữ thường, kí tự đặc biệt, chữ số",
        }),
        Ubuntu_Command:
          "grep -E 'ucredit\\|lcredit\\|dcredit\\|ocredit' /etc/pam.d/common-password /etc/security/pwquality.conf 2>/dev/null",
        CentOS7_Command:
          "grep -E 'ucredit\\|lcredit\\|dcredit\\|ocredit' /etc/pam.d/system-auth /etc/security/pwquality.conf 2>/dev/null",
        CentOS8_Command:
          "grep -E 'ucredit\\|lcredit\\|dcredit\\|ocredit' /etc/pam.d/system-auth /etc/security/pwquality.conf 2>/dev/null",
      },
    ];
  }

  /**
   * ✅ Parse dữ liệu từ Excel thành format backend - FIXED VERSION
   */
  static parseExcelToBackendFormat(
    excelData: WorkloadTemplateRow[]
  ): WorkloadWithRulesAndCommandsRequest {
    const rules: WorkloadRuleCreate[] = [];
    const commands: WorkloadCommandCreate[] = [];

    // Định nghĩa các cột thuộc về rule (không phải command)
    const ruleColumns = ["Name", "Description", "Severity", "Parameters_JSON"];

    excelData.forEach((row, index) => {
      // Tạo rule từ dòng hiện tại
      const rule: WorkloadRuleCreate = {
        name: row.Name || "",
        description: row.Description || "",
        severity: (row.Severity || "medium").toLowerCase(),
        parameters: this.parseJsonSafely(row.Parameters_JSON), // ✅ Đây mới đúng!
        is_active: true, // Mặc định là true
      };

      rules.push(rule);

      // Tạo commands từ các cột còn lại (không phải rule columns)
      Object.keys(row).forEach((columnName) => {
        // Bỏ qua các cột thuộc về rule
        if (ruleColumns.includes(columnName)) {
          return;
        }

        const commandText = row[columnName];
        // Chỉ tạo command nếu có nội dung
        if (
          commandText &&
          typeof commandText === "string" &&
          commandText.trim()
        ) {
          // Lấy OS version từ tên cột (ví dụ: Ubuntu_Command -> ubuntu)
          const osVersion = this.extractOsVersionFromColumnName(columnName);

          const command: WorkloadCommandCreate = {
            rule_index: index, // Index của rule trong mảng (0-based)
            os_version: osVersion,
            command_text: commandText.trim(),
            is_active: true, // Mặc định là true
          };

          commands.push(command);
        }
      });
    });

    return {
      workload: {
        name: "", // Sẽ được điền từ form
        description: "",
      },
      rules,
      commands,
    };
  }

  /**
   * Parse JSON safely, trả về undefined nếu không hợp lệ
   */
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

  /**
   * Extract OS version từ tên cột
   */
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

  /**
   * Tạo và download template Excel
   */
  static downloadTemplate(filename: string = "workload-template.xlsx") {
    const sampleData = this.createSampleData();

    // Tạo workbook
    const workbook = XLSX.utils.book_new();

    // Tạo worksheet từ sample data
    const worksheet = XLSX.utils.json_to_sheet(sampleData);

    // Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rules");

    // Download file
    XLSX.writeFile(workbook, filename);
  }
}
