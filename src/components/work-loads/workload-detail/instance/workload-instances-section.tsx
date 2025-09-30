import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Server, Loader2, AlertTriangle, Plus } from "lucide-react";
import { Instance } from "@/types/instance";
import { useWorkloadInstances } from "@/hooks/workload/use-workload-instances";
import { InstanceList } from "@/components/instances/index/instance-list";
import { AssignInstancesDialog } from "./assign-instances-dialog";

interface WorkloadInstancesSectionProps {
  workloadId: number;
}

export const WorkloadInstancesSection: React.FC<
  WorkloadInstancesSectionProps
> = ({ workloadId }) => {
  const { t } = useTranslation("workload");
  const { instances, loading, error, fetchInstancesByWorkload } =
    useWorkloadInstances();
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  useEffect(() => {
    if (workloadId) {
      fetchInstancesByWorkload(workloadId);
    }
  }, [workloadId, fetchInstancesByWorkload]);

  const handleAssignSuccess = () => {
    fetchInstancesByWorkload(workloadId);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {t("workloadDetail.instances.loading")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-destructive">
            <AlertTriangle className="h-8 w-8 mb-4" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!instances || instances.length === 0) {
    return (
      <>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                {t("workloadDetail.instances.title")}
              </CardTitle>
              <Button
                onClick={() => setAssignDialogOpen(true)}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {t("workloadDetail.instances.assign.button")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Server className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                {t("workloadDetail.instances.empty.noInstances")}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t("workloadDetail.instances.empty.description")}
              </p>
              <Button
                onClick={() => setAssignDialogOpen(true)}
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("workloadDetail.instances.assign.button")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <AssignInstancesDialog
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          workloadId={workloadId}
          onSuccess={handleAssignSuccess}
        />
      </>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              {t("workloadDetail.instances.title")}
            </CardTitle>
            <Button
              onClick={() => setAssignDialogOpen(true)}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {t("workloadDetail.instances.assign.button")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <InstanceList instances={instances} loading={false} error={null} />
        </CardContent>
      </Card>

      <AssignInstancesDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        workloadId={workloadId}
        onSuccess={handleAssignSuccess}
      />
    </>
  );
};
