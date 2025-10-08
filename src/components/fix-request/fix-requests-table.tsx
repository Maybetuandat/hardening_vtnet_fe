// src/components/fix-request/fix-requests-table.tsx
import React from "react";
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
import {
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Server,
} from "lucide-react";
import { FixRequestResponse } from "@/types/fix-request";

interface FixRequestsTableProps {
  requests: FixRequestResponse[];
  loading: boolean;
  onDelete: (requestId: number) => void;
}

export const FixRequestsTable: React.FC<FixRequestsTableProps> = ({
  requests,
  loading,
  onDelete,
}) => {
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">ID</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Instance</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Admin Comment</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow key={request.id}>
            <TableCell className="font-medium">#{request.id}</TableCell>

            <TableCell>
              <div>
                <div className="font-medium">{request.title}</div>
                <div className="text-sm text-muted-foreground line-clamp-1">
                  {request.description}
                </div>
              </div>
            </TableCell>

            <TableCell>
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-sm">{request.instance_id}</span>
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
              {request.admin_comment ? (
                <div className="text-sm text-muted-foreground line-clamp-2 max-w-xs">
                  {request.admin_comment}
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">-</span>
              )}
            </TableCell>

            <TableCell>
              <div className="flex items-center gap-2">
                {request.status === "pending" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(request.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
