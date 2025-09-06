import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

import { RulesSection } from "@/components/work-loads/workload-detail/rule/rule-session";
import { WorkloadInfoSection } from "@/components/work-loads/workload-detail/workload-info-section";
import { useWorkloads } from "@/hooks/workload/use-workloads";
import { WorkloadResponse } from "@/types/workload";

export const WorkloadDetailPage: React.FC = () => {
  const { workloadId } = useParams<{ workloadId: string }>();
  const navigate = useNavigate();
  const [selectedRuleId, setSelectedRuleId] = useState<number | null>(null);
  const [workload, setWorkload] = useState<WorkloadResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  const { getWorkloadById } = useWorkloads();

  // Fetch workload detail function
  const fetchWorkloadDetail = async (id: number) => {
    try {
      setLoading(true);
      setError(null);

      const workloadData = await getWorkloadById(id);
      if (workloadData) {
        setWorkload(workloadData);
      } else {
        setError("Không tìm thấy workload");
      }
    } catch (err: any) {
      console.error("Error fetching workload detail:", err);
      setError(err.message || "Có lỗi xảy ra khi tải thông tin workload");
      toast.error("Không thể tải thông tin workload");
    } finally {
      setLoading(false);
    }
  };

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
  }, [workloadId, navigate, getWorkloadById]);

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
        <div className="space-y-6">
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
          <div className="h-96 bg-muted animate-pulse rounded-lg" />
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
        </div>
      </div>

      <Separator />

      <div className="space-y-6">
        <WorkloadInfoSection
          workload={workload}
          onUpdate={handleUpdateWorkload}
        />

        <RulesSection
          workloadId={workload.id}
          onRuleSelect={setSelectedRuleId}
          selectedRuleId={selectedRuleId}
        />
      </div>
    </div>
  );
};
