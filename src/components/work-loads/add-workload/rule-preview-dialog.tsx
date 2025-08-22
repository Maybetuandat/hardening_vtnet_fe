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
  Terminal,
  Monitor,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Rule } from "@/types/rule";
import { Command } from "@/types/command";

interface RulePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rules: Rule[];
  commands?: Command[];
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

const getOsIcon = (osVersion: string) => {
  const os = osVersion.toLowerCase();
  if (os.includes("ubuntu")) {
    return <Monitor className="h-4 w-4 text-orange-500" />;
  } else if (os.includes("centos")) {
    return <Monitor className="h-4 w-4 text-blue-500" />;
  } else if (os.includes("rhel") || os.includes("redhat")) {
    return <Monitor className="h-4 w-4 text-red-500" />;
  }
  return <Monitor className="h-4 w-4 text-gray-500" />;
};

const getOsColor = (osVersion: string) => {
  const os = osVersion.toLowerCase();
  if (os.includes("ubuntu")) {
    return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
  } else if (os.includes("centos")) {
    return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
  } else if (os.includes("rhel") || os.includes("redhat")) {
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
  }
  return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
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
  commands = [],
}: RulePreviewDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [expandedRules, setExpandedRules] = useState<Set<number>>(new Set());

  const severities = ["low", "medium", "high", "critical"];

  // Helper function để lấy commands thuộc về một rule cụ thể
  const getCommandsForRule = (ruleIndex: number) => {
    return commands.filter((command) => command.rule_index === ruleIndex);
  };

  // Helper function để toggle expand/collapse rule
  const toggleRuleExpansion = (ruleIndex: number) => {
    const newExpanded = new Set(expandedRules);
    if (newExpanded.has(ruleIndex)) {
      newExpanded.delete(ruleIndex);
    } else {
      newExpanded.add(ruleIndex);
    }
    setExpandedRules(newExpanded);
  };

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
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            Xem trước Rules và Commands
          </DialogTitle>
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
                filteredRules.map((rule, index) => {
                  const ruleCommands = getCommandsForRule(index);
                  const isExpanded = expandedRules.has(index);
                  const hasCommands = ruleCommands.length > 0;

                  return (
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
                              <div className="flex items-center gap-2 mt-1">
                                {!rule.is_active && (
                                  <Badge variant="secondary">
                                    Không hoạt động
                                  </Badge>
                                )}
                                {hasCommands && (
                                  <Badge variant="outline" className="text-xs">
                                    <Terminal className="h-3 w-3 mr-1" />
                                    {ruleCommands.length} lệnh
                                  </Badge>
                                )}
                              </div>
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
                            {hasCommands && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleRuleExpansion(index)}
                                className="h-8 w-8 p-0"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            )}
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

                        {/* Commands Section - Expanded/Collapsed */}
                        {hasCommands && isExpanded && (
                          <div className="mt-4 border-t pt-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Terminal className="h-4 w-4" />
                              <h4 className="font-medium text-sm">
                                Commands ({ruleCommands.length})
                              </h4>
                            </div>
                            <div className="space-y-3">
                              {ruleCommands.map((command, cmdIndex) => (
                                <div
                                  key={`command-${index}-${cmdIndex}`}
                                  className={cn(
                                    "border rounded-md p-3 bg-muted/30 transition-opacity",
                                    !command.is_active && "opacity-60"
                                  )}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        variant="outline"
                                        className={`text-xs ${getOsColor(
                                          command.os_version
                                        )}`}
                                      >
                                        <div className="flex items-center gap-1">
                                          {getOsIcon(command.os_version)}
                                          <span>{command.os_version}</span>
                                        </div>
                                      </Badge>
                                      {!command.is_active && (
                                        <Badge
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          Không hoạt động
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div className="bg-black/5 dark:bg-white/5 p-3 rounded border font-mono text-sm overflow-x-auto">
                                    <code className="whitespace-pre-wrap break-words">
                                      {command.command_text}
                                    </code>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Commands Summary - When collapsed */}
                        {hasCommands && !isExpanded && (
                          <div className="mt-4 border-t pt-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Terminal className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  {ruleCommands.length} lệnh được cấu hình
                                </span>
                              </div>
                              <div className="flex gap-1">
                                {Array.from(
                                  new Set(
                                    ruleCommands.map((cmd) => cmd.os_version)
                                  )
                                )
                                  .slice(0, 3)
                                  .map((os) => (
                                    <Badge
                                      key={os}
                                      variant="outline"
                                      className={`text-xs ${getOsColor(os)}`}
                                    >
                                      {os}
                                    </Badge>
                                  ))}
                                {ruleCommands.length > 3 && (
                                  <span className="text-xs text-muted-foreground ml-1">
                                    +
                                    {Array.from(
                                      new Set(
                                        ruleCommands.map(
                                          (cmd) => cmd.os_version
                                        )
                                      )
                                    ).length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex-shrink-0 flex justify-between items-center pt-4 border-t bg-background">
          <div className="text-sm text-muted-foreground"></div>
          <Button onClick={() => onOpenChange(false)} size="sm">
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
