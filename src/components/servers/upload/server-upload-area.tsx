import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileSpreadsheet, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServerUploadAreaProps {
  dragActive: boolean;
  uploading: boolean;
  errors: string[];
  hasServers: boolean;
  setDragActive: (active: boolean) => void;
  handleFileUpload: (file: File) => Promise<void>;
}

export const ServerUploadArea: React.FC<ServerUploadAreaProps> = ({
  dragActive,
  uploading,
  errors,
  hasServers,
  setDragActive,
  handleFileUpload,
}) => {
  const { t } = useTranslation("server");

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

  return (
    <div className="space-y-6">
      {/* Error Messages */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">
                {t("serverUploadArea.errors.title")}:
              </p>
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

      {/* Upload Area */}
      {!hasServers && (
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
                      ? t("serverUploadArea.states.processing")
                      : t("serverUploadArea.states.dropZone")}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t("serverUploadArea.fileSupport")}
                  </p>
                </div>
              </div>
            </label>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
