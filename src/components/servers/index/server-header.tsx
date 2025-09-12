import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Upload, Server as ServerIcon } from "lucide-react";

import { useTranslation } from "react-i18next";
import { ServerUploadDialogWithWorkload } from "../upload/server-upload-dialog-with-workload";

interface ServerHeaderProps {
  onRefresh: () => void;
  loading: boolean;
}

export const ServerHeader: React.FC<ServerHeaderProps> = ({
  onRefresh,
  loading,
}) => {
  const { t } = useTranslation("server");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const handleUploadServers = () => {
    setUploadDialogOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <ServerIcon className="h-6 w-6 text-green-600" />{" "}
            {/* Sử dụng ServerIcon */}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t("serverHeader.title")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("serverHeader.description")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {t("serverHeader.refreshButton")}
          </Button>

          <Button
            onClick={handleUploadServers}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {t("serverHeader.uploadButton")}
          </Button>
        </div>
      </div>

      <ServerUploadDialogWithWorkload
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onServerAdded={onRefresh}
      />
    </div>
  );
};
