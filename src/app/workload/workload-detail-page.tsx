import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { useWorkloadDetail } from "@/hooks/workload/use-workload-detail";
import { toast } from "sonner";
import { CommandsSection } from "@/components/work-loads/workload-detail/command-session";
import { RulesSection } from "@/components/work-loads/workload-detail/rule-session";
import { WorkloadInfoSection } from "@/components/work-loads/workload-detail/workload-info-section";

export const WorkloadDetailPage: React.FC = () => {
  const { workloadId } = useParams<{ workloadId: string }>();
  const navigate = useNavigate();
  const [selectedRuleId, setSelectedRuleId] = useState<number | null>(null);
  const hasInitialized = useRef(false);

  const { workload, loading, error, fetchWorkloadDetail } = useWorkloadDetail();

  useEffect(() => {
    if (hasInitialized.current) return;

    if (!workloadId) {
      navigate("/workloads");
      return;
    }

    const id = Number(workloadId);
    if (isNaN(id) || id <= 0) {
      toast.error("ID workload không hợp lệ");
      navigate("/workloads");
      return;
    }

    fetchWorkloadDetail(id);
    hasInitialized.current = true;
  }, []);

  const handleBack = () => {
    navigate("/workloads");
  };

  const handleUpdateWorkload = () => {
    if (workload?.id) {
      fetchWorkloadDetail(workload.id);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 bg-muted animate-pulse rounded" />
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="h-64 bg-muted animate-pulse rounded-lg" />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="h-96 bg-muted animate-pulse rounded-lg" />
            <div className="h-64 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !workload) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">
            Không tìm thấy workload
          </h2>
          <p className="text-muted-foreground mb-4">
            {error ||
              "Workload bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."}
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{workload.name}</h1>
            <p className="text-muted-foreground">
              Chi tiết workload và các thành phần liên quan
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <WorkloadInfoSection
            workload={workload}
            onUpdate={handleUpdateWorkload}
          />
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Rules Section */}
          <RulesSection
            workloadId={workload.id}
            onRuleSelect={setSelectedRuleId}
            selectedRuleId={selectedRuleId}
          />

          {selectedRuleId && <CommandsSection ruleId={selectedRuleId} />}
        </div>
      </div>
    </div>
  );
};
