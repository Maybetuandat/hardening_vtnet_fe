// src/components/servers/server-upload-dialog.tsx
import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Download,
  Wifi,
  RefreshCw,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useServerTemplate } from "@/utils/excel-template";
import * as XLSX from "xlsx";

interface ServerUploadData {
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

interface ServerUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ServerUploadDialog: React.FC<ServerUploadDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [servers, setServers] = useState<ServerUploadData[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);
  const { downloadTemplate } = useServerTemplate();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await handleFileUpload(file);
    }
  }, []);

  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      setErrors(["Vui lòng upload file Excel (.xlsx hoặc .xls)"]);
      return;
    }

    setUploading(true);
    setErrors([]);
    setUploadedFileName(file.name);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Chuyển đổi sang JSON với header từ row đầu tiên
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length < 2) {
        setErrors(["File Excel phải có ít nhất 2 dòng (header + data)"]);
        setUploading(false);
        return;
      }

      const headers = jsonData[0] as string[];
      const rows = jsonData.slice(1) as any[][];

      // Validate headers
      const expectedHeaders = [
        "IP Server",
        "SSH User",
        "SSH Port",
        "SSH Password",
      ];
      const headerValid = expectedHeaders.every((header) =>
        headers.some(
          (h) => h && h.toString().toLowerCase() === header.toLowerCase()
        )
      );

      if (!headerValid) {
        setErrors([
          `File Excel không đúng định dạng. Cần có các cột: ${expectedHeaders.join(
            ", "
          )}`,
        ]);
        setUploading(false);
        return;
      }

      // Parse data
      const parsedServers: ServerUploadData[] = [];
      const parseErrors: string[] = [];

      rows.forEach((row, index) => {
        if (row.length < 4 || !row.some((cell) => cell)) return; // Skip empty rows

        const rowNum = index + 2; // +2 vì index bắt đầu từ 0 và bỏ header

        try {
          const ipAddress = row[0]?.toString().trim();
          const sshUser = row[1]?.toString().trim();
          const sshPort = parseInt(row[2]?.toString()) || 22;
          const sshPassword = row[3]?.toString().trim();

          // Validate required fields
          if (!ipAddress) {
            parseErrors.push(`Dòng ${rowNum}: IP Server không được để trống`);
            return;
          }
          if (!sshUser) {
            parseErrors.push(`Dòng ${rowNum}: SSH User không được để trống`);
            return;
          }
          if (!sshPassword) {
            parseErrors.push(
              `Dòng ${rowNum}: SSH Password không được để trống`
            );
            return;
          }

          // Validate IP format (basic)
          const ipRegex =
            /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
          if (!ipRegex.test(ipAddress)) {
            parseErrors.push(`Dòng ${rowNum}: IP Server không hợp lệ`);
            return;
          }

          // Validate port range
          if (sshPort < 1 || sshPort > 65535) {
            parseErrors.push(`Dòng ${rowNum}: SSH Port phải từ 1-65535`);
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
          parseErrors.push(`Dòng ${rowNum}: Lỗi khi xử lý dữ liệu`);
        }
      });

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
      }
    } catch (error) {
      setErrors(["Lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng file."]);
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const result = downloadTemplate();
    if (result.success) {
      toast.success("Template đã được tải xuống thành công!");
    } else {
      toast.error("Lỗi khi tải template: " + result.message);
    }
  };

  const removeServer = (serverId: string) => {
    setServers((prev) => prev.filter((s) => s.id !== serverId));
  };

  const handleDiscard = () => {
    setServers([]);
    setErrors([]);
    setUploadedFileName("");
    setTesting(false);
  };

  const handleTestConnection = () => {
    // TODO: Implement test connection logic
    setTesting(true);

    // Simulate testing all servers
    servers.forEach((server) => {
      // Update server connection status to testing
      setServers((prev) =>
        prev.map((s) =>
          s.id === server.id
            ? { ...s, connection_status: "testing" as const }
            : s
        )
      );
    });

    // Simulate async testing with random results
    setTimeout(() => {
      setServers((prev) =>
        prev.map((server) => {
          const isSuccess = Math.random() > 0.3; // 70% success rate for demo
          return {
            ...server,
            connection_status: isSuccess ? "success" : "failed",
            connection_message: isSuccess
              ? "Connection successful"
              : "Connection failed: Timeout or invalid credentials",
          };
        })
      );
      setTesting(false);
      toast.info("Test connection completed");
    }, 3000);
  };

  const handleClose = () => {
    handleDiscard();
    onOpenChange(false);
  };

  // Check if all servers have successful connections
  const allServersConnected =
    servers.length > 0 &&
    servers.every((server) => server.connection_status === "success");

  // Check if any server is currently being tested
  const anyServerTesting = servers.some(
    (server) => server.connection_status === "testing"
  );

  // Check if there are failed connections
  const hasFailedConnections = servers.some(
    (server) => server.connection_status === "failed"
  );

  const handleAddServers = () => {
    // TODO: Implement add servers to system
    toast.success(`Sẽ thêm ${servers.length} server vào hệ thống`);
  };

  const getConnectionStatusBadge = (server: ServerUploadData) => {
    switch (server.connection_status) {
      case "testing":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Testing...
          </Badge>
        );
      case "success":
        return (
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">Untested</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Server từ File Excel
          </DialogTitle>
          <DialogDescription>
            Upload file Excel chứa thông tin các server cần thêm vào hệ thống
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Template
            </Button>
          </div>

          {/* Upload Area */}
          {servers.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                    dragActive
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25",
                    uploading && "opacity-50 pointer-events-none"
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="p-4 bg-muted rounded-full">
                      {uploading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      ) : (
                        <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-lg font-medium">
                        {uploading
                          ? "Đang xử lý file..."
                          : "Kéo thả file Excel vào đây"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        hoặc click để chọn file (.xlsx, .xls)
                      </p>
                    </div>

                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileInputChange}
                      className="hidden"
                      id="server-file-upload"
                      disabled={uploading}
                    />
                    <label htmlFor="server-file-upload">
                      <Button variant="outline" disabled={uploading} asChild>
                        <span className="cursor-pointer">Chọn file</span>
                      </Button>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {errors.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Server List */}
          {servers.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">
                    Đã tải lên {servers.length} server từ file:{" "}
                    {uploadedFileName}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTestConnection}
                    disabled={testing || anyServerTesting}
                    className="flex items-center gap-2"
                  >
                    {testing || anyServerTesting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wifi className="h-4 w-4" />
                    )}
                    {testing || anyServerTesting
                      ? "Testing..."
                      : "Test Connection"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDiscard}
                    disabled={testing || anyServerTesting}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Discard
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAddServers}
                    disabled={
                      !allServersConnected || testing || anyServerTesting
                    }
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Thêm Server ({servers.length})
                  </Button>
                </div>
              </div>

              {/* Connection Status Alert */}
              {servers.length > 0 && (
                <div className="space-y-2">
                  {servers.every((s) => s.connection_status === "untested") && (
                    <Alert>
                      <Wifi className="h-4 w-4" />
                      <AlertDescription>
                        Vui lòng test connection cho tất cả server trước khi
                        thêm vào hệ thống.
                      </AlertDescription>
                    </Alert>
                  )}

                  {hasFailedConnections && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Một số server không thể kết nối. Vui lòng loại bỏ các
                        server failed hoặc kiểm tra lại thông tin đăng nhập.
                      </AlertDescription>
                    </Alert>
                  )}

                  {allServersConnected && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        Tất cả server đã kết nối thành công! Bạn có thể thêm vào
                        hệ thống.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>IP Address</TableHead>
                        <TableHead>SSH User</TableHead>
                        <TableHead>SSH Port</TableHead>
                        <TableHead>SSH Password</TableHead>
                        <TableHead>Hostname</TableHead>
                        <TableHead>Connection Status</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {servers.map((server) => (
                        <TableRow key={server.id}>
                          <TableCell className="font-medium">
                            {server.ip_address}
                          </TableCell>
                          <TableCell>{server.ssh_user}</TableCell>
                          <TableCell>{server.ssh_port}</TableCell>
                          <TableCell>
                            <span className="font-mono text-sm">
                              {"*".repeat(server.ssh_password.length)}
                            </span>
                          </TableCell>
                          <TableCell>{server.hostname}</TableCell>
                          <TableCell>
                            {getConnectionStatusBadge(server)}
                            {server.connection_message &&
                              server.connection_status === "failed" && (
                                <div className="text-xs text-red-600 mt-1">
                                  {server.connection_message}
                                </div>
                              )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeServer(server.id)}
                              disabled={testing || anyServerTesting}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
