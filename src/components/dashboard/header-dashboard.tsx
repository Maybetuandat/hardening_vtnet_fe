// src/components/dashboard/header-dashboard.tsx
import ScanDialog from "./scan-dialog/scan-dialog";
import { Button } from "../ui/button";
import { Download, Play, RefreshCw, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDashboard } from "@/hooks/dashboard/use-dashboard";
import { useState } from "react";
import ScheduleDialog from "./scheduler-dialog";
import { ExportDialog } from "./export-dialog";
import toastHelper from "@/utils/toast-helper";
import { WorkloadStats } from "@/types/dashboard";

interface HeaderDashBoardProps {
  onRefreshCompliance?: () => Promise<void>;
}

// ==========================================
// Component biểu đồ tròn
// ==========================================
interface PieChartProps {
  passCount: number;
  failCount: number;
}

const PieChart = ({ passCount, failCount }: PieChartProps) => {
  const total = passCount + failCount;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-[280px]">
        <p className="text-muted-foreground text-sm">No data available</p>
      </div>
    );
  }

  const passPercentage = (passCount / total) * 100;
  const failPercentage = (failCount / total) * 100;

  const passAngle = (passPercentage / 100) * 360;
  const failAngle = (failPercentage / 100) * 360;

  const getCoordinatesForAngle = (angle: number, radius: number = 100) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: 120 + radius * Math.cos(rad),
      y: 120 + radius * Math.sin(rad),
    };
  };

  const passStart = getCoordinatesForAngle(0);
  const passEnd = getCoordinatesForAngle(passAngle);
  const failEnd = getCoordinatesForAngle(passAngle + failAngle);

  const passPath = [
    `M 120 120`,
    `L ${passStart.x} ${passStart.y}`,
    `A 100 100 0 ${passAngle > 180 ? 1 : 0} 1 ${passEnd.x} ${passEnd.y}`,
    "Z",
  ].join(" ");

  const failPath = [
    `M 120 120`,
    `L ${passEnd.x} ${passEnd.y}`,
    `A 100 100 0 ${failAngle > 180 ? 1 : 0} 1 ${failEnd.x} ${failEnd.y}`,
    "Z",
  ].join(" ");

  return (
    <div className="flex flex-col items-center gap-6">
      <svg width="240" height="240" viewBox="0 0 240 240">
        <path d={passPath} fill="#10b981" stroke="white" strokeWidth="2" />
        <path d={failPath} fill="#ef4444" stroke="white" strokeWidth="2" />
        <circle cx="120" cy="120" r="60" fill="white" />
        <text
          x="120"
          y="115"
          textAnchor="middle"
          fontSize="24"
          fontWeight="bold"
          fill="#333"
        >
          {total}
        </text>
        <text x="120" y="135" textAnchor="middle" fontSize="12" fill="#666">
          Total Instances
        </text>
      </svg>

      <div className="flex gap-8">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded" />
          <div className="text-sm">
            <span className="font-semibold">Pass: </span>
            <span>
              {passCount} ({passPercentage.toFixed(1)}%)
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded" />
          <div className="text-sm">
            <span className="font-semibold">Failed: </span>
            <span>
              {failCount} ({failPercentage.toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// Component thanh ngang cho từng workload
// ==========================================
interface HorizontalBarProps {
  workload: WorkloadStats;
}

const HorizontalBar = ({ workload }: HorizontalBarProps) => {
  const total = workload.total;
  const passWidth = total > 0 ? (workload.pass_count / total) * 100 : 0;
  const failWidth = total > 0 ? (workload.fail_count / total) * 100 : 0;

  return (
    <div className="space-y-2">
      {/* Workload name và total */}
      <div className="flex justify-between items-center">
        <span
          className="font-medium text-sm truncate"
          title={workload.workload_name}
        >
          {workload.workload_name}
        </span>
        <span className="text-xs text-muted-foreground">Total: {total}</span>
      </div>

      {/* Horizontal stacked bar */}
      <div className="flex h-10 rounded-lg overflow-hidden border border-gray-200">
        {/* Pass bar */}
        {workload.pass_count > 0 && (
          <div
            className="bg-green-500 flex items-center justify-center text-white text-sm font-semibold transition-all hover:bg-green-600"
            style={{ width: `${passWidth}%` }}
            title={`Pass: ${workload.pass_count} (${passWidth.toFixed(1)}%)`}
          >
            {passWidth > 15 && (
              <span className="px-2">{workload.pass_count}</span>
            )}
          </div>
        )}

        {/* Failed bar */}
        {workload.fail_count > 0 && (
          <div
            className="bg-red-500 flex items-center justify-center text-white text-sm font-semibold transition-all hover:bg-red-600"
            style={{ width: `${failWidth}%` }}
            title={`Failed: ${workload.fail_count} (${failWidth.toFixed(1)}%)`}
          >
            {failWidth > 15 && (
              <span className="px-2">{workload.fail_count}</span>
            )}
          </div>
        )}
      </div>

      {/* Số lượng dưới bar */}
      <div className="flex justify-between text-xs">
        <span className="text-green-600 font-medium">
          Pass: {workload.pass_count} ({passWidth.toFixed(1)}%)
        </span>
        <span className="text-red-600 font-medium">
          Failed: {workload.fail_count} ({failWidth.toFixed(1)}%)
        </span>
      </div>
    </div>
  );
};

// ==========================================
// Component hiển thị danh sách workload bars
// ==========================================
interface WorkloadBarsProps {
  data: WorkloadStats[];
}

const WorkloadBars = ({ data }: WorkloadBarsProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px] space-y-3">
        <p className="text-muted-foreground text-sm">
          No workload data available
        </p>
        <p className="text-xs text-muted-foreground text-center max-w-md">
          Instances need to be assigned to workloads to display statistics
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {data.map((workload, index) => (
        <HorizontalBar key={index} workload={workload} />
      ))}

      <div className="flex justify-center gap-6 pt-4 border-t mt-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded" />
          <span className="text-sm font-medium">Active Instances</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded" />
          <span className="text-sm font-medium">Inactive Instances</span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// Main Component
// ==========================================
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
      {/* Header and action buttons */}
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

      {/* Charts Section - LAYOUT DỌC */}
      <div className="space-y-6">
        {/* Phần trên: Biểu đồ tròn */}
        <div className="bg-card rounded-lg border p-6">
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

        {/* Phần dưới: Workload Horizontal Bars */}
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-6">Instances by Workload</h3>
          {loading ? (
            <div className="h-[200px] flex items-center justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <WorkloadBars data={stats.workload_stats} />
          )}
        </div>
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
