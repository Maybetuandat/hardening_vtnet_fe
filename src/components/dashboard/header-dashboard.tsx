import DashboardCard from "./dash-board-card";
import ScanDialog from "./scan-dialog";

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

interface HeaderDashBoardProps {
  onRefreshCompliance?: () => Promise<void>;
}

export default function HeaderDashBoard({
  onRefreshCompliance,
}: HeaderDashBoardProps) {
  const { t } = useTranslation("common");
  const { stats, loading, error, refreshData } = useDashboard();
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false); // Thêm state cho schedule dialog

  // Format dữ liệu cho dashboard cards
  const dashboardData = useMemo(() => {
    const data = [
      {
        title: "Tổng số server",
        value: loading ? "..." : stats.total_nodes.toString(),
        subtitle: "Số lượng server hoạt động",
        icon: <Server className="h-4 w-4" />,
        variant: "default" as const,
        isLoading: loading,
      },
      {
        title: "Đánh giá chung",
        value: loading ? "..." : `${stats.compliance_rate}%`,
        subtitle: "",
        icon: <Shield className="h-4 w-4" />,
        variant: "success" as const,
        isLoading: loading,
      },
      {
        title: "Vấn đề",
        value: loading ? "..." : stats.critical_issues.toString(),
        subtitle: "Số lượng tham số không tuân thủ",
        icon: <AlertTriangle className="h-4 w-4" />,
        variant: "warning" as const,
        isLoading: loading,
      },
      {
        title: "Quét lần cuối",
        value: loading ? "..." : stats.last_audit || "Chưa có lần quét nào ",
        subtitle: stats.last_audit
          ? "Quét toàn hệ thống đã hoàn thành"
          : "Chưa có lần quét nào",
        icon: <Clock className="h-4 w-4" />,
        variant: "info" as const,
        isLoading: loading,
      },
    ];

    return data;
  }, [stats, loading]);

  const handleExport = () => {
    toast.info("Xuất báo cáo đang được phát triển");
  };

  const handleRunAudit = () => {
    setScanDialogOpen(true);
  };

  const handleSchedule = () => {
    setScheduleDialogOpen(true); // Mở dialog đặt lịch
  };

  const handleRefresh = async () => {
    await refreshData(onRefreshCompliance);
  };

  const handleScanComplete = async () => {
    await refreshData(onRefreshCompliance);
  };

  if (error) {
    toast.error(`Lỗi tải dashboard: ${error}`);
  }

  return (
    <div className="p-6 space-y-6 bg-background">
      {/* Header and action buttons */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("dashboard.title")}
          </h1>
          <p className="text-muted-foreground mt-2 italic">
            {t("dashboard.subtitle")}
          </p>
        </div>

        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          {/* Nút đặt lịch - THÊM MỚI */}
          <Button
            variant="outline"
            className="flex items-center space-x-2 border-blue-200 text-blue-700 hover:bg-blue-50"
            onClick={handleSchedule}
          >
            <Calendar className="h-4 w-4" />
            <span>Đặt lịch scan</span>
          </Button>

          <Button
            variant="outline"
            className="flex items-center space-x-2"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Làm mới</span>
          </Button>

          <Button
            variant="outline"
            className="flex items-center space-x-2"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" />
            <span>{t("dashboard.actions.export")}</span>
          </Button>

          <Button
            className="flex items-center space-x-2 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleRunAudit}
          >
            <Play className="h-4 w-4" />
            <span>{t("dashboard.actions.run")}</span>
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

      {/* Scan Dialog - Giữ nguyên */}
      <ScanDialog
        open={scanDialogOpen}
        onOpenChange={setScanDialogOpen}
        onScanComplete={handleScanComplete}
      />

      {/* Schedule Dialog - THÊM MỚI */}
      <ScheduleDialog
        isOpen={scheduleDialogOpen}
        onClose={() => setScheduleDialogOpen(false)}
      />
    </div>
  );
}
