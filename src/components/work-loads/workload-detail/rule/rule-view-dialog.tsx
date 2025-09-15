import React from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Terminal,
  Settings,
  Calendar,
  Clock,
  Hash,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { RuleResponse } from "@/types/rule";
import ParametersDisplay from "./parameter-display";

interface RuleViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule: RuleResponse | null;
}

export const RuleViewDialog: React.FC<RuleViewDialogProps> = ({
  open,
  onOpenChange,
  rule,
}) => {
  const { t, i18n } = useTranslation("workload");

  if (!rule) return null;

  const formatDate = (dateString: string) => {
    const locale = i18n.language === "vi" ? "vi-VN" : "en-US";
    return new Date(dateString).toLocaleString(locale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t("ruleViewDialog.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                {t("ruleViewDialog.basicInfo.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {t("ruleViewDialog.basicInfo.name")}
                  </label>
                  <p className="text-base font-semibold break-words">
                    {rule.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {t("ruleViewDialog.basicInfo.ruleId")}
                  </label>
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-gray-500" />
                    <p className="text-base font-mono text-gray-500">
                      {rule.id}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {t("ruleViewDialog.basicInfo.command")}
                  </label>
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-indigo-600" />
                    <Badge
                      variant="outline"
                      className="bg-indigo-50 text-indigo-700 border-indigo-200 font-mono"
                    >
                      {rule.command}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {t("ruleViewDialog.basicInfo.status")}
                  </label>
                  <div className="flex items-center gap-2">
                    {rule.is_active ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-500" />
                    )}
                    <Badge
                      variant="secondary"
                      className={
                        rule.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {rule.is_active
                        ? t("ruleViewDialog.basicInfo.active")
                        : t("ruleViewDialog.basicInfo.inactive")}
                    </Badge>
                  </div>
                </div>
              </div>

              {rule.description && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {t("ruleViewDialog.basicInfo.description")}
                  </label>
                  <p className="text-base leading-relaxed break-words mt-1">
                    {rule.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Parameters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                {t("ruleViewDialog.parameters.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {rule.parameters && Object.keys(rule.parameters).length > 0 ? (
                <ParametersDisplay parameters={rule.parameters} />
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">
                    {t("ruleViewDialog.parameters.noParameters")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t("ruleViewDialog.metadata.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {t("ruleViewDialog.metadata.createdDate")}
                  </label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <p className="text-base">{formatDate(rule.created_at)}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {t("ruleViewDialog.metadata.lastUpdated")}
                  </label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <p className="text-base">{formatDate(rule.updated_at)}</p>
                  </div>
                </div>
              </div>

              {rule.workload_id && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    {t("ruleViewDialog.metadata.workloadId")}
                  </label>
                  <p className="text-base font-mono text-gray-500">
                    #{rule.workload_id}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
