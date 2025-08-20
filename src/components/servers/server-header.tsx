import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Upload, Download } from "lucide-react";

import { toast } from "sonner";
import { useServerTemplate } from "@/utils/excel-template";

interface ServerHeaderProps {
  onUploadServers: () => void;
  onRefresh: () => void;
  loading: boolean;
}

export const ServerHeader: React.FC<ServerHeaderProps> = ({
  onUploadServers,
  onRefresh,
  loading,
}) => {
  const { downloadTemplate } = useServerTemplate();
  const handleDownloadTemplate = () => {
    const result = downloadTemplate();

    if (result.success) {
      toast.success("Template đã được tải xuống thành công!");
    } else {
      toast.error("Lỗi khi tải template: " + result.message);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quản lý Server</h1>
        <p className="text-muted-foreground">
          Quản lý và giám sát các server trong hệ thống
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Làm mới
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadTemplate}
          disabled={loading}
        >
          <Download className="mr-2 h-4 w-4" />
          Download Template
        </Button>

        <Button size="sm" onClick={onUploadServers} disabled={loading}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Server
        </Button>
      </div>
    </div>
  );
};
