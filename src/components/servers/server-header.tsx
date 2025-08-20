import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Upload } from "lucide-react";

import { ServerUploadDialog } from "./server-upload-dialog";

interface ServerHeaderProps {
  onRefresh: () => void;
  loading: boolean;
}

export const ServerHeader: React.FC<ServerHeaderProps> = ({
  onRefresh,
  loading,
}) => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const handleUploadServers = () => {
    setUploadDialogOpen(true);
  };

  return (
    <>
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

          <Button size="sm" onClick={handleUploadServers} disabled={loading}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Server
          </Button>
        </div>
      </div>

      <ServerUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
      />
    </>
  );
};
