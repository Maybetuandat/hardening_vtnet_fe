import * as XLSX from "xlsx";

export const downloadServerTemplate = () => {
  try {
    // Định nghĩa headers
    const headers = ["IP Server", "SSH User", "SSH Port", "SSH Password"];

    // Tạo dữ liệu mẫu
    const sampleData = [
      ["192.168.1.100", "root", 22, "password123"],
      ["192.168.1.101", "admin", 22, "admin123"],
      ["10.0.0.50", "ubuntu", 2222, "ubuntu@123"],
    ];

    // Tạo worksheet từ array of arrays
    const wsData = [headers, ...sampleData];
    const worksheet = XLSX.utils.aoa_to_sheet(wsData);

    // Set độ rộng cột
    const columnWidths = [
      { wch: 20 }, // IP Server
      { wch: 15 }, // SSH User
      { wch: 10 }, // SSH Port
      { wch: 20 }, // SSH Password
    ];
    worksheet["!cols"] = columnWidths;

    // Tạo workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Server Template");

    // Tạo file và download
    const fileName = `server-template-${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    XLSX.writeFile(workbook, fileName);

    return { success: true, message: "Template downloaded successfully" };
  } catch (error) {
    console.error("Error downloading template:", error);
    return { success: false, message: "Failed to download template" };
  }
};

// Hook để sử dụng trong component
export const useServerTemplate = () => {
  const downloadTemplate = () => {
    return downloadServerTemplate();
  };

  return { downloadTemplate };
};
