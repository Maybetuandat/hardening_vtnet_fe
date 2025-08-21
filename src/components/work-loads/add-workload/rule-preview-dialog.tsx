import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Search,
  Shield,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  XCircle,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Rule } from "@/types/rule";

interface RulePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rules: Rule[];
}

const getSeverityIcon = (severity: string) => {
  switch (severity.toLowerCase()) {
    case "low":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "medium":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case "high":
      return <AlertCircle className="h-4 w-4 text-orange-500" />;
    case "critical":
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <CheckCircle className="h-4 w-4 text-gray-500" />;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity.toLowerCase()) {
    case "low":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "medium":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "high":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
    case "critical":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

const getSeverityText = (severity: string) => {
  switch (severity.toLowerCase()) {
    case "low":
      return "Thấp";
    case "medium":
      return "Trung bình";
    case "high":
      return "Cao";
    case "critical":
      return "Nghiêm trọng";
    default:
      return severity;
  }
};

// Helper function để render parameters một cách đơn giản
const renderParameters = (parameters: any) => {
  if (!parameters) return null;

  // Nếu là string, hiển thị trực tiếp
  if (typeof parameters === "string") {
    return (
      <div className="bg-muted p-3 rounded-md">
        <code className="text-sm whitespace-pre-wrap break-words">
          {parameters}
        </code>
      </div>
    );
  }

  // Nếu là object, hiển thị dưới dạng key-value pairs đơn giản
  if (typeof parameters === "object" && parameters !== null) {
    const entries = Object.entries(parameters);

    if (entries.length === 0) {
      return (
        <div className="bg-muted p-3 rounded-md text-sm text-muted-foreground">
          Không có tham số
        </div>
      );
    }

    return (
      <div className="bg-muted p-3 rounded-md space-y-2">
        {entries.map(([key, value]) => (
          <div key={key} className="flex flex-wrap gap-2">
            <span className="font-medium text-sm min-w-0 break-words">
              {key}:
            </span>
            <span className="text-sm text-muted-foreground min-w-0 break-words">
              {typeof value === "object"
                ? JSON.stringify(value)
                : String(value)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-muted p-3 rounded-md">
      <code className="text-sm whitespace-pre-wrap break-words">
        {String(parameters)}
      </code>
    </div>
  );
};

export function RulePreviewDialog({
  open,
  onOpenChange,
  rules,
}: RulePreviewDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");

  const severities = ["low", "medium", "high", "critical"];

  const filteredRules = rules.filter((rule) => {
    const matchesSearch =
      searchTerm === "" ||
      rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity =
      selectedSeverity === "all" ||
      rule.severity.toLowerCase() === selectedSeverity;

    return matchesSearch && matchesSeverity;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            Xem trước Rules
          </DialogTitle>
          <DialogDescription className="text-base">
            Xem lại {rules.length} quy tắc sẽ được import cho workload này.
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="flex-shrink-0 flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg mb-4">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm quy tắc..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background text-sm min-w-[120px]"
            >
              <option value="all">Tất cả mức độ</option>
              {severities.map((severity) => (
                <option key={severity} value={severity}>
                  {getSeverityText(severity)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Rules List - Đây là phần quan trọng nhất để có thể cuộn */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full w-full">
            <div className="space-y-4 pr-4 pb-4">
              {filteredRules.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Không có quy tắc nào phù hợp</p>
                  <p className="text-sm">
                    Thử thay đổi bộ lọc để xem thêm kết quả
                  </p>
                </div>
              ) : (
                filteredRules.map((rule, index) => (
                  <Card
                    key={`rule-${index}`}
                    className={cn(
                      "transition-all duration-200 hover:shadow-md border",
                      !rule.is_active && "opacity-60 bg-muted/30"
                    )}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <Shield className="h-5 w-5 text-primary flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-lg leading-tight break-words">
                              {rule.name}
                            </CardTitle>
                            {!rule.is_active && (
                              <Badge variant="secondary" className="mt-1">
                                Không hoạt động
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <Badge
                            className={`text-xs ${getSeverityColor(
                              rule.severity
                            )}`}
                          >
                            <div className="flex items-center space-x-1">
                              {getSeverityIcon(rule.severity)}
                              <span>{getSeverityText(rule.severity)}</span>
                            </div>
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0 space-y-4">
                      {/* Description */}
                      {rule.description && (
                        <div>
                          <p className="text-sm text-muted-foreground leading-relaxed break-words">
                            {rule.description}
                          </p>
                        </div>
                      )}

                      {/* Parameters - Hiển thị đơn giản */}
                      {rule.parameters && (
                        <div>
                          <p className="font-medium text-sm mb-2 flex items-center gap-2">
                            <span>Tham số:</span>
                          </p>
                          {renderParameters(rule.parameters)}
                        </div>
                      )}

                      {/* Category */}
                      {rule.category && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {rule.category}
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex-shrink-0 flex justify-between items-center pt-4 border-t bg-background">
          <div className="text-sm text-muted-foreground">
            Hiển thị <span className="font-medium">{filteredRules.length}</span>{" "}
            trong số <span className="font-medium">{rules.length}</span> quy tắc
          </div>
          <Button onClick={() => onOpenChange(false)} size="sm">
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
