import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Server } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { RulesSection } from "@/components/work-loads/workload-detail/rule/rule-session";
import { WorkloadInfoSection } from "@/components/work-loads/workload-detail/workload-info-section";
import { WorkloadInstancesSection } from "@/components/work-loads/workload-detail/instance/workload-instances-section";
import { useWorkloads } from "@/hooks/workload/use-workloads";
import { WorkloadResponse } from "@/types/workload";
import toastHelper from "@/utils/toast-helper";

export const WorkloadDetailPage: React.FC = () => {
  const { t } = useTranslation("workload");
  const { workloadId } = useParams<{ workloadId: string }>();
  const navigate = useNavigate();
  const [selectedRuleId, setSelectedRuleId] = useState<number | null>(null);
  const [workload, setWorkload] = useState<WorkloadResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("rules");
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
        setError(t("workloadDetail.errors.notFound"));
      }
    } catch (err: any) {
      console.error("Error fetching workload detail:", err);
      setError(err.message || t("workloadDetail.errors.loadError"));
      toastHelper.error(t("workloadDetail.messages.loadError"));
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
      toastHelper.error(t("workloadDetail.errors.invalidId"));
      navigate("/workloads");
      return;
    }

    fetchWorkloadDetail(id);
    hasInitialized.current = true;
  }, [workloadId, navigate, getWorkloadById, t]);

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
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">
            {t("workloadDetail.title")}
          </h1>
        </div>
        <div className="text-center py-12">
          <p className="text-destructive">
            {error || t("workloadDetail.errors.notFound")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">
              {t("workloadDetail.title")}
            </h1>
            <p className="text-sm text-muted-foreground">{workload.name}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Workload Info Section */}
      <WorkloadInfoSection
        workload={workload}
        onUpdate={handleUpdateWorkload}
      />

      <Separator />

      {/* Tabs for Rules and Instances */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="rules"
            className="flex items-center justify-center gap-2"
          >
            <Shield className="h-4 w-4" />
            {t("workloadDetail.tabs.rules")}
          </TabsTrigger>
          <TabsTrigger
            value="instances"
            className="flex items-center justify-center gap-2"
          >
            <Server className="h-4 w-4" />
            {t("workloadDetail.tabs.instances")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <RulesSection
            workloadId={workload.id}
            selectedRuleId={selectedRuleId}
            onRuleSelect={setSelectedRuleId}
          />
        </TabsContent>

        <TabsContent value="instances" className="space-y-4">
          <WorkloadInstancesSection workloadId={workload.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
