// src/components/add-workload/excel-upload-form.tsx
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Rule } from "@/types/rule";
import { ExcelUploadResult } from "@/types/add-workload";
import { RulePreviewDialog } from "./rule-preview-dialog";

interface ExcelUploadFormProps {
  rules: Rule[];
  loading: boolean;
  onFileUpload: (file: File) => Promise<ExcelUploadResult>;
  onRulesChange: (rules: Rule[]) => void;
}

export function ExcelUploadForm({
  rules,
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

  const downloadTemplate = () => {
    // In a real application, this would download a template file
    const link = document.createElement("a");
    link.href = "#"; // This would be the actual template URL
    link.download = "workload-rules-template.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            Upload an Excel file containing your workload rules. Download the
            template to see the required format.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Download */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
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
                  <AlertDescription className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">File uploaded successfully!</p>
                      <p className="text-sm">
                        Found {uploadResult.rules.length} rules in{" "}
                        {uploadedFileName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPreview(true)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        Preview
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removeUploadedFile}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium">Upload failed</p>
                    {uploadResult.errors?.map((error, index) => (
                      <p key={index} className="text-sm">
                        {error}
                      </p>
                    ))}
                  </AlertDescription>
                </Alert>
              )}

              {/* Warnings */}
              {uploadResult.warnings && uploadResult.warnings.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium">Warnings:</p>
                    {uploadResult.warnings.map((warning, index) => (
                      <p key={index} className="text-sm">
                        {warning}
                      </p>
                    ))}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Rules Summary */}
          {rules.length > 0 && (
            <Card className="bg-muted/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Rules Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {rules.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Rules
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {rules.filter((r) => r.is_active).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {
                        rules.filter(
                          (r) =>
                            r.severity === "critical" || r.severity === "high"
                        ).length
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      High Priority
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {new Set(rules.map((r) => r.category)).size}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Categories
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {Array.from(new Set(rules.map((r) => r.category))).map(
                    (category) => (
                      <Badge key={category} variant="secondary">
                        {category}
                      </Badge>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Rule Preview Dialog */}
      <RulePreviewDialog
        open={showPreview}
        onOpenChange={setShowPreview}
        rules={rules}
      />
    </div>
  );
}
