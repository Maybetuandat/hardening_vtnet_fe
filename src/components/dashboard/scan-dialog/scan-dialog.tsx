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
import { InstanceSelector } from "./instance-selector";

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
    instances,
    selectedInstances,
    searchTerm,
    loading,
    loadingMore,
    scanning,
    hasMore,
    totalInstances,
    totalSelected,
    t,

    // Actions
    setScanType,
    setSearchTerm,
    handleInstanceToggle,
    handleSelectAllInstances,
    handleSelectNone,
    handleStartScan,
    resetState,
    loadMoreInstances,
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
  const scanCount = scanType === "all" ? totalInstances : totalSelected;
  const isLargeScan = scanCount > 1000;
  const canStartScan = scanType === "all" || totalSelected > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Play className="h-5 w-5" />
            <span>{t("scanDialog.title")}</span>
            {totalInstances > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({totalInstances.toLocaleString()}{" "}
                {t("scanDialog.instancesAvailable")})
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Large dataset warning */}
          {totalInstances > 5000 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t("scanDialog.warnings.largeDataset", {
                  count: totalInstances,
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

          {/* Instance Selection */}
          {scanType === "selected" && (
            <InstanceSelector
              instances={instances}
              selectedInstances={selectedInstances}
              searchTerm={searchTerm}
              loading={loading}
              loadingMore={loadingMore}
              hasMore={hasMore}
              totalInstances={totalInstances}
              totalSelected={totalSelected}
              onSearchChange={setSearchTerm}
              onInstanceToggle={handleInstanceToggle}
              onSelectAllInstances={handleSelectAllInstances}
              onSelectNone={handleSelectNone}
              onLoadMore={loadMoreInstances}
              t={t}
            />
          )}
        </div>

        <DialogFooter className="flex-col space-y-2">
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
