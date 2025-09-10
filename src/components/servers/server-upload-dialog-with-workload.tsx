import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { WorkloadSelector } from "./workload-selector";
import { ServerUpload, ServerUploadWithWorkloadRef } from "./server-upload";
import { ConfirmCancelDialog } from "../ui/confirm-cancel-dialog";
import { WorkloadResponse } from "@/types/workload";

interface ServerUploadDialogWithWorkloadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onServerAdded?: () => void;
}

export const ServerUploadDialogWithWorkload: React.FC<
  ServerUploadDialogWithWorkloadProps
> = ({ open, onOpenChange, onServerAdded }) => {
  const [step, setStep] = useState<"select-workload" | "upload-servers">(
    "select-workload"
  );
  const [selectedWorkload, setSelectedWorkload] =
    useState<WorkloadResponse | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const serverUploadRef = useRef<ServerUploadWithWorkloadRef | null>(null);

  useEffect(() => {
    const checkDirty = () => {
      if (serverUploadRef.current) {
        const currentIsDirty =
          step === "upload-servers" && serverUploadRef.current.isDirty;
        if (currentIsDirty !== isDirty) {
          setIsDirty(currentIsDirty);
        }
      } else if (step === "select-workload" && selectedWorkload) {
        // Đã chọn workload cũng coi là dirty
        setIsDirty(true);
      } else if (step === "select-workload" && !selectedWorkload) {
        setIsDirty(false);
      }
    };

    checkDirty();
    const interval = setInterval(checkDirty, 200);
    return () => clearInterval(interval);
  }, [step, selectedWorkload, isDirty]);

  const handleWorkloadSelected = useCallback((workload: WorkloadResponse) => {
    setSelectedWorkload(workload);
    setStep("upload-servers");
  }, []);

  const handleBackToWorkloadSelection = useCallback(() => {
    setStep("select-workload");
    setSelectedWorkload(null);
  }, []);

  const handleUploadComplete = useCallback(() => {
    setStep("select-workload");
    setSelectedWorkload(null);
    setIsDirty(false);

    onOpenChange(false);

    if (onServerAdded) {
      onServerAdded();
    }
  }, [onOpenChange, onServerAdded]);

  const handleCancel = useCallback(() => {
    setStep("select-workload");
    setSelectedWorkload(null);
    setIsDirty(false);

    onOpenChange(false);
  }, [onOpenChange]);

  const handleDialogOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen && isDirty) {
        setShowConfirmCancel(true);
        return;
      }

      if (!isOpen) {
        setStep("select-workload");
        setSelectedWorkload(null);
        setIsDirty(false);
      }
      onOpenChange(isOpen);
    },
    [onOpenChange, isDirty]
  );

  const handleConfirmCancel = useCallback(() => {
    if (serverUploadRef.current) {
      serverUploadRef.current.cancelAllOperations();
    }
    setStep("select-workload");
    setSelectedWorkload(null);
    setIsDirty(false);
    setShowConfirmCancel(false);
    onOpenChange(false);
  }, [onOpenChange]);

  const handleCancelConfirm = useCallback(() => {
    setShowConfirmCancel(false);
  }, []);

  return (
    <>
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
              {step === "select-workload" ? "Upload Server" : "Upload Server"}
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
              <ServerUpload
                selectedWorkload={selectedWorkload}
                onBack={handleBackToWorkloadSelection}
                onComplete={handleUploadComplete}
                ref={serverUploadRef}
              />
            )
          )}
        </DialogContent>
      </Dialog>

      <ConfirmCancelDialog
        open={showConfirmCancel}
        onOpenChange={handleCancelConfirm}
        onConfirm={handleConfirmCancel}
      />
    </>
  );
};
