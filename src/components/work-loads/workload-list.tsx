import { Workload } from "@/types/workload";
import { Loader2, AlertTriangle, Boxes } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import WorkloadCard from "./workload-card";
import { useTranslation } from "react-i18next";

interface WorkloadListProps {
  workloads: Workload[];
  loading: boolean;
  error: string | null;
  onEdit: (workload: Workload) => void;
  onDelete: (workload: Workload) => void;
  onView: (workload: Workload) => void;
  onDeploy: (workload: Workload) => void;
  onRetry?: () => void;
  getNumberOfServersByWorkload: (workloadId: number) => Promise<number>;
}

export function WorkloadList({
  workloads,
  loading,
  error,
  onEdit,
  onDelete,
  onView,
  onDeploy,
  onRetry,
  getNumberOfServersByWorkload,
}: WorkloadListProps) {
  const { t } = useTranslation("workload");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">{t("workloads.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="ml-4"
            >
              {t("common.retry")}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (!workloads || workloads.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <Boxes className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">
          {t("workloads.empty.noWorkloads")}
        </h3>
        <p className="text-muted-foreground mb-4">
          {t("workloads.empty.addFirst")}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {workloads.map((workload) => (
        <WorkloadCard
          key={workload.id}
          workload={workload}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
          onDeploy={onDeploy}
          getNumberOfServersByWorkload={getNumberOfServersByWorkload}
        />
      ))}
    </div>
  );
}
