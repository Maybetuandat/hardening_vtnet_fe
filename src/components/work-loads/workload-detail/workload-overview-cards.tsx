// File: src/components/work-loads/workload-detail/workload-overview-cards.tsx

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Server,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { WorkloadDetail } from "@/types/workload-detail";
import { formatDate } from "@/utils/workload-utils";

interface WorkloadOverviewCardsProps {
  workload: WorkloadDetail;
}

export const WorkloadOverviewCards: React.FC<WorkloadOverviewCardsProps> = ({
  workload,
}) => {
  const getScanStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getScanStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "error":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Servers Count */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Servers</CardTitle>
          <Server className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{workload.server_count}</div>
          <p className="text-xs text-muted-foreground">
            Active servers in workload
          </p>
        </CardContent>
      </Card>

      {/* Rules Count */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Security Rules</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{workload.rule_count}</div>
          <p className="text-xs text-muted-foreground">
            Configured security rules
          </p>
        </CardContent>
      </Card>

      {/* Last Scan */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Last Scan</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm font-bold">
            {formatDate(workload.last_scan)}
          </div>
          <p className="text-xs text-muted-foreground">
            Most recent security scan
          </p>
        </CardContent>
      </Card>

      {/* Scan Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Scan Status</CardTitle>
          {getScanStatusIcon(workload.scan_status)}
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Badge className={getScanStatusColor(workload.scan_status)}>
              {workload.scan_status.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Latest scan result
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
