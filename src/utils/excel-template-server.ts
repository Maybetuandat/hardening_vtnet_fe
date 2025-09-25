import * as XLSX from "xlsx";

export const downloadServerTemplate = () => {
  try {
    // Định nghĩa headers
    const headers = ["IP Server", "Instance Role"];

    // Tạo dữ liệu mẫu
    const sampleData = [
      ["192.168.1.3", "compute-server"], // for user1
      ["192.168.1.5", "web-server"], // for user2
      ["192.168.1.34", "db-server"], // for user2
    ];

    // Tạo worksheet từ array of arrays
    const wsData = [headers, ...sampleData];
    const worksheet = XLSX.utils.aoa_to_sheet(wsData);

    // Set độ rộng cột
    const columnWidths = [
      { wch: 40 }, // IP Server
      { wch: 45 }, // Instance Role
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
