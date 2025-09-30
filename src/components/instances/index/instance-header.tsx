import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Upload, Server as ServerIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ServerHeaderProps {
  onRefresh: () => void;
  loading: boolean;
}

export const InstanceHeader: React.FC<ServerHeaderProps> = ({
  onRefresh,
  loading,
}) => {
  const { t } = useTranslation("instance");

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <ServerIcon className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t("instanceHeader.title")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("instanceHeader.description")}
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
            {t("instanceHeader.refreshButton")}
          </Button>
        </div>
      </div>
    </div>
  );
};
