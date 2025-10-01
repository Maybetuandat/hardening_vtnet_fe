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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  Loader2,
  Inbox,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { RuleChangeRequestResponse } from "@/hooks/rule/use-rule-change-request";

interface AdminRequestsTableProps {
  requests: RuleChangeRequestResponse[];
  loading: boolean;
  onApprove: (requestId: number, adminNote?: string) => Promise<void>;
  onReject: (requestId: number, adminNote?: string) => Promise<void>;
}

export const AdminRequestsTable: React.FC<AdminRequestsTableProps> = ({
  requests,
  loading,
  onApprove,
  onReject,
}) => {
  const { t } = useTranslation("request");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [adminNote, setAdminNote] = useState<string>("");

  const toggleExpand = (requestId: number) => {
    if (expandedRow === requestId) {
      setExpandedRow(null);
      setAdminNote("");
    } else {
      setExpandedRow(requestId);
      setAdminNote("");
    }
  };

  const handleApprove = async (requestId: number) => {
    try {
      setProcessingId(requestId);
      await onApprove(requestId, adminNote || undefined);
      setExpandedRow(null);
      setAdminNote("");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      setProcessingId(requestId);
      await onReject(requestId, adminNote || undefined);
      setExpandedRow(null);
      setAdminNote("");
    } finally {
      setProcessingId(null);
    }
  };

  const getTypeBadge = (type: string) => {
    return type === "create" ? (
      <Badge variant="default">{t("table.type.create")}</Badge>
    ) : (
      <Badge variant="secondary">{t("table.type.update")}</Badge>
    );
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

    // Update request
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
        <h3 className="text-lg font-semibold mb-2">{t("admin.empty.title")}</h3>
        <p className="text-muted-foreground">{t("admin.empty.description")}</p>
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
            <TableHead>{t("admin.columns.requester")}</TableHead>
            <TableHead>{t("table.columns.created")}</TableHead>
            <TableHead className="text-right">
              {t("table.columns.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <React.Fragment key={request.id}>
              <TableRow className="cursor-pointer hover:bg-muted/50">
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
                <TableCell>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">
                      {request.requester_username}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(request.created_at), "MMM dd, yyyy HH:mm")}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {t("table.status.pending")}
                  </Badge>
                </TableCell>
              </TableRow>

              {/* Expanded Row */}
              {expandedRow === request.id && (
                <TableRow>
                  <TableCell colSpan={7} className="bg-muted/30">
                    <div className="py-4 space-y-4">
                      {/* Changes */}
                      {renderChanges(request)}

                      {/* Admin Note Input */}
                      <div className="space-y-2">
                        <Label htmlFor={`note-${request.id}`}>
                          {t("admin.adminNote.label")}
                        </Label>
                        <Textarea
                          id={`note-${request.id}`}
                          placeholder={t("admin.adminNote.placeholder")}
                          value={adminNote}
                          onChange={(e) => setAdminNote(e.target.value)}
                          rows={3}
                          disabled={processingId === request.id}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          onClick={() => handleReject(request.id)}
                          disabled={processingId === request.id}
                        >
                          {processingId === request.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-2" />
                          )}
                          {t("admin.actions.reject")}
                        </Button>
                        <Button
                          onClick={() => handleApprove(request.id)}
                          disabled={processingId === request.id}
                        >
                          {processingId === request.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          {t("admin.actions.approve")}
                        </Button>
                      </div>
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
