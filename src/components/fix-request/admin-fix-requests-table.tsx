// src/components/fix-request/admin-fix-requests-table.tsx
import React, { useState } from "react";
import { format } from "date-fns";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Server,
  User,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { FixRequestResponse } from "@/types/fix-request";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface AdminFixRequestsTableProps {
  requests: FixRequestResponse[];
  loading: boolean;
  onApprove: (requestId: number, adminComment?: string) => void;
  onReject: (requestId: number, adminComment?: string) => void;
}

export const AdminFixRequestsTable: React.FC<AdminFixRequestsTableProps> = ({
  requests,
  loading,
  onApprove,
  onReject,
}) => {
  const [expandedRequest, setExpandedRequest] = useState<number | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<FixRequestResponse | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [adminComment, setAdminComment] = useState("");
  const [processing, setProcessing] = useState(false);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        bgClass: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock,
        label: "Pending",
      },
      approved: {
        bgClass: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
        label: "Approved",
      },
      rejected: {
        bgClass: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
        label: "Rejected",
      },
      executing: {
        bgClass: "bg-blue-100 text-blue-800 border-blue-200",
        icon: Loader2,
        label: "Executing",
      },
      completed: {
        bgClass: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
        label: "Completed",
      },
      failed: {
        bgClass: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
        label: "Failed",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge
        variant="outline"
        className={`${config.bgClass} flex items-center gap-1 w-fit`}
      >
        <Icon
          className={`h-3 w-3 ${status === "executing" ? "animate-spin" : ""}`}
        />
        {config.label}
      </Badge>
    );
  };

  const handleOpenActionDialog = (
    request: FixRequestResponse,
    type: "approve" | "reject"
  ) => {
    setSelectedRequest(request);
    setActionType(type);
    setAdminComment("");
    setActionDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedRequest) return;

    setProcessing(true);
    try {
      if (actionType === "approve") {
        await onApprove(selectedRequest.id, adminComment || undefined);
      } else {
        await onReject(selectedRequest.id, adminComment || undefined);
      }
      setActionDialogOpen(false);
      setSelectedRequest(null);
      setAdminComment("");
    } catch (error) {
      // Error handled in hook
    } finally {
      setProcessing(false);
    }
  };

  const toggleExpand = (requestId: number) => {
    setExpandedRequest(expandedRequest === requestId ? null : requestId);
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
      <div className="text-center py-12 text-muted-foreground">
        No fix requests found
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead className="w-[80px]">ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Instance</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="w-[180px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <React.Fragment key={request.id}>
              <TableRow>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpand(request.id)}
                    className="h-6 w-6 p-0"
                  >
                    {expandedRequest === request.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </TableCell>

                <TableCell className="font-medium">#{request.id}</TableCell>

                <TableCell>
                  <div className="font-medium">{request.title}</div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-sm">
                      {request.instance_id}
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{request.created_by}</span>
                  </div>
                </TableCell>

                <TableCell>{getStatusBadge(request.status)}</TableCell>

                <TableCell>
                  <div className="text-sm">
                    {format(new Date(request.created_at), "MMM dd, yyyy")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(request.created_at), "HH:mm")}
                  </div>
                </TableCell>

                <TableCell>
                  {request.status === "pending" ? (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() =>
                          handleOpenActionDialog(request, "approve")
                        }
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          handleOpenActionDialog(request, "reject")
                        }
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {request.status === "approved" && "Approved"}
                      {request.status === "rejected" && "Rejected"}
                      {request.status === "executing" && "Executing..."}
                      {request.status === "completed" && "Completed"}
                      {request.status === "failed" && "Failed"}
                    </span>
                  )}
                </TableCell>
              </TableRow>

              {/* Expanded Details */}
              {expandedRequest === request.id && (
                <TableRow>
                  <TableCell colSpan={8} className="bg-muted/50">
                    <div className="p-4 space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">
                          Description:
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {request.description}
                        </p>
                      </div>

                      {request.admin_comment && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2">
                            Admin Comment:
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {request.admin_comment}
                          </p>
                        </div>
                      )}

                      {request.error_message && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2 text-red-600">
                            Error:
                          </h4>
                          <p className="text-sm text-red-600">
                            {request.error_message}
                          </p>
                        </div>
                      )}

                      {request.execution_result && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2">
                            Execution Result:
                          </h4>
                          <pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
                            {JSON.stringify(request.execution_result, null, 2)}
                          </pre>
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

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve"
                ? "Approve Fix Request"
                : "Reject Fix Request"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "This will approve the fix request and execute the fix automatically."
                : "This will reject the fix request. Please provide a reason."}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-muted rounded-lg space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Request ID:</span> #
                  {selectedRequest.id}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Title:</span>{" "}
                  {selectedRequest.title}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Instance:</span>{" "}
                  {selectedRequest.instance_id}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Created by:</span>{" "}
                  {selectedRequest.created_by}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminComment">
                  Comment{" "}
                  {actionType === "reject" && (
                    <span className="text-red-500">*</span>
                  )}
                </Label>
                <Textarea
                  id="adminComment"
                  placeholder={
                    actionType === "approve"
                      ? "Optional comment..."
                      : "Provide reason for rejection..."
                  }
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialogOpen(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant={actionType === "approve" ? "default" : "destructive"}
              onClick={handleConfirmAction}
              disabled={
                processing || (actionType === "reject" && !adminComment.trim())
              }
            >
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {actionType === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
