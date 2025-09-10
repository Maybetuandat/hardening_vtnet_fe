import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowRight, AlertCircle } from "lucide-react";

import { useWorkloads } from "@/hooks/workload/use-workloads";
import { WorkloadResponse } from "@/types/workload";

interface WorkloadSelectorProps {
  onWorkloadSelected: (workload: WorkloadResponse) => void;
  onCancel: () => void;
}

export const WorkloadSelector: React.FC<WorkloadSelectorProps> = ({
  onWorkloadSelected,
  onCancel,
}) => {
  const [selectedWorkloadId, setSelectedWorkloadId] = useState<string>("");
  const [selectedWorkload, setSelectedWorkload] =
    useState<WorkloadResponse | null>(null);

  const { workloads, loading, error, fetchWorkloads } = useWorkloads();

  // Load workloads khi component mount
  useEffect(() => {
    fetchWorkloads("", 1, 100); // Lấy tất cả workloads (không phân trang)
  }, [fetchWorkloads]);

  const handleWorkloadChange = (workloadId: string) => {
    setSelectedWorkloadId(workloadId);
    const workload = workloads.find((w) => w.id?.toString() === workloadId);
    setSelectedWorkload(workload || null);
  };

  const handleContinue = () => {
    if (selectedWorkload) {
      onWorkloadSelected(selectedWorkload);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Chọn Workload</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Workload áp dụng cho các server:
          </label>
          <Select
            value={selectedWorkloadId}
            onValueChange={handleWorkloadChange}
            disabled={loading}
          >
            <SelectTrigger>
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang tải...</span>
                </div>
              ) : (
                <SelectValue placeholder="Chọn workload..." />
              )}
            </SelectTrigger>
            <SelectContent>
              {workloads.map((workload) => (
                <SelectItem
                  key={workload.id}
                  value={workload.id?.toString() || ""}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{workload.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-between gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Hủy
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedWorkload || loading}
            className="flex-1"
          >
            Tiếp tục
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
