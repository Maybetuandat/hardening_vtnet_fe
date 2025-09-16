import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  ArrowRight,
  AlertCircle,
  Package,
  Monitor,
} from "lucide-react";

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
  const { t } = useTranslation("server");
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
    <div className="flex flex-col h-full">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mb-4">
          <Package className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {t("workloadSelector.title")}
        </h2>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center">
        <Card className="border-2 border-gray-200 hover:border-blue-300 transition-colors duration-200">
          <CardContent className="p-8">
            {/* Workload Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <label className="text-lg font-semibold text-gray-900">
                  {t("workloadSelector.label")}:
                </label>
              </div>

              <Select
                value={selectedWorkloadId}
                onValueChange={handleWorkloadChange}
                disabled={loading}
              >
                <SelectTrigger className="h-14 text-left bg-gray-50 hover:bg-gray-100 border-2 transition-colors duration-200">
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      <span className="text-gray-600">
                        {t("workloadSelector.loading")}
                      </span>
                    </div>
                  ) : (
                    <SelectValue
                      placeholder={
                        t("workloadSelector.placeholder") ||
                        "Select a workload configuration..."
                      }
                    />
                  )}
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {workloads.map((workload) => (
                    <SelectItem
                      key={workload.id}
                      value={workload.id?.toString() || ""}
                      className="h-auto py-4"
                    >
                      <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-600" />
                          <span className="font-semibold text-gray-900">
                            {workload.name}
                          </span>
                        </div>
                        {workload.os_version && (
                          <div className="flex items-center gap-2 ml-6">
                            <Monitor className="h-3 w-3 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {workload.os_version}
                            </span>
                          </div>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1 h-12 text-base font-medium hover:bg-gray-100"
          disabled={loading}
        >
          {t("workloadSelector.buttons.cancel")}
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!selectedWorkload || loading}
          className="flex-1 h-12 text-base font-medium  shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {t("workloadSelector.buttons.continue")}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
