import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useServerTemplate } from "@/utils/excel-template-server";
import { WorkloadResponse } from "@/types/workload";

interface ServerUploadHeaderProps {
  selectedWorkload: WorkloadResponse;
  onBack: () => void;
}

export const ServerUploadHeader: React.FC<ServerUploadHeaderProps> = ({
  selectedWorkload,
  onBack,
}) => {
  const { t } = useTranslation("server");
  const { downloadTemplate } = useServerTemplate();

  const handleDownloadTemplate = useCallback(() => {
    const result = downloadTemplate();
    if (result.success) {
      toast.success(t("serverUploadHeader.toast.downloadSuccess"));
    } else {
      toast.error(
        t("serverUploadHeader.toast.downloadError", { message: result.message })
      );
    }
  }, [downloadTemplate, t]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                {t("serverUploadHeader.title")}
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
            {t("serverUploadHeader.downloadTemplate")}
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
};
