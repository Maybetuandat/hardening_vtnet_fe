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
        { wch: 20 }, // B: Name
        { wch: 50 }, // C: Description
        { wch: 12 }, // D: Severity

        { wch: 80 }, // F: Parameters_JSON
        { wch: 50 }, // G: Ubuntu_Command
        { wch: 50 }, // H: CentOS7_Command
        { wch: 50 }, // I: CentOS8_Command
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
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
