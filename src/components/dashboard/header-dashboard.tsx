import DashboardCard from "./dash-board-card";
import ScanDialog from "./scan-dialog/scan-dialog";

import { Button } from "../ui/button";
import {
  Download,
  Play,
  Server,
  Shield,
  AlertTriangle,
  Clock,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDashboard } from "@/hooks/dashboard/use-dashboard";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import ScheduleDialog from "./scheduler-dialog";
import { ExportDialog } from "./export-dialog";

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

  const dashboardData = useMemo(() => {
    const data = [
      {
        title: t("header.cards.totalServers.title"),
        value: loading ? "..." : stats.total_nodes.toString(),
        subtitle: t("header.cards.totalServers.subtitle"),
        icon: <Server className="h-4 w-4" />,
        variant: "default" as const,
        isLoading: loading,
      },
      {
        title: t("header.cards.overallAssessment.title"),
        value: loading ? "..." : `${stats.compliance_rate}%`,
        subtitle: t("header.cards.overallAssessment.subtitle"),
        icon: <Shield className="h-4 w-4" />,
        variant: "success" as const,
        isLoading: loading,
      },
      {
        title: t("header.cards.issues.title"),
        value: loading ? "..." : stats.critical_issues.toString(),
        subtitle: t("header.cards.issues.subtitle"),
        icon: <AlertTriangle className="h-4 w-4" />,
        variant: "warning" as const,
        isLoading: loading,
      },
      {
        title: t("header.cards.lastScan.title"),
        value: loading
          ? "..."
          : stats.last_audit || t("header.cards.lastScan.value.never"),
        subtitle: stats.last_audit
          ? t("header.cards.lastScan.subtitle.completed")
          : t("header.cards.lastScan.subtitle.never"),
        icon: <Clock className="h-4 w-4" />,
        variant: "info" as const,
        isLoading: loading,
      },
    ];

    return data;
  }, [stats, loading, t]);

  const handleExport = () => {
    // Mở dialog xuất báo cáo thay vì toast
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
    toast.error(t("messages.dashboardLoadError", { error }));
  }

  return (
    <div className="p-6 space-y-6 bg-background">
      {/* Header and action buttons */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground mt-2 italic">{t("subtitle")}</p>
        </div>

        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          {/* Nút đặt lịch */}
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

          {/* Nút xuất báo cáo - Cập nhật để mở dialog */}
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

      {/* Dashboard cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardData.map((card, index) => (
          <DashboardCard
            key={index}
            title={card.title}
            value={card.value}
            subtitle={card.subtitle}
            icon={card.icon}
            variant={card.variant}
            isLoading={card.isLoading}
          />
        ))}
      </div>

      {/* Scan Dialog */}
      <ScanDialog
        open={scanDialogOpen}
        onOpenChange={setScanDialogOpen}
        onScanComplete={handleScanComplete}
        handleRefresh={handleRefresh}
      />

      {/* Schedule Dialog */}
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
