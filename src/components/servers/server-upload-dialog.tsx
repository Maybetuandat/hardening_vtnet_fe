import React, { useCallback } from "react";
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
import { useServerTemplate } from "@/utils/excel-template-server";
import {
  useServerUpload,
  ServerUploadData,
} from "@/hooks/server/use-server-upload";

interface ServerUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onServerAdded?: () => void; // Callback để refresh danh sách server
}

export const ServerUploadDialog: React.FC<ServerUploadDialogProps> = ({
  open,
  onOpenChange,
  onServerAdded,
}) => {
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
    handleAddServers,
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

  const handleClose = useCallback(() => {
    handleDiscard();
    onOpenChange(false);
  }, [handleDiscard, onOpenChange]);

  const handleAddServersWrapper = useCallback(async () => {
    await handleAddServers(
      () => {
        onOpenChange(false);
      },
      () => {
        if (onServerAdded) {
          console.log("🔄 Triggering server list refresh...");
          onServerAdded();
        }
      }
    );
  }, [handleAddServers, onOpenChange, onServerAdded]);

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
                          : "Kéo thả file Excel vào đây"}
                      </p>
                      <p className="text-sm text-gray-500">
                        hoặc{" "}
                        <span className="text-primary hover:underline">
                          chọn file từ máy tính
                        </span>
                      </p>
                      <p className="text-xs text-gray-400">
                        Hỗ trợ file .xlsx và .xls
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
                  <p className="font-medium">Lỗi khi xử lý file:</p>
                  {errors.map((error, index) => (
                    <p key={index} className="text-sm">
                      • {error}
                    </p>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Server List */}
          {servers.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">
                        File đã upload: {uploadedFileName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {servers.length} server được tìm thấy
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTestConnection}
                      disabled={testing || anyServerTesting || adding}
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
                      disabled={testing || anyServerTesting || adding}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Discard
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAddServersWrapper}
                      disabled={
                        !allServersConnected ||
                        testing ||
                        anyServerTesting ||
                        adding
                      }
                      className="flex items-center gap-2"
                    >
                      {adding ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      {adding
                        ? "Đang thêm..."
                        : `Thêm Server (${servers.length})`}
                    </Button>
                  </div>
                </div>

                {/* Connection Status Alert */}
                {servers.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {servers.every(
                      (s) => s.connection_status === "untested"
                    ) && (
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
                          Tất cả server đã kết nối thành công! Bạn có thể thêm
                          vào hệ thống.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {/* Server Table */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>IP Address</TableHead>
                        <TableHead>SSH User</TableHead>
                        <TableHead>SSH Port</TableHead>
                        <TableHead>Hostname</TableHead>
                        <TableHead>OS Version</TableHead>
                        <TableHead>Connection Status</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {servers.map((server) => (
                        <TableRow key={server.id}>
                          <TableCell className="font-mono">
                            {server.ip_address}
                          </TableCell>
                          <TableCell>{server.ssh_user}</TableCell>
                          <TableCell>{server.ssh_port}</TableCell>
                          <TableCell>
                            {server.hostname || (
                              <span className="text-gray-400 italic">
                                Auto-detect
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {server.os_version || (
                              <span className="text-gray-400 italic">
                                Auto-detect
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {getConnectionStatusBadge(server)}
                              {server.connection_message && (
                                <p className="text-xs text-gray-500">
                                  {server.connection_message}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeServer(server.id)}
                              disabled={testing || anyServerTesting || adding}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
