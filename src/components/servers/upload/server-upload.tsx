import React, { useCallback, useImperativeHandle, forwardRef } from "react";
import { toast } from "sonner";

import { useServerUpload } from "@/hooks/server/use-server-upload";
import { WorkloadResponse } from "@/types/workload";
import { ServerManagement } from "./server-management";
import { ServerUploadArea } from "./server-upload-area";
import { ServerUploadHeader } from "./server-upload-header";

export interface ServerUploadWithWorkloadRef {
  cancelAllOperations: () => void;
  isDirty: boolean;
}

interface ServerUploadWithWorkloadProps {
  selectedWorkload: WorkloadResponse;
  onBack: () => void;
  onComplete: () => void;
}

export const ServerUpload = forwardRef<
  ServerUploadWithWorkloadRef,
  ServerUploadWithWorkloadProps
>(({ selectedWorkload, onBack, onComplete }, ref) => {
  const {
    // States
    dragActive,
    uploading,
    testing,
    adding,
    servers,
    uploadedFileName,
    errors,
    isDirty,

    // Computed states
    allServersConnected,
    anyServerTesting,
    hasFailedConnections,
    canAddServers,

    // Actions
    setDragActive,
    handleFileUpload,
    removeServer,
    handleDiscard,
    handleTestConnection,
    handleAddServersWithWorkload,
    cancelAllOperations,
  } = useServerUpload();

  useImperativeHandle(
    ref,
    () => ({
      cancelAllOperations,
      isDirty,
    }),
    [cancelAllOperations, isDirty]
  );

  const handleAddServersWrapper = useCallback(async () => {
    if (!selectedWorkload.id) {
      toast.error("can't find workload ID");
      return;
    }

    await handleAddServersWithWorkload(
      selectedWorkload.id,
      () => {
        onComplete();
      },
      () => {}
    );
  }, [handleAddServersWithWorkload, selectedWorkload.id, onComplete]);

  return (
    <div className="space-y-6">
      <ServerUploadHeader selectedWorkload={selectedWorkload} onBack={onBack} />

      <ServerUploadArea
        dragActive={dragActive}
        uploading={uploading}
        errors={errors}
        hasServers={servers.length > 0}
        setDragActive={setDragActive}
        handleFileUpload={handleFileUpload}
      />

      <ServerManagement
        servers={servers}
        uploadedFileName={uploadedFileName}
        testing={testing}
        adding={adding}
        allServersConnected={allServersConnected}
        anyServerTesting={anyServerTesting}
        hasFailedConnections={hasFailedConnections}
        canAddServers={canAddServers}
        onTestConnection={handleTestConnection}
        onAddServers={handleAddServersWrapper}
        onDiscard={handleDiscard}
        onRemoveServer={removeServer}
      />
    </div>
  );
});

ServerUpload.displayName = "ServerUpload";
