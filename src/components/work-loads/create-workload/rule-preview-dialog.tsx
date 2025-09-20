import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
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
  FileText,
  Terminal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RuleCreate } from "@/types/rule";

interface RulePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rules: RuleCreate[];
}

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
  const { t } = useTranslation("workload");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRules = rules.filter((rule) => {
    const matchesSearch =
      searchTerm === "" ||
      rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.command?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            {t("add.preview.title")}
          </DialogTitle>
        </DialogHeader>

        {/* Filters */}
        <div className="flex-shrink-0 flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg mb-4">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("add.preview.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full w-full">
            <div className="space-y-4 pr-4 pb-4">
              {filteredRules.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">{t("add.preview.noRules")}</p>
                  <p className="text-sm">{t("add.preview.tryFilters")}</p>
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
                            <div className="flex items-center gap-2 mt-1">
                              {!rule.is_active && (
                                <Badge variant="secondary">
                                  {t("add.preview.inactive")}
                                </Badge>
                              )}
                            </div>
                          </div>
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

                      {/* Command */}
                      {rule.command && (
                        <div>
                          <p className="font-medium text-sm mb-2 flex items-center gap-2">
                            <Terminal className="h-4 w-4" />
                            <span>{t("add.preview.command")}</span>
                          </p>
                          <div className="bg-slate-900 text-slate-100 p-3 rounded-md border">
                            <code className="text-sm font-mono whitespace-pre-wrap break-all">
                              {rule.command}
                            </code>
                          </div>
                        </div>
                      )}
                      {/* Suggested Fix */}
                      {rule.suggested_fix && (
                        <div>
                          <p className="font-medium text-sm mb-2 flex items-center gap-2">
                            <Terminal className="h-4 w-4" />
                            <span>{t("add.preview.suggestedFix")}</span>
                          </p>
                          <div className="bg-slate-900 text-slate-100 p-3 rounded-md border">
                            <code className="text-sm font-mono whitespace-pre-wrap break-all">
                              {rule.suggested_fix}
                            </code>
                          </div>
                        </div>
                      )}

                      {rule.parameters && (
                        <div>
                          <p className="font-medium text-sm mb-2 flex items-center gap-2">
                            <span>{t("add.preview.parameters")}</span>
                          </p>
                          {renderParameters(rule.parameters)}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="flex-shrink-0 flex justify-between items-center pt-4 border-t bg-background">
          <div className="text-sm text-muted-foreground"></div>
          <Button onClick={() => onOpenChange(false)} size="sm">
            {t("add.preview.close")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
