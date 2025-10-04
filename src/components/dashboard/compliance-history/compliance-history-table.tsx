import React, { useCallback } from "react";
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
import { Card } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { ComplianceResult } from "@/types/compliance";
import { Loader2, AlertTriangle, RefreshCw, Copy, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toastHelper from "@/utils/toast-helper";

interface ComplianceTableProps {
  complianceResults: ComplianceResult[];
  loading: boolean;
  error: string | null;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onViewDetail: (compliance: ComplianceResult) => void;
  onRefresh: () => void;
}

export function ComplianceHistoryTable({
  complianceResults,
  loading,
  error,
  totalItems,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onRefresh,
}: ComplianceTableProps) {
  const navigate = useNavigate();
  const [copiedIP, setCopiedIP] = React.useState<string | null>(null);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatScore = (score: number) => {
    let colorClass = "bg-gray-100 text-gray-800";
    if (score >= 90) colorClass = "bg-green-100 text-green-800";
    else if (score >= 70) colorClass = "bg-yellow-100 text-yellow-800";
    else if (score >= 50) colorClass = "bg-orange-100 text-orange-800";
    else colorClass = "bg-red-100 text-red-800";

    return (
      <Badge variant="secondary" className={colorClass}>
        {score.toFixed(1)}%
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: {
        label: "Completed",
        variant: "default" as const,
        className: "bg-green-100 text-green-800",
      },
      running: {
        label: "Running",
        variant: "secondary" as const,
        className: "bg-blue-100 text-blue-800",
      },
      pending: {
        label: "Pending",
        variant: "secondary" as const,
        className: "bg-yellow-100 text-yellow-800",
      },
      failed: {
        label: "Failed",
        variant: "destructive" as const,
        className: "bg-red-100 text-red-800",
      },
      cancelled: {
        label: "Cancelled",
        variant: "secondary" as const,
        className: "bg-gray-100 text-gray-800",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const handleRowClick = (
    compliance: ComplianceResult,
    event: React.MouseEvent
  ) => {
    // Prevent navigation if clicking on action buttons
    const target = event.target as HTMLElement;
    if (target.closest("button") || target.closest('[role="button"]')) {
      return;
    }

    navigate(`/compliance/${compliance.id}`);
  };

  // Handle copy IP address
  const handleCopyIP = async (ipAddress: string) => {
    try {
      await navigator.clipboard.writeText(ipAddress);
      setCopiedIP(ipAddress);
      toastHelper.success("IP address copied!");

      // Reset copy state after 2 seconds
      setTimeout(() => {
        setCopiedIP(null);
      }, 2000);
    } catch (error) {
      toastHelper.error("Failed to copy IP address!");
      console.error("Copy failed:", error);
    }
  };

  return (
    <Card>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Loading compliance results...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="ml-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      ) : !complianceResults || complianceResults.length === 0 ? (
        <div className="p-12 text-center">
          <div className="text-muted-foreground">
            <p className="text-lg font-medium mb-2">No compliance results</p>
            <p className="text-sm">
              No scan results found. Please run a scan to view results.
            </p>
          </div>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">No.</TableHead>
                <TableHead>Server IP</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Workload</TableHead>
                <TableHead className="text-right">Total rules</TableHead>
                <TableHead className="text-right">Passed</TableHead>
                <TableHead className="text-right">Failed</TableHead>
                <TableHead className="text-center">Score</TableHead>
                <TableHead className="text-center">Scan date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complianceResults.map((compliance, index) => (
                <TableRow
                  key={compliance.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={(event) => handleRowClick(compliance, event)}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {(currentPage - 1) * pageSize + index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className="font-medium">
                          {compliance.instance_ip}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-muted"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyIP(compliance.instance_ip || "");
                          }}
                          title="Copy IP address"
                        >
                          {copiedIP === compliance.instance_ip ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(compliance.status)}</TableCell>
                  <TableCell className="text-center ">
                    {compliance.workload_name || "-"}
                  </TableCell>
                  <TableCell className="text-right ">
                    {compliance.total_rules}
                  </TableCell>
                  <TableCell className="text-right  text-green-600">
                    {compliance.passed_rules}
                  </TableCell>
                  <TableCell className="text-right  text-red-600">
                    {compliance.failed_rules}
                  </TableCell>
                  <TableCell className="text-center">
                    {formatScore(compliance.score)}
                  </TableCell>
                  <TableCell>
                    <div className="text-center ">
                      {formatDate(compliance.scan_date)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalItems}
            pageSize={pageSize}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            loading={loading}
            showInfo={true}
            showPageSizeSelector={true}
            className="px-6 py-4"
          />
        </>
      )}
    </Card>
  );
}
