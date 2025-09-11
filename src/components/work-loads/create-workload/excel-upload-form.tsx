import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Download,
  Loader2,
  X,
  Eye,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { RulePreviewDialog } from "./rule-preview-dialog";
import { ExcelTemplateGenerator } from "@/utils/excel-template-rule";
import { RuleCreate } from "@/types/rule";
import { ExcelUploadResult } from "@/types/workload";

interface ExcelUploadFormProps {
  rules: RuleCreate[];
  loading: boolean;
  onFileUpload: (file: File) => Promise<ExcelUploadResult>;
  onRulesChange: (rules: RuleCreate[]) => void;
}

export function ExcelUploadForm({
  rules,
  loading,
  onFileUpload,
  onRulesChange,
}: ExcelUploadFormProps) {
  const { t } = useTranslation("workload");
  const [dragActive, setDragActive] = useState(false);
  const [uploadResult, setUploadResult] = useState<ExcelUploadResult | null>(
    null
  );
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

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

  const handleFileUpload = async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      setUploadResult({
        success: false,
        rules: [],
        errors: [t("add.excel.invalidFile")],
      });
      return;
    }

    setUploadedFileName(file.name);
    try {
      const result = await onFileUpload(file);
      setUploadResult(result);
      if (result.success && result.rules) {
        onRulesChange(result.rules);
      }
    } catch (error) {
      setUploadResult({
        success: false,
        rules: [],
        errors: [t("add.excel.processError")],
      });
    }
  };

  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0]);
    }
  };

  const handleDownloadTemplate = async () => {
    setDownloadLoading(true);
    try {
      ExcelTemplateGenerator.downloadTemplate("mau-workload-rules.xlsx");
    } catch (error) {
      console.error("Lỗi khi tải template:", error);
      alert("Không thể tải xuống template. Vui lòng thử lại.");
    } finally {
      setDownloadLoading(false);
    }
  };

  const removeUploadedFile = () => {
    setUploadResult(null);
    setUploadedFileName("");
    onRulesChange([]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            {t("add.excel.title")}
          </CardTitle>
          <CardDescription>
            {t("add.excel.subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Download */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              disabled={downloadLoading}
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2"
            >
              {downloadLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {t("add.excel.downloadTemplate")}
            </Button>
          </div>

          {/* Upload Area */}
          {!uploadResult?.success && (
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25",
                loading && "opacity-50 pointer-events-none"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="p-4 bg-muted rounded-full">
                  {loading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  ) : (
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    {loading
                      ? t("add.excel.processing")
                      : t("add.excel.dragDrop")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("add.excel.orClick")}
                  </p>
                </div>

                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileInputChange}
                  className="hidden"
                  id="file-upload"
                  disabled={loading}
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" disabled={loading} asChild>
                    <span className="cursor-pointer">{t("add.excel.selectFile")}</span>
                  </Button>
                </label>
              </div>
            </div>
          )}

          {/* Loading Progress */}
          {loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t("add.excel.processing")} {uploadedFileName}...</span>
                <span>{t("add.excel.pleaseWait")}</span>
              </div>
              <Progress value={66} className="w-full" />
            </div>
          )}

          {/* Upload Result */}
          {uploadResult && (
            <div className="space-y-4">
              {uploadResult.success ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">{t("add.excel.uploadSuccess")}</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <FileSpreadsheet className="h-4 w-4" />
                            {t("add.excel.rulesCount", { count: rules.length })}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowPreview(true)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            {t("add.excel.preview")}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={removeUploadedFile}
                            className="flex items-center gap-1"
                          >
                            <X className="h-3 w-3" />
                            {t("add.excel.remove")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">{t("add.excel.uploadFailed")}</p>
                      {uploadResult.errors?.map((error, index) => (
                        <p key={index} className="text-sm">
                          {error}
                        </p>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rules Preview Dialog - Updated to include commands */}
      <RulePreviewDialog
        open={showPreview}
        onOpenChange={setShowPreview}
        rules={rules}
      />
    </div>
  );
}