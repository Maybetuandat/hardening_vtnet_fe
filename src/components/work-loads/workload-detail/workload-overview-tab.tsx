// File: src/components/work-loads/workload-detail/workload-overview-tab.tsx

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, User, CheckCircle, Edit } from "lucide-react";
import { WorkloadDetail } from "@/types/workload-detail";
import { getWorkloadTypeLabel, formatDate } from "@/utils/workload-utils";

interface WorkloadOverviewTabProps {
  workload: WorkloadDetail;
  onEditBasicInfo?: () => void;
  onEditMetadata?: () => void;
}

export const WorkloadOverviewTab: React.FC<WorkloadOverviewTabProps> = ({
  workload,
  onEditBasicInfo,
  onEditMetadata,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Basic Information</CardTitle>
            {onEditBasicInfo && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEditBasicInfo}
                className="flex items-center space-x-2"
              >
                <Edit className="h-3 w-3" />
                <span>Edit</span>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                {workload.name}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Display Name
              </p>
              <p className="text-sm">{workload.display_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Type</p>
              <Badge variant="outline">
                {getWorkloadTypeLabel(workload.workload_type)}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Status
              </p>
              <Badge variant={workload.is_active ? "default" : "secondary"}>
                {workload.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Description
            </p>
            <p className="text-sm mt-1">{workload.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Metadata</CardTitle>
            {onEditMetadata && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEditMetadata}
                className="flex items-center space-x-2"
              >
                <Edit className="h-3 w-3" />
                <span>Edit</span>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Created by</p>
                <p className="text-sm text-muted-foreground">
                  {workload.created_by}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Created at</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(workload.created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Last updated</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(workload.updated_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Compliance Standard</p>
                <Badge variant="outline">{workload.compliance_standard}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
