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
import { RuleChangeRequestsDialog } from "@/components/work-loads/workload-detail/rule/rule-change-requests-dialog";
import { useWorkloads } from "@/hooks/workload/use-workloads";
import { usePermissions } from "@/hooks/authentication/use-permissions";
import { WorkloadResponse } from "@/types/workload";
import toastHelper from "@/utils/toast-helper";

export const WorkloadDetailPage: React.FC = () => {
  const { t } = useTranslation("workload");
  const { workloadId } = useParams<{ workloadId: string }>();
  const navigate = useNavigate();
  const { isAdmin } = usePermissions();

  const [selectedRuleId, setSelectedRuleId] = useState<number | null>(null);
  const [workload, setWorkload] = useState<WorkloadResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("rules");
  const [requestsDialogOpen, setRequestsDialogOpen] = useState(false);
  const hasInitialized = useRef(false);
  const rulesSectionRef = useRef<{ refreshRules: () => void }>(null);

  const { getWorkloadById } = useWorkloads();

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
      console.error("Error fetching workload:", err);
      setError(err.message || t("workloadDetail.errors.loadFailed"));
      toastHelper.error(err.message || t("workloadDetail.errors.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasInitialized.current && workloadId) {
      hasInitialized.current = true;
      const id = parseInt(workloadId);
      if (!isNaN(id)) {
        fetchWorkloadDetail(id);
      } else {
        setError(t("workloadDetail.errors.invalidId"));
        setLoading(false);
      }
    }
  }, [workloadId]);

  const handleBack = () => {
    navigate("/workloads");
  };

  const handleUpdateWorkload = async (updatedWorkload: WorkloadResponse) => {
    setWorkload(updatedWorkload);
    toastHelper.success(t("workloadDetail.messages.updateSuccess"));
  };

  const handleRequestProcessed = () => {
    // Refresh rules list when a request is approved/rejected
    if (rulesSectionRef.current?.refreshRules) {
      rulesSectionRef.current.refreshRules();
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground">
              {t("workloadDetail.loading")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !workload) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">
              {t("workloadDetail.title")}
            </h1>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-destructive">
              {error || t("workloadDetail.errors.notFound")}
            </p>
            <Button onClick={handleBack} className="mt-4">
              {t("workloadDetail.actions.backToList")}
            </Button>
          </div>
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
            ref={rulesSectionRef}
            workloadId={workload.id}
            selectedRuleId={selectedRuleId}
            onRuleSelect={setSelectedRuleId}
            onOpenRequests={() => setRequestsDialogOpen(true)}
            showRequestsButton={isAdmin()}
          />
        </TabsContent>

        <TabsContent value="instances" className="space-y-4">
          <WorkloadInstancesSection
            workloadId={workload.id}
            os_id={workload.os_id}
          />
        </TabsContent>
      </Tabs>

      {/* Rule Change Requests Dialog */}
      {isAdmin() && (
        <RuleChangeRequestsDialog
          workloadId={workload.id}
          open={requestsDialogOpen}
          onOpenChange={setRequestsDialogOpen}
          onRequestProcessed={handleRequestProcessed}
        />
      )}
    </div>
  );
};
