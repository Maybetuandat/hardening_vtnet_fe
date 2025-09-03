import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Server,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Clock,
  Cpu,
} from "lucide-react";
import { ComplianceResultDetail } from "@/types/compliance";

interface ComplianceDetailInfoProps {
  compliance: ComplianceResultDetail | null;
  loading: boolean;
}

export function ComplianceDetailInfo({
  compliance,
  loading,
}: ComplianceDetailInfoProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: {
        variant: "success",
        label: "Hoàn thành",
        className: "bg-green-100 text-green-800 border-green-300",
      },
      failed: {
        variant: "destructive",
        label: "Thất bại",
        className: "bg-red-100 text-red-800 border-red-300",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: "secondary",
      label: status,
      className: "bg-gray-100 text-gray-600 border-gray-300",
    };

    return (
      <Badge variant={config.variant as any} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getScoreBadge = (score: number) => {
    let variant: "success" | "destructive" | "secondary" | "default" =
      "secondary";
    let className = "";

    if (score >= 80) {
      variant = "success";
      className = "bg-green-100 text-green-800 border-green-300";
    } else if (score >= 60) {
      variant = "default";
      className = "bg-yellow-100 text-yellow-800 border-yellow-300";
    } else {
      variant = "destructive";
      className = "bg-red-100 text-red-800 border-red-300";
    }

    return (
      <div className="text-center">
        <div
          className={`inline-flex items-center px-3 py-1 rounded-full border font-semibold ${className}`}
        >
          <BarChart3 className="h-4 w-4 mr-1" />
          {score.toFixed(1)}%
        </div>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!compliance) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Không tìm thấy thông tin compliance
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Compliance Result
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Server IP: {compliance.server_ip}
              </p>
              {compliance.server_hostname && (
                <p className="text-sm text-muted-foreground">
                  Hostname: {compliance.server_hostname}
                </p>
              )}
              {compliance.workload_name && (
                <p className="text-sm text-muted-foreground">
                  Workload: {compliance.workload_name}
                </p>
              )}
            </div>
            <div className="text-right">
              {getStatusBadge(compliance.status)}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Score */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <span className="font-medium text-muted-foreground">
                  Điểm số
                </span>
              </div>
              {getScoreBadge(compliance.score)}
            </div>

            {/* Total Rules */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Cpu className="h-4 w-4 text-muted-foreground mr-1" />
                <span className="font-medium text-muted-foreground">
                  Tổng Rules
                </span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {compliance.total_rules}
              </div>
            </div>

            {/* Passed Rules */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                <span className="font-medium text-muted-foreground">Đạt</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {compliance.passed_rules}
              </div>
            </div>

            {/* Failed Rules */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertCircle className="h-4 w-4 text-red-600 mr-1" />
                <span className="font-medium text-muted-foreground">Lỗi</span>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {compliance.failed_rules}
              </div>
            </div>

            {/* Scan Date */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                <span className="font-medium text-muted-foreground">
                  Scan Date
                </span>
              </div>
              <div className="text-sm font-medium">
                {formatDate(compliance.scan_date || compliance.created_at)}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Tiến độ hoàn thành</span>
              <span>{compliance.score.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  compliance.score >= 80
                    ? "bg-green-500"
                    : compliance.score >= 60
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{
                  width: `${Math.min(100, Math.max(0, compliance.score))}%`,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
