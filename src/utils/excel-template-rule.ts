// src/utils/excel-template.ts
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
  parameters?: Record<string, any>;
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
      {
        Name: "ssh_config",
        Description: "Cấu hình SSH bảo mật",
        Severity: "high",
        Parameters_JSON: JSON.stringify({
          rule_type: "security",
          condition: "PermitRootLogin=no",
          action: "check_ssh_config",
          config_file: "/etc/ssh/sshd_config",
        }),
        Ubuntu_Command: "grep PermitRootLogin /etc/ssh/sshd_config",
        CentOS7_Command: "grep PermitRootLogin /etc/ssh/sshd_config",
        CentOS8_Command: "grep PermitRootLogin /etc/ssh/sshd_config",
      },
    ];
  }

  /**
   * Parse dữ liệu từ Excel thành format backend
   */
  static parseExcelToBackendFormat(
    excelData: any[]
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
        parameters: this.parseJsonSafely(row.Parameters_JSON),
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
          // Lấy OS version từ tên cột (ví dụ: Ubuntu_Command -> Ubuntu)
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
    } catch (e) {
      console.warn("Invalid JSON in Parameters_JSON:", jsonString);
      return undefined;
    }
  }

  /**
   * Extract OS version từ tên cột
   * Ví dụ: "Ubuntu_Command" -> "Ubuntu", "CentOS7_Command" -> "CentOS7"
   */
  private static extractOsVersionFromColumnName(columnName: string): string {
    // Loại bỏ "_Command" từ cuối tên cột
    if (columnName.endsWith("_Command")) {
      return columnName.replace("_Command", "");
    }

    // Nếu không có pattern "_Command", trả về tên cột gốc
    return columnName;
  }

  /**
   * Tạo file Excel template và tải xuống
   */
  static downloadTemplate(
    filename: string = "workload-rules-template.xlsx"
  ): void {
    try {
      // Tạo dữ liệu mẫu
      const sampleData = this.createSampleData();

      // Tạo worksheet từ dữ liệu
      const worksheet = XLSX.utils.json_to_sheet(sampleData);

      // Định nghĩa độ rộng cột
      const columnWidths = [
        { wch: 20 }, // A: Name
        { wch: 50 }, // B: Description
        { wch: 12 }, // C: Severity
        { wch: 80 }, // D: Parameters_JSON
        { wch: 50 }, // E: Ubuntu_Command
        { wch: 50 }, // F: CentOS7_Command
        { wch: 50 }, // G: CentOS8_Command
      ];

      worksheet["!cols"] = columnWidths;

      // Tạo workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Workload_Template");

      // Tạo và tải xuống file
      XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error("Lỗi khi tạo file Excel template:", error);
      throw new Error("Không thể tạo file template. Vui lòng thử lại.");
    }
  }

  /**
   * Tạo template trống (chỉ có header)
   */
  static downloadEmptyTemplate(
    filename: string = "workload-rules-empty-template.xlsx"
  ): void {
    try {
      // Tạo dữ liệu chỉ có header
      const emptyData = [
        {
          Name: "",
          Description: "",
          Severity: "",
          Parameters_JSON: "",
          Ubuntu_Command: "",
          CentOS7_Command: "",
          CentOS8_Command: "",
        },
      ];

      const worksheet = XLSX.utils.json_to_sheet(emptyData);

      // Định nghĩa độ rộng cột
      const columnWidths = [
        { wch: 20 }, // A: Name
        { wch: 50 }, // B: Description
        { wch: 12 }, // C: Severity
        { wch: 80 }, // D: Parameters_JSON
        { wch: 50 }, // E: Ubuntu_Command
        { wch: 50 }, // F: CentOS7_Command
        { wch: 50 }, // G: CentOS8_Command
      ];

      worksheet["!cols"] = columnWidths;

      // Xóa dòng dữ liệu trống, chỉ giữ header
      const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
      for (let R = range.s.r + 1; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          delete worksheet[cellAddress];
        }
      }
      worksheet["!ref"] = XLSX.utils.encode_range({
        s: { r: 0, c: 0 },
        e: { r: 0, c: range.e.c },
      });

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Workload_Template");

      XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error("Lỗi khi tạo file Excel template trống:", error);
      throw new Error("Không thể tạo file template trống. Vui lòng thử lại.");
    }
  }

  /**
   * Validate dữ liệu từ file Excel upload
   */
  static validateExcelData(data: any[]): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Kiểm tra có dữ liệu hay không
    if (!data || data.length === 0) {
      errors.push("File Excel không có dữ liệu");
      return { isValid: false, errors, warnings };
    }

    // Kiểm tra các cột bắt buộc
    const requiredColumns = ["Name", "Description", "Severity"];
    const firstRow = data[0];

    for (const column of requiredColumns) {
      if (!(column in firstRow)) {
        errors.push(`Thiếu cột bắt buộc: ${column}`);
      }
    }

    // Kiểm tra từng dòng dữ liệu
    data.forEach((row, index) => {
      const rowNumber = index + 1;

      // Kiểm tra Name
      if (!row.Name || typeof row.Name !== "string" || row.Name.trim() === "") {
        errors.push(`Dòng ${rowNumber}: Name không được để trống`);
      }

      // Kiểm tra Severity
      const validSeverities = ["low", "medium", "high", "critical"];
      if (
        row.Severity &&
        !validSeverities.includes(row.Severity.toLowerCase())
      ) {
        warnings.push(
          `Dòng ${rowNumber}: Severity "${
            row.Severity
          }" không hợp lệ. Chỉ chấp nhận: ${validSeverities.join(", ")}`
        );
      }

      // Kiểm tra Parameters_JSON
      if (row.Parameters_JSON) {
        try {
          JSON.parse(row.Parameters_JSON);
        } catch (e) {
          errors.push(
            `Dòng ${rowNumber}: Parameters_JSON không phải là JSON hợp lệ`
          );
        }
      }

      // Kiểm tra Is_Active (bỏ vì không còn sử dụng)
      // Các cột command sẽ được validate riêng nếu cần
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
