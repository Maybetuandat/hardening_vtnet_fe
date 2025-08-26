import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ComplianceResultDetail } from "@/types/compliance";
import {
  Server,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
} from "lucide-react";

interface ComplianceDetailInfoProps {
  compliance: ComplianceResultDetail;
  loading?: boolean;
}

export function ComplianceDetailInfo({
  compliance,
  loading = false,
}: ComplianceDetailInfoProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: {
        label: "Hoàn thành",
        className: "bg-green-100 text-green-800",
        icon: CheckCircle,
      },
      running: {
        label: "Đang chạy",
        className: "bg-blue-100 text-blue-800",
        icon: Clock,
      },
      pending: {
        label: "Chờ xử lý",
        className: "bg-yellow-100 text-yellow-800",
        icon: Clock,
      },
      failed: {
        label: "Thất bại",
        className: "bg-red-100 text-red-800",
        icon: XCircle,
      },
      cancelled: {
        label: "Đã hủy",
        className: "bg-gray-100 text-gray-800",
        icon: XCircle,
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <Badge
        variant="secondary"
        className={`${config.className} flex items-center gap-1`}
      >
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getScoreBadge = (score: number) => {
    let colorClass = "bg-gray-100 text-gray-800";
    if (score >= 90) colorClass = "bg-green-100 text-green-800";
    else if (score >= 70) colorClass = "bg-yellow-100 text-yellow-800";
    else if (score >= 50) colorClass = "bg-orange-100 text-orange-800";
    else colorClass = "bg-red-100 text-red-800";

    return (
      <Badge variant="secondary" className={`${colorClass} text-lg px-3 py-1`}>
        {score.toFixed(1)}%
      </Badge>
    );
  };

  const formatDate = (dateString?: string) => {
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

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Compliance Result - {compliance.server_ip}
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                ID: {compliance.id} | Server ID: {compliance.server_id}
              </p>
            </div>
            <div className="text-right">
              {getStatusBadge(compliance.status)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Score */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <BarChart3 className="h-5 w-5 text-muted-foreground mr-2" />
                <span className="font-medium">Điểm số</span>
              </div>
              {getScoreBadge(compliance.score)}
            </div>

            {/* Total Rules */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <span className="font-medium">Tổng Rules</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {compliance.total_rules}
              </div>
            </div>

            {/* Passed Rules */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-medium">Đạt</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {compliance.passed_rules}
              </div>
            </div>

            {/* Failed Rules */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <XCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="font-medium">Lỗi</span>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {compliance.failed_rules}
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Ngày scan:</span>
              <span>{formatDate(compliance.scan_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Tạo lúc:</span>
              <span>{formatDate(compliance.created_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Cập nhật:</span>
              <span>{formatDate(compliance.updated_at)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
