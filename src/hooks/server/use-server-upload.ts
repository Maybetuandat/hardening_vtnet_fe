// src/hooks/use-server-upload.ts
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  TestConnectionRequest,
  TestConnectionResponse,
  ServerCreate,
} from "@/types/server";
import * as XLSX from "xlsx";

export interface ServerUploadData {
  id: string;
  ip_address: string;
  ssh_user: string;
  ssh_port: number;
  ssh_password: string;
  hostname?: string;
  os_version?: string;
  status: string;
  connection_status?: "untested" | "testing" | "success" | "failed";
  connection_message?: string;
}

interface UseServerUploadReturn {
  // States
  dragActive: boolean;
  uploading: boolean;
  testing: boolean;
  adding: boolean;
  servers: ServerUploadData[];
  uploadedFileName: string;
  errors: string[];

  // Computed states
  allServersConnected: boolean;
  anyServerTesting: boolean;
  hasFailedConnections: boolean;

  // Actions
  setDragActive: (active: boolean) => void;
  handleFileUpload: (file: File) => Promise<void>;
  removeServer: (serverId: string) => void;
  handleDiscard: () => void;
  handleTestConnection: () => Promise<void>;
  handleAddServers: (
    onSuccess?: () => void,
    onRefreshList?: () => void
  ) => Promise<void>;
}

export function useServerUpload(): UseServerUploadReturn {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [adding, setAdding] = useState(false);
  const [servers, setServers] = useState<ServerUploadData[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);

  // Parse và validate dữ liệu từ Excel
  const parseExcelData = useCallback(
    (
      jsonData: any[]
    ): {
      servers: ServerUploadData[];
      errors: string[];
    } => {
      const parseErrors: string[] = [];
      const parsedServers: ServerUploadData[] = [];

      // Skip header row và xử lý dữ liệu
      jsonData.slice(1).forEach((row: any[], index: number) => {
        const rowNum = index + 2; // +2 vì bỏ header và index bắt đầu từ 0

        // Skip empty rows
        if (!row || row.length === 0 || !row[0]) {
          return;
        }

        try {
          // Parse và convert kiểu dữ liệu đúng
          const ipAddress = String(row[0] || "").trim();
          const sshUser = String(row[1] || "").trim();
          const sshPortRaw = row[2];
          const sshPassword = String(row[3] || "").trim();

          // Convert SSH Port to number
          let sshPort: number;
          if (typeof sshPortRaw === "number") {
            sshPort = sshPortRaw;
          } else if (typeof sshPortRaw === "string") {
            sshPort = parseInt(sshPortRaw.trim(), 10);
          } else {
            throw new Error("SSH Port không hợp lệ");
          }

          // Validate required fields
          if (!ipAddress || !sshUser || isNaN(sshPort) || !sshPassword) {
            parseErrors.push(
              `Dòng ${rowNum}: Thiếu thông tin bắt buộc (IP: "${ipAddress}", SSH User: "${sshUser}", SSH Port: "${sshPortRaw}", SSH Password: ${
                sshPassword ? "[có]" : "[trống]"
              })`
            );
            return;
          }

          // Validate IP format
          const ipRegex =
            /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
          if (!ipRegex.test(ipAddress)) {
            parseErrors.push(
              `Dòng ${rowNum}: IP Server không hợp lệ: "${ipAddress}"`
            );
            return;
          }

          // Validate port range
          if (sshPort < 1 || sshPort > 65535) {
            parseErrors.push(
              `Dòng ${rowNum}: SSH Port phải từ 1-65535, nhận được: ${sshPort}`
            );
            return;
          }

          // Check for duplicate IP in current batch
          const duplicateIndex = parsedServers.findIndex(
            (s) => s.ip_address === ipAddress
          );
          if (duplicateIndex !== -1) {
            parseErrors.push(
              `Dòng ${rowNum}: IP "${ipAddress}" đã tồn tại trong file (dòng ${
                duplicateIndex + 2
              })`
            );
            return;
          }

          parsedServers.push({
            id: `temp-${Date.now()}-${index}`,
            ip_address: ipAddress,
            ssh_user: sshUser,
            ssh_port: sshPort,
            ssh_password: sshPassword,
            hostname: ipAddress, // Default hostname = IP
            os_version: "",
            status: "inactive",
            connection_status: "untested",
          });
        } catch (error) {
          parseErrors.push(
            `Dòng ${rowNum}: Lỗi khi xử lý dữ liệu - ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      });

      return { servers: parsedServers, errors: parseErrors };
    },
    []
  );

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!file.name.match(/\.(xlsx|xls)$/i)) {
        setErrors(["Vui lòng chọn file Excel (.xlsx hoặc .xls)"]);
        return;
      }

      setUploading(true);
      setErrors([]);
      setUploadedFileName(file.name);

      try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, {
          cellDates: true, // Tự động convert dates
          cellNF: false, // Không dùng number format
          cellText: false, // Không convert tất cả thành text
        });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Parse với options để giữ nguyên kiểu dữ liệu
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: null, // Default value cho empty cells
          raw: false, // Không dùng raw values (sẽ respect cell types)
          dateNF: "yyyy-mm-dd", // Date format
        });

        console.log("Raw Excel data:", jsonData.slice(0, 3)); // Debug: show first 3 rows

        const { servers: parsedServers, errors: parseErrors } = parseExcelData(
          jsonData as any[]
        );

        if (parseErrors.length > 0) {
          setErrors(parseErrors);
        }

        if (parsedServers.length === 0) {
          setErrors((prev) => [
            ...prev,
            "Không có dữ liệu hợp lệ nào được tìm thấy",
          ]);
        } else {
          setServers(parsedServers);
          toast.success(`Đã tải thành công ${parsedServers.length} server`);
          console.log("Parsed servers:", parsedServers); // Debug: show parsed data
        }
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        setErrors([
          "Lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng file.",
        ]);
      } finally {
        setUploading(false);
      }
    },
    [parseExcelData]
  );

  const removeServer = useCallback((serverId: string) => {
    setServers((prev) => prev.filter((s) => s.id !== serverId));
  }, []);

  const handleDiscard = useCallback(() => {
    setServers([]);
    setErrors([]);
    setUploadedFileName("");
    setTesting(false);
    setAdding(false);
  }, []);

  // Test connection với API thực tế
  const handleTestConnection = useCallback(async () => {
    if (servers.length === 0) {
      toast.error("Không có server nào để test connection");
      return;
    }

    setTesting(true);

    try {
      // Cập nhật trạng thái testing cho tất cả server
      setServers((prev) =>
        prev.map((server) => ({
          ...server,
          connection_status: "testing" as const,
          connection_message: "Đang kiểm tra kết nối...",
        }))
      );

      // Chuẩn bị dữ liệu cho API
      const connectionRequest: TestConnectionRequest = {
        servers: servers.map((server) => ({
          ip: server.ip_address,
          ssh_user: server.ssh_user,
          ssh_password: server.ssh_password,
          ssh_port: server.ssh_port,
        })),
      };

      console.log("Testing connections with request:", connectionRequest);

      // Gọi API test connection
      const response = await api.post<TestConnectionResponse>(
        "/servers/test-connection",
        connectionRequest
      );

      // Cập nhật kết quả test connection
      setServers((prev) =>
        prev.map((server) => {
          const result = response.results.find(
            (r) => r.ip === server.ip_address
          );
          if (result) {
            return {
              ...server,
              connection_status: result.status as "success" | "failed",
              connection_message: result.message,
              hostname: result.hostname || server.hostname,
              os_version: result.os_version || server.os_version,
            };
          }
          return server;
        })
      );

      toast.success(
        `Test connection hoàn thành: ${response.successful_connections}/${response.total_servers} server kết nối thành công`
      );
    } catch (error: any) {
      console.error("Error testing connections:", error);

      // Cập nhật tất cả server thành failed nếu có lỗi
      setServers((prev) =>
        prev.map((server) => ({
          ...server,
          connection_status: "failed" as const,
          connection_message: error.message || "Lỗi test connection",
        }))
      );

      toast.error(
        `Lỗi test connection: ${error.message || "Không thể test connection"}`
      );
    } finally {
      setTesting(false);
    }
  }, [servers]);

  // Thêm servers vào hệ thống
  const handleAddServers = useCallback(
    async (onSuccess?: () => void, onRefreshList?: () => void) => {
      if (!allServersConnected) {
        toast.error(
          "Tất cả server phải có connection thành công trước khi thêm"
        );
        return;
      }

      setAdding(true);

      try {
        // Chuẩn bị dữ liệu để tạo server
        const serversToCreate: ServerCreate[] = servers.map((server) => ({
          hostname: server.hostname || server.ip_address,
          ip_address: server.ip_address,
          os_version: server.os_version || "",
          ssh_port: server.ssh_port,
          ssh_user: server.ssh_user,
          ssh_password: server.ssh_password,
          status: true,
        }));

        console.log("Creating servers:", serversToCreate);

        // Gọi API tạo batch servers
        const response = await api.post<any[]>(
          "/servers/batch",
          serversToCreate
        );

        toast.success(
          `Đã thêm thành công ${response.length} server vào hệ thống!`
        );

        // Reset form
        handleDiscard();

        // Gọi callback để refresh danh sách server
        if (onSuccess) {
          onSuccess();
        }
        if (onRefreshList) {
          console.log("🔄 Refreshing server list...");
          onRefreshList();
        }
      } catch (error: any) {
        console.error("Error adding servers:", error);
        toast.error(
          `Lỗi khi thêm server: ${error.message || "Không thể thêm server"}`
        );
      } finally {
        setAdding(false);
      }
    },
    [servers, handleDiscard]
  );

  // Computed states
  const allServersConnected =
    servers.length > 0 &&
    servers.every((server) => server.connection_status === "success");

  const anyServerTesting = servers.some(
    (server) => server.connection_status === "testing"
  );

  const hasFailedConnections = servers.some(
    (server) => server.connection_status === "failed"
  );

  return {
    // States
    dragActive,
    uploading,
    testing,
    adding,
    servers,
    uploadedFileName,
    errors,

    // Computed states
    allServersConnected,
    anyServerTesting,
    hasFailedConnections,

    // Actions
    setDragActive,
    handleFileUpload,
    removeServer,
    handleDiscard,
    handleTestConnection,
    handleAddServers,
  };
}
