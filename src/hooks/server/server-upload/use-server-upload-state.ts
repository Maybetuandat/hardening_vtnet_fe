import { useState, useCallback } from "react";
import { ServerUploadData } from "@/types/server";

export function useServerUploadState() {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [adding, setAdding] = useState(false);
  const [servers, setServers] = useState<ServerUploadData[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  // Computed states
  const isDirty = servers.length > 0 || uploading || testing || adding;
  const allServersConnected =
    servers.length > 0 &&
    servers.every((s) => s.connection_status === "success");
  const anyServerTesting = servers.some(
    (s) => s.connection_status === "testing"
  );
  const hasFailedConnections = servers.some(
    (s) => s.connection_status === "failed"
  );
  const canAddServers =
    servers.length > 0 &&
    servers.every((s) => s.connection_status === "success") &&
    !anyServerTesting &&
    !adding;

  // Actions
  const removeServer = useCallback((serverId: string) => {
    setServers((prev) => prev.filter((s) => s.id !== serverId));
  }, []);

  const handleDiscard = useCallback(() => {
    setServers([]);
    setUploadedFileName("");
    setErrors([]);
  }, []);

  const cancelAllOperations = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    setUploading(false);
    setTesting(false);
    setAdding(false);
    setServers([]);
    setUploadedFileName("");
    setErrors([]);
  }, [abortController]);

  return {
    // State
    dragActive,
    uploading,
    testing,
    adding,
    servers,
    uploadedFileName,
    errors,
    abortController,
    // Computed
    isDirty,
    allServersConnected,
    anyServerTesting,
    hasFailedConnections,
    canAddServers,
    // Setters
    setDragActive,
    setUploading,
    setTesting,
    setAdding,
    setServers,
    setUploadedFileName,
    setErrors,
    setAbortController,
    // Actions
    removeServer,
    handleDiscard,
    cancelAllOperations,
  };
}
