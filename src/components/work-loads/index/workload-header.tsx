import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Boxes } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface WorkloadHeaderProps {
  onRefresh: () => void;
  onAddWorkload: () => void;
  loading?: boolean;
}

export default function WorkloadHeader({
  onRefresh,
  onAddWorkload,
  loading = false,
}: WorkloadHeaderProps) {
  const { t } = useTranslation("workload");
  const navigate = useNavigate();

  const handleAddWorkload = () => {
    navigate("/workload/add");
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Boxes className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {t("workloads.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("workloads.subtitle")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            <span>{t("workloads.refresh")}</span>
          </Button>

          <Button
            onClick={handleAddWorkload}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>{t("workloads.addWorkload")}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
