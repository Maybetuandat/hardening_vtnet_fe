// src/components/work-loads/workload-header.tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card>
      <CardHeader>
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Boxes className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">
                {t("workloads.title")}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {t("workloads.subtitle")}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              <span>{t("workloads.refresh")}</span>
            </Button>

            <Button
              onClick={handleAddWorkload}
              size="sm"
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>{t("workloads.addWorkload")}</span>
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
