// src/components/work-loads/workload-detail/rule/rule-change-requests-dialog.tsx

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  FileEdit,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";

import { format } from "date-fns";
import {
  RuleChangeRequestResponse,
  useRuleChangeRequests,
} from "@/hooks/rule/use-rule-change-request";

interface RuleChangeRequestsDialogProps {
  workloadId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestProcessed?: () => void;
}

export const RuleChangeRequestsDialog: React.FC<
  RuleChangeRequestsDialogProps
> = ({ workloadId, open, onOpenChange, onRequestProcessed }) => {
  const {
    requests,
    loading,
    fetchWorkloadRequests,
    approveRequest,
    rejectRequest,
  } = useRuleChangeRequests();

  const [expandedRequest, setExpandedRequest] = useState<number | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [adminNote, setAdminNote] = useState<string>("");

  useEffect(() => {
    if (open) {
      fetchWorkloadRequests(workloadId, "pending");
    }
  }, [open, workloadId, fetchWorkloadRequests]);

  const handleApprove = async (requestId: number) => {
    try {
      setProcessingId(requestId);
      await approveRequest(requestId, adminNote || undefined);
      setAdminNote("");
      setExpandedRequest(null);
      if (onRequestProcessed) {
        onRequestProcessed();
      }
    } catch (error) {
      // Error handled in hook
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      setProcessingId(requestId);
      await rejectRequest(requestId, adminNote || undefined);
      setAdminNote("");
      setExpandedRequest(null);
      if (onRequestProcessed) {
        onRequestProcessed();
      }
    } catch (error) {
      // Error handled in hook
    } finally {
      setProcessingId(null);
    }
  };

  const toggleExpand = (requestId: number) => {
    setExpandedRequest(expandedRequest === requestId ? null : requestId);
    setAdminNote("");
  };

  const renderChanges = (request: RuleChangeRequestResponse) => {
    const { old_value, new_value } = request;

    if (request.request_type === "create") {
      return (
        <div className="space-y-2">
          <p className="text-sm font-medium">New Rule Data:</p>
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

    // Update request - show changes
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium">Changes:</p>
        {Object.entries(new_value).map(([key, newVal]) => {
          const oldVal = old_value?.[key];
          const hasChanged = JSON.stringify(oldVal) !== JSON.stringify(newVal);

          if (!hasChanged) return null;

          return (
            <div key={key} className="ml-4 space-y-1">
              <p className="text-sm font-medium">{key}:</p>
              <div className="ml-4 space-y-1">
                <div className="text-xs">
                  <span className="text-red-600">- Old:</span>{" "}
                  <span className="text-muted-foreground">
                    {typeof oldVal === "object"
                      ? JSON.stringify(oldVal)
                      : String(oldVal || "N/A")}
                  </span>
                </div>
                <div className="text-xs">
                  <span className="text-green-600">+ New:</span>{" "}
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileEdit className="h-5 w-5" />
            Pending Rule Change Requests
          </DialogTitle>
          <DialogDescription>
            Review and approve or reject rule change requests from users
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No pending requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request: RuleChangeRequestResponse) => (
                <Card key={request.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base flex items-center gap-2">
                          {request.request_type === "create" ? (
                            <Badge variant="default">Create</Badge>
                          ) : (
                            <Badge variant="secondary">Update</Badge>
                          )}
                          <span className="font-normal">
                            {request.rule_name || "New Rule"}
                          </span>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          {request.requester_username} •{" "}
                          {format(
                            new Date(request.created_at),
                            "MMM dd, yyyy HH:mm"
                          )}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(request.id)}
                      >
                        {expandedRequest === request.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>

                  {expandedRequest === request.id && (
                    <CardContent className="space-y-4">
                      {/* Show changes */}
                      <div className="rounded-lg bg-muted p-4">
                        {renderChanges(request)}
                      </div>

                      {/* Admin note input */}
                      <div className="space-y-2">
                        <Label htmlFor={`note-${request.id}`}>
                          Admin Note (Optional)
                        </Label>
                        <Textarea
                          id={`note-${request.id}`}
                          placeholder="Add a note for this decision..."
                          value={adminNote}
                          onChange={(e) => setAdminNote(e.target.value)}
                          rows={3}
                          disabled={processingId === request.id}
                        />
                      </div>

                      {/* Action buttons */}
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
                          Reject
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
                          Approve
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
