// src/components/servers/server-upload-with-workload.tsx
import React, { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  RefreshCw,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Workload } from "@/types/workload";
import { useServerTemplate } from "@/utils/excel-template-server";
import {
  useServerUpload,
  ServerUploadData,
} from "@/hooks/server/use-server-upload";

interface ServerUploadWithWorkloadProps {
  selectedWorkload: Workload;
  onBack: () => void;
  onComplete: () => void;
}

export const ServerUploadWithWorkload: React.FC<
  ServerUploadWithWorkloadProps
> = ({ selectedWorkload, onBack, onComplete }) => {
  const { downloadTemplate } = useServerTemplate();

  const {
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
    handleAddServersWithWorkload,
  } = useServerUpload();

  // Event handlers for drag & drop
  const handleDrag = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    },
    [setDragActive]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        await handleFileUpload(file);
      }
    },
    [setDragActive, handleFileUpload]
  );

  const handleFileInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        await handleFileUpload(e.target.files[0]);
      }
    },
    [handleFileUpload]
  );

  const handleDownloadTemplate = useCallback(() => {
    const result = downloadTemplate();
    if (result.success) {
      toast.success("Template đã được tải xuống thành công!");
    } else {
      toast.error("Lỗi khi tải template: " + result.message);
    }
  }, [downloadTemplate]);

  const handleAddServersWrapper = useCallback(async () => {
    if (!selectedWorkload.id) {
      toast.error("Không tìm thấy workload ID");
      return;
    }

    await handleAddServersWithWorkload(
      selectedWorkload.id,
      () => {
        onComplete();
      },
      () => {
        // Refresh logic nếu cần
      }
    );
  }, [handleAddServersWithWorkload, selectedWorkload.id, onComplete]);

  const getConnectionStatusBadge = useCallback((server: ServerUploadData) => {
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
  }, []);

  return (
    <div className="space-y-6">
      {/* Header với thông tin workload */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Server cho Workload
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">{selectedWorkload.name}</Badge>
                  {selectedWorkload.description && (
                    <span className="text-sm text-muted-foreground">
                      {selectedWorkload.description}
                    </span>
                  )}
                </div>
              </div>
            </div>
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
        </CardHeader>
      </Card>

      {/* Upload Area */}
      {servers.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".xlsx,.xls"
              onChange={handleFileInputChange}
              disabled={uploading}
            />
            <label
              htmlFor="file-upload"
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer block",
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50",
                uploading && "cursor-not-allowed opacity-50"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
                  {uploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  ) : (
                    <FileSpreadsheet className="h-6 w-6 text-gray-500" />
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    {uploading
                      ? "Đang xử lý file..."
                      : "Kéo và thả file Excel hoặc click để chọn"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Hỗ trợ file .xlsx, .xls (tối đa 10MB)
                  </p>
                </div>
              </div>
            </label>
          </CardContent>
        </Card>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Có lỗi xảy ra:</p>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Server List */}
      {servers.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Danh sách Server ({servers.length} server)</CardTitle>
              <div className="flex items-center gap-2">
                {uploadedFileName && (
                  <Badge variant="outline" className="text-xs">
                    {uploadedFileName}
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDiscard}
                  disabled={adding}
                >
                  <X className="h-4 w-4 mr-1" />
                  Hủy
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Action Buttons */}
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTestConnection}
                    disabled={testing || anyServerTesting}
                  >
                    {testing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Test Connection
                  </Button>
                </div>
                <Button
                  onClick={handleAddServersWrapper}
                  disabled={adding || anyServerTesting}
                  className="flex items-center gap-2"
                >
                  {adding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Thêm Server ({servers.length})
                </Button>
              </div>

              {/* Connection Status Summary */}
              {allServersConnected && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Tất cả server đã kết nối thành công!
                  </AlertDescription>
                </Alert>
              )}

              {hasFailedConnections && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Một số server không thể kết nối. Vui lòng kiểm tra lại thông
                    tin.
                  </AlertDescription>
                </Alert>
              )}

              {/* Server Table */}
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>IP Address</TableHead>
                      <TableHead>SSH User</TableHead>
                      <TableHead>SSH Port</TableHead>
                      <TableHead>Hostname</TableHead>
                      <TableHead>OS Version</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
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
                          {server.hostname || (
                            <span className="text-muted-foreground italic">
                              Chưa xác định
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {server.os_version || (
                            <span className="text-muted-foreground italic">
                              Chưa xác định
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {getConnectionStatusBadge(server)}
                          {server.connection_message && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {server.connection_message}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeServer(server.id)}
                            disabled={adding || testing}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
