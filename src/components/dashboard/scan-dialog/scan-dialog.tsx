import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, AlertCircle } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { useScanDialog } from "@/hooks/scan-server/use-scan-dialog";
import { ScanTypeSelector } from "./scan-type-selector";
import { ServerSelector } from "./server-selector";
import { toast } from "sonner";

interface ScanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanComplete: () => void;
  handleRefresh: () => void;
}

export default function ScanDialog({
  open,
  onOpenChange,
  onScanComplete,
  handleRefresh,
}: ScanDialogProps) {
  const {
    // State
    scanType,
    servers,
    selectedServers,
    searchTerm,
    loading,
    loadingMore,
    scanning,
    hasMore,
    totalServers,
    totalSelected,
    t,

    // Actions
    setScanType,
    setSearchTerm,
    handleServerToggle,
    handleSelectAllVisible,
    handleSelectAllServers,
    handleSelectNone,
    handleStartScan,
    resetState,
    loadMoreServers,
  } = useScanDialog(open);

  // Handle close with state reset
  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  // Handle start scan with callbacks
  const onStartScan = () => {
    handleStartScan(onScanComplete, handleClose);
    handleRefresh();
  };

  // Calculate scan info
  const scanCount = scanType === "all" ? totalServers : totalSelected;
  const isLargeScan = scanCount > 1000;
  const canStartScan = scanType === "all" || totalSelected > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Play className="h-5 w-5" />
            <span>{t("scanDialog.title")}</span>
            {totalServers > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({totalServers.toLocaleString()}{" "}
                {t("scanDialog.serversAvailable")})
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Large dataset warning */}
          {totalServers > 5000 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t("scanDialog.warnings.largeDataset", {
                  count: totalServers,
                })}
              </AlertDescription>
            </Alert>
          )}

          {/* Scan Type Selection */}
          <ScanTypeSelector
            scanType={scanType}
            setScanType={setScanType}
            t={t}
          />

          {/* Server Selection */}
          {scanType === "selected" && (
            <ServerSelector
              servers={servers}
              selectedServers={selectedServers}
              searchTerm={searchTerm}
              loading={loading}
              loadingMore={loadingMore}
              hasMore={hasMore}
              totalServers={totalServers}
              totalSelected={totalSelected}
              onSearchChange={setSearchTerm}
              onServerToggle={handleServerToggle}
              onSelectAllVisible={handleSelectAllVisible}
              onSelectAllServers={handleSelectAllServers}
              onSelectNone={handleSelectNone}
              onLoadMore={loadMoreServers}
              t={t}
            />
          )}
        </div>

        <DialogFooter className="flex-col space-y-2">
          {/* Performance tips for large scans */}
          {isLargeScan && (
            <div className="w-full text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/50 p-3 rounded-md">
              💡 {t("scanDialog.tips.largeScan")}
            </div>
          )}

          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={handleClose} disabled={scanning}>
              {t("scanDialog.actions.cancel")}
            </Button>

            <Button
              onClick={onStartScan}
              disabled={
                !canStartScan ||
                scanning ||
                (scanType === "selected" && loading)
              }
              className="flex items-center space-x-2"
              variant={isLargeScan ? "default" : "default"}
            >
              <Play className="h-4 w-4" />
              <span>{t("scanDialog.actions.startScan")}</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
