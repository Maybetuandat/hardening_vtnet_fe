import { useState, useCallback } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  TestConnectionRequest,
  TestConnectionResponse,
  IpValidationResult,
  ServerUploadData,
  ServerCreate,
} from "@/types/server";
import * as XLSX from "xlsx";

interface UseServerUploadReturn {
  dragActive: boolean;
  uploading: boolean;
  testing: boolean;
  adding: boolean;
  servers: ServerUploadData[];
  uploadedFileName: string;
  errors: string[];

  isDirty: boolean;

  allServersConnected: boolean;
  anyServerTesting: boolean;
  hasFailedConnections: boolean;
  canAddServers: boolean;

  setDragActive: (active: boolean) => void;
  handleFileUpload: (file: File) => Promise<void>;
  removeServer: (serverId: string) => void;
  handleDiscard: () => void;
  handleTestConnection: () => Promise<void>;
  cancelAllOperations: () => void;
  handleAddServersWithWorkload: (
    workloadId: number,
    onSuccess?: () => void,
    onRefreshList?: () => void
  ) => Promise<void>;
}

export function useServerUpload(): UseServerUploadReturn {
  // States
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [adding, setAdding] = useState(false);
  const [servers, setServers] = useState<ServerUploadData[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const isDirty = servers.length > 0 || uploading || testing || adding;

  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  const cancelAllOperations = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    setUploading(false);
    setTesting(false);
    setAdding(false);
    setServers([]);
    setUploadedFileName("");
    setErrors([]);
  }, [abortController]);

  // Computed states
  const allServersConnected =
    servers.length > 0 &&
    servers.every((s) => s.connection_status === "success");
  const anyServerTesting = servers.some(
    (s) => s.connection_status === "testing"
  );
  const hasFailedConnections = servers.some(
    (s) => s.connection_status === "failed"
  );

  // chi co the thuc hien them neu  test thanh cong  het va dia chi ip khong bi trung
  const canAddServers =
    servers.length > 0 &&
    servers.every((s) => s.connection_status === "success") &&
    !anyServerTesting &&
    !adding;

  // Validate IP addresses against database
  const validateIpAddresses = useCallback(
    async (serverList: ServerUploadData[]) => {
      const validationResults: { [ip: string]: boolean } = {};

      for (const server of serverList) {
        try {
          const response = await api.get<IpValidationResult>(
            `/servers/validate/ip/${encodeURIComponent(server.ip_address)}`
          );
          validationResults[server.ip_address] = response.valid;

          if (!response.valid) {
            console.log(`IP ${server.ip_address} already exists in database`);
          }
        } catch (error) {
          console.error(`Error validating IP ${server.ip_address}:`, error);
          validationResults[server.ip_address] = false;
        }
      }

      return validationResults;
    },
    []
  );

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return;

    setUploading(true);
    setErrors([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
      }) as any[][];

      console.log("Raw Excel data:", jsonData);
      console.log("First 3 rows:", jsonData.slice(0, 3));

      if (jsonData.length <= 1) {
        throw new Error("File Excel trống hoặc không có dữ liệu");
      }

      const headers = jsonData[0] as string[];
      const dataRows = jsonData.slice(1) as any[][];

      console.log("Headers found:", headers);
      console.log("Data rows count:", dataRows.length);

      // Validate required columns
      const requiredColumns = [
        "IP Server",
        "SSH User",
        "SSH Port",
        "SSH Password",
      ];
      const missingColumns = requiredColumns.filter(
        (col) =>
          !headers.some((header) => {
            if (!header) return false;
            const headerStr = header.toString().trim();
            const colStr = col.toString().trim();
            return headerStr.toLowerCase() === colStr.toLowerCase();
          })
      );

      if (missingColumns.length > 0) {
        throw new Error(`Thiếu các cột bắt buộc: ${missingColumns.join(", ")}`);
      }

      // Find column indices
      const getColumnIndex = (columnName: string) => {
        return headers.findIndex((header) => {
          if (!header) return false;
          const headerStr = header.toString().trim();
          const colStr = columnName.toString().trim();
          return headerStr.toLowerCase() === colStr.toLowerCase();
        });
      };

      const ipIndex = getColumnIndex("IP Server");
      const userIndex = getColumnIndex("SSH User");
      const portIndex = getColumnIndex("SSH Port");
      const passwordIndex = getColumnIndex("SSH Password");
      const hostnameIndex = getColumnIndex("Hostname");
      const osVersionIndex = getColumnIndex("OS Version");

      // Validate column indices
      if (
        ipIndex === -1 ||
        userIndex === -1 ||
        portIndex === -1 ||
        passwordIndex === -1
      ) {
        throw new Error(
          `Không tìm thấy một số cột bắt buộc. Các cột hiện có: ${headers.join(
            ", "
          )}`
        );
      }

      // Process data rows
      const processedServers: ServerUploadData[] = [];
      const processingErrors: string[] = [];

      dataRows.forEach((row: any[], rowIndex: number) => {
        // Skip empty rows
        if (
          !row ||
          row.length === 0 ||
          row.every((cell) => !cell || cell.toString().trim() === "")
        ) {
          return;
        }

        try {
          const ip_address = row[ipIndex]?.toString().trim();
          const ssh_user = row[userIndex]?.toString().trim();
          const ssh_port_raw = row[portIndex];
          const ssh_password = row[passwordIndex]?.toString();

          // Convert port to number
          let ssh_port: number;
          if (typeof ssh_port_raw === "number") {
            ssh_port = ssh_port_raw;
          } else if (typeof ssh_port_raw === "string") {
            ssh_port = parseInt(ssh_port_raw.trim(), 10);
          } else {
            ssh_port = 22; // Default port
          }

          if (!ip_address || !ssh_user || !ssh_password) {
            processingErrors.push(
              `Dòng ${
                rowIndex + 2
              }: Thiếu thông tin bắt buộc (IP: "${ip_address}", SSH User: "${ssh_user}", SSH Password: ${
                ssh_password ? "[có]" : "[trống]"
              })`
            );
            return;
          }

          // Validate IP format
          const ipRegex =
            /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
          if (!ipRegex.test(ip_address)) {
            processingErrors.push(
              `Dòng ${rowIndex + 2}: IP address không hợp lệ (${ip_address})`
            );
            return;
          }

          // Validate port
          if (isNaN(ssh_port) || ssh_port < 1 || ssh_port > 65535) {
            processingErrors.push(
              `Dòng ${rowIndex + 2}: SSH port không hợp lệ (${ssh_port})`
            );
            return;
          }

          // Check for duplicate IP in current batch
          const duplicateIndex = processedServers.findIndex(
            (s) => s.ip_address === ip_address
          );
          if (duplicateIndex !== -1) {
            processingErrors.push(
              `Dòng ${rowIndex + 2}: IP "${ip_address}" đã tồn tại trong file`
            );
            return;
          }

          const serverData: ServerUploadData = {
            id: `${ip_address}-${Date.now()}-${rowIndex}`,
            ip_address,
            ssh_user,
            ssh_port,
            ssh_password,
            hostname:
              hostnameIndex >= 0 && row[hostnameIndex]
                ? row[hostnameIndex]?.toString().trim()
                : ip_address,
            os_version:
              osVersionIndex >= 0 && row[osVersionIndex]
                ? row[osVersionIndex]?.toString().trim()
                : "Unknown",
            status: "pending",
            connection_status: "untested",
          };

          processedServers.push(serverData);
          console.log(` Processed server ${rowIndex + 2}:`, serverData);
        } catch (error: any) {
          console.error(` Error processing row ${rowIndex + 2}:`, error);
          processingErrors.push(`Dòng ${rowIndex + 2}: ${error.message}`);
        }
      });

      console.log("Processing summary:", {
        totalRows: dataRows.length,
        processedServers: processedServers.length,
        errors: processingErrors.length,
      });

      if (processingErrors.length > 0) {
        setErrors(processingErrors);
      }

      if (processedServers.length === 0) {
        throw new Error("Không có server hợp lệ nào được tìm thấy");
      }

      setServers(processedServers);
      setUploadedFileName(file.name);
      toast.success(`Đã tải lên ${processedServers.length} server thành công!`);
    } catch (error: any) {
      console.error("Error processing file:", error);
      setErrors([error.message || "Có lỗi xảy ra khi xử lý file"]);
      toast.error(error.message || "Có lỗi xảy ra khi xử lý file");
    } finally {
      setUploading(false);
    }
  }, []);

  // Test connection for all servers with IP validation first
  const handleTestConnection = useCallback(async () => {
    if (servers.length === 0) return;

    setTesting(true);

    const controller = new AbortController();
    setAbortController(controller);
    // Set all servers to testing state
    setServers((prevServers) =>
      prevServers.map((server) => ({
        ...server,
        connection_status: "testing" as const,
        connection_message: "Đang kiểm tra kết nối...",
      }))
    );

    try {
      const validationResults = await validateIpAddresses(servers);
      const serversToTest = servers.filter(
        (server) => validationResults[server.ip_address]
      );
      const invalidServers = servers.filter(
        (server) => !validationResults[server.ip_address]
      );

      //  cap nhat nhung server da co dia chi ip trong he thong
      if (invalidServers.length > 0) {
        setServers((prevServers) =>
          prevServers.map((server) => {
            if (!validationResults[server.ip_address]) {
              return {
                ...server,
                connection_status: "failed" as const,
                connection_message: "IP address đã tồn tại trong hệ thống",
              };
            }
            return server;
          })
        );
      }

      if (serversToTest.length > 0) {
        const testRequest: TestConnectionRequest = {
          servers: serversToTest.map((server) => ({
            ip: server.ip_address,
            ssh_user: server.ssh_user,
            ssh_password: server.ssh_password,
            ssh_port: server.ssh_port,
          })),
        };

        const response = await api.post<TestConnectionResponse>(
          "/servers/test-connection",

          testRequest,
          { signal: controller.signal }
        );

        setServers((prevServers) =>
          prevServers.map((server) => {
            if (!validationResults[server.ip_address]) {
              return server;
            }

            const result = response.results.find(
              (r) => r.ip === server.ip_address
            );
            if (result) {
              return {
                ...server,
                connection_status:
                  result.status === "success"
                    ? ("success" as const)
                    : ("failed" as const),
                connection_message: result.message,
                hostname: result.hostname || server.hostname,
                os_version: result.os_version || server.os_version,
              };
            }
            return server;
          })
        );

        const totalSuccessful = response.successful_connections;
        const totalServers = servers.length;
        toast.success(
          `Test connection hoàn thành: ${totalSuccessful}/${totalServers} thành công`
        );
      } else {
        toast.warning("Không có server nào hợp lệ để test connection");
      }

      setTimeout(() => {
        setServers((prevServers) =>
          prevServers.filter((server) => server.connection_status === "success")
        );

        const successfulCount = servers.filter(
          (server) =>
            validationResults[server.ip_address] &&
            serversToTest.find((s) => s.ip_address === server.ip_address)
        ).length;

        if (successfulCount > 0) {
          toast.success(
            `Đã lọc và giữ lại ${successfulCount} server kết nối thành công. Bạn có thể thêm chúng vào hệ thống.`
          );
        } else {
          toast.error(
            "Không có server nào kết nối thành công. Vui lòng kiểm tra lại thông tin."
          );
        }
      }, 5000);
    } catch (error: any) {
      console.error("Error testing connection:", error);

      // Set all remaining servers to failed state
      setServers((prevServers) =>
        prevServers.map((server) => ({
          ...server,
          connection_status: "failed" as const,
          connection_message: "Lỗi khi test connection",
        }))
      );

      toast.error("Có lỗi xảy ra khi test connection");
    } finally {
      setTesting(false);
    }
  }, [servers, validateIpAddresses]);

  const removeServer = useCallback((serverId: string) => {
    setServers((prevServers) => prevServers.filter((s) => s.id !== serverId));
  }, []);

  const handleDiscard = useCallback(() => {
    setServers([]);
    setUploadedFileName("");
    setErrors([]);
  }, []);

  // Add servers with workload (new function)
  const handleAddServersWithWorkload = useCallback(
    async (
      workloadId: number,
      onSuccess?: () => void,
      onRefreshList?: () => void
    ) => {
      if (servers.length === 0) {
        toast.error("Không có server nào để thêm");
        return;
      }

      if (!canAddServers) {
        toast.error(
          "Vui lòng test connection thành công cho tất cả server trước khi thêm"
        );
        return;
      }

      setAdding(true);
      const controller = new AbortController();
      setAbortController(controller);

      try {
        const serverCreateData: ServerCreate[] = servers.map((server) => ({
          hostname: server.hostname || `server-${server.ip_address}`,
          ip_address: server.ip_address,
          os_version: server.os_version || "Unknown",
          ssh_port: server.ssh_port,
          ssh_user: server.ssh_user,
          ssh_password: server.ssh_password,
          workload_id: workloadId,
        }));

        await api.post("/servers/batch", serverCreateData, {
          signal: controller.signal,
        });

        toast.success(
          `Đã thêm ${servers.length} server thành công với workload!`
        );

        // Reset state
        setServers([]);
        setUploadedFileName("");
        setErrors([]);

        // Callbacks
        if (onSuccess) onSuccess();
        if (onRefreshList) onRefreshList();
      } catch (error: any) {
        console.error("Error adding servers with workload:", error);
        toast.error(error.message || "Có lỗi xảy ra khi thêm server");
      } finally {
        setAdding(false);
      }
    },
    [servers, canAddServers]
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
    isDirty,
    // Computed states
    allServersConnected,
    anyServerTesting,
    hasFailedConnections,
    canAddServers, // New computed state

    // Actions
    setDragActive,
    handleFileUpload,
    removeServer,
    handleDiscard,
    handleTestConnection,
    handleAddServersWithWorkload,
    cancelAllOperations,
  };
}
