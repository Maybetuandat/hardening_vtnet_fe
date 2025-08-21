// src/components/servers/server-upload-dialog-with-workload.tsx
import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Workload } from "@/types/workload";
import { WorkloadSelector } from "./workload-selector";
import { ServerUploadWithWorkload } from "./server-upload-with-workload";

interface ServerUploadDialogWithWorkloadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onServerAdded?: () => void; // Callback để refresh danh sách server
}

export const ServerUploadDialogWithWorkload: React.FC<
  ServerUploadDialogWithWorkloadProps
> = ({ open, onOpenChange, onServerAdded }) => {
  const [step, setStep] = useState<"select-workload" | "upload-servers">(
    "select-workload"
  );
  const [selectedWorkload, setSelectedWorkload] = useState<Workload | null>(
    null
  );

  const handleWorkloadSelected = useCallback((workload: Workload) => {
    setSelectedWorkload(workload);
    setStep("upload-servers");
  }, []);

  const handleBackToWorkloadSelection = useCallback(() => {
    setStep("select-workload");
    setSelectedWorkload(null);
  }, []);

  const handleUploadComplete = useCallback(() => {
    // Reset về trạng thái ban đầu
    setStep("select-workload");
    setSelectedWorkload(null);

    // Đóng dialog
    onOpenChange(false);

    // Trigger refresh danh sách server
    if (onServerAdded) {
      onServerAdded();
    }
  }, [onOpenChange, onServerAdded]);

  const handleCancel = useCallback(() => {
    // Reset về trạng thái ban đầu
    setStep("select-workload");
    setSelectedWorkload(null);

    // Đóng dialog
    onOpenChange(false);
  }, [onOpenChange]);

  // Reset state khi dialog đóng
  const handleDialogOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        setStep("select-workload");
        setSelectedWorkload(null);
      }
      onOpenChange(isOpen);
    },
    [onOpenChange]
  );

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        className={
          step === "upload-servers"
            ? "max-w-6xl max-h-[90vh] overflow-y-auto"
            : "max-w-md"
        }
      >
        <DialogHeader>
          <DialogTitle>
            {step === "select-workload"
              ? "Upload Server"
              : `Upload Server - ${selectedWorkload?.name}`}
          </DialogTitle>
          <DialogDescription>
            {step === "select-workload"
              ? "Chọn workload sẽ áp dụng cho các server được upload"
              : "Upload file Excel chứa thông tin các server"}
          </DialogDescription>
        </DialogHeader>

        {step === "select-workload" ? (
          <WorkloadSelector
            onWorkloadSelected={handleWorkloadSelected}
            onCancel={handleCancel}
          />
        ) : (
          selectedWorkload && (
            <ServerUploadWithWorkload
              selectedWorkload={selectedWorkload}
              onBack={handleBackToWorkloadSelection}
              onComplete={handleUploadComplete}
            />
          )
        )}
      </DialogContent>
    </Dialog>
  );
};
