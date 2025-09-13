import * as XLSX from "xlsx";
import { api } from "@/lib/api";
import {
  ServerUploadData,
  TestConnectionRequest,
  TestConnectionResponse,
  IpValidationResult,
  ServerCreate,
} from "@/types/server";

// Excel file processing utilities
export class ExcelUtils {
  static async processExcelFile(file: File): Promise<{
    servers: ServerUploadData[];
    errors: string[];
  }> {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
    }) as any[][];

    if (jsonData.length <= 1) {
      throw new Error("Excel file is empty or has no data rows");
    }

    const headers = jsonData[0] as string[];
    const dataRows = jsonData.slice(1) as any[][];

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
          return header.toString().trim().toLowerCase() === col.toLowerCase();
        })
    );

    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(", ")}`);
    }

    // Get column indices
    const getColumnIndex = (columnName: string) =>
      headers.findIndex((header) => {
        if (!header) return false;
        return (
          header.toString().trim().toLowerCase() === columnName.toLowerCase()
        );
      });

    const ipIndex = getColumnIndex("IP Server");
    const userIndex = getColumnIndex("SSH User");
    const portIndex = getColumnIndex("SSH Port");
    const passwordIndex = getColumnIndex("SSH Password");
    const hostnameIndex = getColumnIndex("Hostname");
    const osVersionIndex = getColumnIndex("OS Version");

    // Process data rows
    const processedServers: ServerUploadData[] = [];
    const processingErrors: string[] = [];

    dataRows.forEach((row: any[], rowIndex: number) => {
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
        const ssh_password = row[passwordIndex]?.toString();
        let ssh_port = 22;

        // Process port
        const ssh_port_raw = row[portIndex];
        if (typeof ssh_port_raw === "number") {
          ssh_port = ssh_port_raw;
        } else if (typeof ssh_port_raw === "string") {
          ssh_port = parseInt(ssh_port_raw.trim(), 10);
        }

        // Validate required fields
        if (!ip_address || !ssh_user || !ssh_password) {
          processingErrors.push(
            `Row ${rowIndex + 2}: Missing required information`
          );
          return;
        }

        // Validate IP format
        const ipRegex =
          /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        if (!ipRegex.test(ip_address)) {
          processingErrors.push(`Row ${rowIndex + 2}: Invalid IP address`);
          return;
        }

        // Validate port
        if (isNaN(ssh_port) || ssh_port < 1 || ssh_port > 65535) {
          processingErrors.push(`Row ${rowIndex + 2}: Invalid SSH port`);
          return;
        }

        // Check for duplicate IP
        if (processedServers.find((s) => s.ip_address === ip_address)) {
          processingErrors.push(`Row ${rowIndex + 2}: Duplicate IP address`);
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
      } catch (error: any) {
        processingErrors.push(`Row ${rowIndex + 2}: ${error.message}`);
      }
    });

    return {
      servers: processedServers,
      errors: processingErrors,
    };
  }
}

// Connection testing utilities
export class ConnectionUtils {
  static async validateIpAddresses(
    serverList: ServerUploadData[]
  ): Promise<{ [ip: string]: boolean }> {
    const validationResults: { [ip: string]: boolean } = {};

    for (const server of serverList) {
      try {
        const response = await api.get<IpValidationResult>(
          `/servers/validate/ip/${encodeURIComponent(server.ip_address)}`
        );
        validationResults[server.ip_address] = response.valid;
      } catch (error) {
        console.error(`Error validating IP ${server.ip_address}:`, error);
        validationResults[server.ip_address] = false;
      }
    }

    return validationResults;
  }

  static async testConnections(
    servers: ServerUploadData[],
    signal?: AbortSignal
  ): Promise<TestConnectionResponse> {
    const testRequest: TestConnectionRequest = {
      servers: servers.map((server) => ({
        ip: server.ip_address,
        ssh_user: server.ssh_user,
        ssh_password: server.ssh_password,
        ssh_port: server.ssh_port,
      })),
    };

    return await api.post<TestConnectionResponse>(
      "/servers/test-connection",
      testRequest,
      signal ? { signal } : undefined
    );
  }
}

// Server management utilities
export class ServerUtils {
  static async addServersWithWorkload(
    servers: ServerUploadData[],
    workloadId: number,
    signal?: AbortSignal
  ): Promise<void> {
    const serverCreateData: ServerCreate[] = servers.map((server) => ({
      hostname: server.hostname || `server-${server.ip_address}`,
      ip_address: server.ip_address,
      os_version: server.os_version || "Unknown",
      ssh_port: server.ssh_port,
      ssh_user: server.ssh_user,
      ssh_password: server.ssh_password,
      workload_id: workloadId,
    }));

    await api.post(
      "/servers/batch",
      serverCreateData,
      signal ? { signal } : undefined
    );
  }
}
