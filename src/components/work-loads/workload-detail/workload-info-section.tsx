import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Edit,
  Calendar,
  FileText,
  Settings,
  Clock,
  Monitor,
} from "lucide-react";
import { EditWorkloadDialog } from "./edit-workload-dialog";

import type { WorkloadResponse } from "@/types/workload";

interface WorkloadInfoSectionProps {
  workload: WorkloadResponse;
  onUpdate: () => void;
}

export const WorkloadInfoSection: React.FC<WorkloadInfoSectionProps> = ({
  workload,
  onUpdate,
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    onUpdate();
  };

  return (
    <>
      <Card className="h-fit">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Thông tin Workload</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
              className="h-8"
            >
              <Edit className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Settings className="h-5 w-5 text-muted-foreground mt-1" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Tên</p>
                <p className="text-lg font-semibold break-words">
                  {workload.name}
                </p>
              </div>
            </div>

            {/* OS Version */}
            <div className="flex items-start space-x-3">
              <Monitor className="h-5 w-5 text-muted-foreground mt-1" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Hệ điều hành
                </p>
                <p className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md inline-block">
                  {workload.os_version}
                </p>
              </div>
            </div>

            {workload.description && (
              <div className="flex items-start space-x-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Mô tả
                  </p>
                  <p className="text-sm leading-relaxed break-words">
                    {workload.description}
                  </p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Timestamps - Horizontal Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">
                  Ngày tạo
                </p>
                <p className="text-sm truncate">
                  {formatDateTime(workload.created_at)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">
                  Cập nhật lần cuối
                </p>
                <p className="text-sm truncate">
                  {formatDateTime(workload.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <EditWorkloadDialog
        workload={workload}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={handleEditSuccess}
      />
    </>
  );
};
