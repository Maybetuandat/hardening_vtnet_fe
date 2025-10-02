// src/components/dashboard/header-dashboard.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, Play, RefreshCw, Calendar } from "lucide-react";

import { Button } from "../ui/button";
import { useDashboard } from "@/hooks/dashboard/use-dashboard";
import toastHelper from "@/utils/toast-helper";

import ScanDialog from "./scan-dialog/scan-dialog";
import ScheduleDialog from "./scheduler-dialog";
import { ExportDialog } from "./export-dialog";
import { PieChart } from "./charts/pie-chart";
import { StackedBarChart } from "./charts/stacked-bar-chart";

interface HeaderDashBoardProps {
  onRefreshCompliance?: () => Promise<void>;
}

export default function HeaderDashBoard({
  onRefreshCompliance,
}: HeaderDashBoardProps) {
  const { t } = useTranslation("dashboard");
  const { stats, loading, error, refreshData } = useDashboard();

  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const handleExport = () => {
    setExportDialogOpen(true);
  };

  const handleRunAudit = () => {
    setScanDialogOpen(true);
  };

  const handleSchedule = () => {
    setScheduleDialogOpen(true);
  };

  const handleRefresh = async () => {
    await refreshData(onRefreshCompliance);
  };

  const handleScanComplete = async () => {
    await refreshData(onRefreshCompliance);
  };

  if (error) {
    toastHelper.error(t("messages.dashboardLoadError", { error }));
  }

  return (
    <div className="p-6 space-y-6 bg-background">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground mt-2 italic">{t("subtitle")}</p>
        </div>

        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button
            variant="outline"
            className="flex items-center space-x-2 border-blue-200 text-blue-700 hover:bg-blue-50"
            onClick={handleSchedule}
          >
            <Calendar className="h-4 w-4" />
            <span>{t("header.actions.schedule")}</span>
          </Button>

          <Button
            variant="outline"
            className="flex items-center space-x-2"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>{t("header.actions.refresh")}</span>
          </Button>

          <Button
            variant="outline"
            className="flex items-center space-x-2"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" />
            <span>{t("header.actions.export")}</span>
          </Button>

          <Button
            className="flex items-center space-x-2 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleRunAudit}
          >
            <Play className="h-4 w-4" />
            <span>{t("header.actions.run")}</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        <div className="md:col-span-2 bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-6">
            Instance Status Overview
          </h3>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="flex justify-center items-center">
              <PieChart
                passCount={stats.passed_servers}
                failCount={stats.failed_servers}
              />
            </div>
          )}
        </div>

        <div className="md:col-span-3 bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-6">Instances by Workload</h3>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <StackedBarChart data={stats.workload_stats} />
          )}
        </div>
      </div>

      <ScanDialog
        open={scanDialogOpen}
        onOpenChange={setScanDialogOpen}
        onScanComplete={handleScanComplete}
        handleRefresh={handleRefresh}
      />

      <ScheduleDialog
        isOpen={scheduleDialogOpen}
        onClose={() => setScheduleDialogOpen(false)}
      />

      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
      />
    </div>
  );
}
