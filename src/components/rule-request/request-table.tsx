import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Inbox,
} from "lucide-react";
import { format } from "date-fns";
import { RuleChangeRequestResponse } from "@/hooks/rule/use-rule-change-request";

interface RequestsTableProps {
  requests: RuleChangeRequestResponse[];
  loading: boolean;
  onEdit: (request: RuleChangeRequestResponse) => void;
  onDelete: (requestId: number) => void;
}

export const RequestsTable: React.FC<RequestsTableProps> = ({
  requests,
  loading,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation("request");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            {t("table.status.pending")}
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="default" className="gap-1 bg-green-600">
            <CheckCircle className="h-3 w-3" />
            {t("table.status.approved")}
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            {t("table.status.rejected")}
          </Badge>
        );
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    return type === "create" ? (
      <Badge variant="default">{t("table.type.create")}</Badge>
    ) : (
      <Badge variant="secondary">{t("table.type.update")}</Badge>
    );
  };

  const toggleExpand = (requestId: number) => {
    setExpandedRow(expandedRow === requestId ? null : requestId);
  };

  const renderChanges = (request: RuleChangeRequestResponse) => {
    const { old_value, new_value } = request;

    if (request.request_type === "create") {
      return (
        <div className="space-y-2 p-4 bg-muted rounded-md">
          <p className="text-sm font-medium">{t("expandedRow.newRuleData")}</p>
          {Object.entries(new_value).map(([key, value]) => (
            <div key={key} className="ml-4 text-sm">
              <span className="font-medium">{key}:</span>{" "}
              <span className="text-muted-foreground">
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
      <div className="space-y-2 p-4 bg-muted rounded-md">
        <p className="text-sm font-medium">{t("expandedRow.changes")}</p>
        {Object.entries(new_value).map(([key, newVal]) => {
          const oldVal = old_value?.[key];
          const hasChanged = JSON.stringify(oldVal) !== JSON.stringify(newVal);

          if (!hasChanged) return null;

          return (
            <div key={key} className="ml-4 space-y-1">
              <p className="text-sm font-medium">{key}:</p>
              <div className="ml-4 space-y-1">
                <div className="text-xs">
                  <span className="text-red-600">
                    {t("expandedRow.oldLabel")}
                  </span>{" "}
                  <span className="text-muted-foreground">
                    {typeof oldVal === "object"
                      ? JSON.stringify(oldVal)
                      : String(oldVal || "N/A")}
                  </span>
                </div>
                <div className="text-xs">
                  <span className="text-green-600">
                    {t("expandedRow.newLabel")}
                  </span>{" "}
                  <span className="text-muted-foreground">
                    {typeof newVal === "object"
                      ? JSON.stringify(newVal)
                      : String(newVal)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Inbox className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t("table.empty.title")}</h3>
        <p className="text-muted-foreground">{t("table.empty.description")}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>{t("table.columns.type")}</TableHead>
            <TableHead>{t("table.columns.ruleName")}</TableHead>
            <TableHead>{t("table.columns.workload")}</TableHead>
            <TableHead>{t("table.columns.status")}</TableHead>
            <TableHead>{t("table.columns.created")}</TableHead>
            <TableHead className="text-right">
              {t("table.columns.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <React.Fragment key={request.id}>
              <TableRow
                id={`request-${request.id}`}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpand(request.id)}
                    className="h-8 w-8 p-0"
                  >
                    {expandedRow === request.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </TableCell>
                <TableCell>{getTypeBadge(request.request_type)}</TableCell>
                <TableCell className="font-medium">
                  {request.rule_name || t("table.newRule")}
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground">
                    {request.workload_name || t("table.na")}
                  </span>
                </TableCell>
                <TableCell>{getStatusBadge(request.status)}</TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(request.created_at), "MMM dd, yyyy HH:mm")}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {request.status === "pending" && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(request)}
                          className="h-8"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          {t("table.actions.edit")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(request.id)}
                          className="h-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {t("table.actions.delete")}
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>

              {expandedRow === request.id && (
                <TableRow>
                  <TableCell colSpan={7} className="bg-muted/30">
                    <div className="py-4 space-y-4">
                      {renderChanges(request)}
                      {request.status !== "pending" && (
                        <div className="text-sm space-y-1 p-4 bg-card rounded-md">
                          <p className="font-medium mb-2">
                            {t("expandedRow.processingInfo.title")}
                          </p>
                          {request.admin_username && (
                            <p>
                              <span className="font-medium">
                                {t("expandedRow.processingInfo.processedBy")}
                              </span>{" "}
                              {request.admin_username}
                            </p>
                          )}
                          {request.processed_at && (
                            <p>
                              <span className="font-medium">
                                {t("expandedRow.processingInfo.date")}
                              </span>{" "}
                              {format(
                                new Date(request.processed_at),
                                "MMM dd, yyyy HH:mm"
                              )}
                            </p>
                          )}
                          {request.admin_note && (
                            <p>
                              <span className="font-medium">
                                {t("expandedRow.processingInfo.adminNote")}
                              </span>{" "}
                              {request.admin_note}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
