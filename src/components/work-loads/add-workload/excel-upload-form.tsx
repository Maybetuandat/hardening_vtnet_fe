import React, { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  Command,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Rule } from "@/types/rule";
import { ExcelUploadResult, WorkloadCommand } from "@/types/add-workload";
import { RulePreviewDialog } from "./rule-preview-dialog";
import { ExcelTemplateGenerator } from "@/utils/excel-template-rule";

interface ExcelUploadFormProps {
  rules: Rule[];
  commands?: WorkloadCommand[];
  loading: boolean;
  onFileUpload: (file: File) => Promise<ExcelUploadResult>;
  onRulesChange: (rules: Rule[]) => void;
}

export function ExcelUploadForm({
  rules,
  commands = [],
  loading,
  onFileUpload,
  onRulesChange,
}: ExcelUploadFormProps) {
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
        errors: ["Please upload a valid Excel file (.xlsx or .xls)"],
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
        errors: ["Failed to process the file. Please try again."],
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

  const handleDownloadTemplate = async (withSampleData: boolean = true) => {
    setDownloadLoading(true);
    try {
      ExcelTemplateGenerator.downloadTemplate("workload-rules-template.xlsx");
    } catch (error) {
      console.error("Error downloading template:", error);
      // Có thể thêm toast notification ở đây
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
            Upload Rules Configuration
          </CardTitle>
          <CardDescription>
            Upload an Excel file containing your workload rules and commands.
            Download the template to see the required format.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Download */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownloadTemplate()}
              disabled={downloadLoading}
              className="flex items-center gap-2"
            >
              {downloadLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download Template
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
                      ? "Processing file..."
                      : "Drop your Excel file here"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse (.xlsx, .xls files only)
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
                    <span className="cursor-pointer">Browse Files</span>
                  </Button>
                </label>
              </div>
            </div>
          )}

          {/* Loading Progress */}
          {loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing {uploadedFileName}...</span>
                <span>Please wait</span>
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
                      <p className="font-medium">File uploaded successfully!</p>
                      <div className="flex items-center gap-4">
                        <span className="text-sm">
                          Found {rules.length} rules and {commands.length}{" "}
                          commands
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowPreview(true)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            Preview Rules
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={removeUploadedFile}
                            className="flex items-center gap-1"
                          >
                            <X className="h-3 w-3" />
                            Remove
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
                      <p className="font-medium">Upload failed</p>
                      {uploadResult.errors?.map((error, index) => (
                        <p key={index} className="text-sm">
                          {error}
                        </p>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Warnings */}
              {uploadResult.warnings && uploadResult.warnings.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-medium">Warnings:</p>
                      {uploadResult.warnings.map((warning, index) => (
                        <p key={index} className="text-sm">
                          {warning}
                        </p>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Rules and Commands Summary */}
          {uploadResult?.success && (
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="font-medium">{rules.length} Rules</p>
                      <p className="text-sm text-muted-foreground">
                        Security rules loaded
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Command className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="font-medium">{commands.length} Commands</p>
                      <p className="text-sm text-muted-foreground">
                        Execution commands loaded
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rules Preview Dialog */}
      <RulePreviewDialog
        open={showPreview}
        onOpenChange={setShowPreview}
        rules={rules}
      />
    </div>
  );
}
