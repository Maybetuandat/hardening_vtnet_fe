import { UseServerUploadReturn } from "@/types/server";
import { useCallback } from "react";
import { toast } from "sonner";
import {
  ExcelUtils,
  ConnectionUtils,
  ServerUtils,
} from "./server-upload-utils";
import { useServerUploadState } from "./use-server-upload-state";

export function useServerUpload(): UseServerUploadReturn {
  const {
    dragActive,
    uploading,
    testing,
    adding,
    servers,
    uploadedFileName,
    errors,
    isDirty,
    allServersConnected,
    anyServerTesting,
    hasFailedConnections,
    canAddServers,
    setDragActive,
    setUploading,
    setTesting,
    setAdding,
    setServers,
    setUploadedFileName,
    setErrors,
    setAbortController,
    removeServer,
    handleDiscard,
    cancelAllOperations,
  } = useServerUploadState();

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!file) return;

      setUploading(true);
      setErrors([]);

      try {
        const result = await ExcelUtils.processExcelFile(file);

        if (result.errors.length > 0) {
          setErrors(result.errors);
        }

        if (result.servers.length === 0) {
          throw new Error("No valid servers found");
        }

        setServers(result.servers);
        setUploadedFileName(file.name);
        toast.success(
          `Successfully uploaded ${result.servers.length} servers!`
        );
      } catch (error: any) {
        console.error("Error processing file:", error);
        const errorMessage =
          error.message || "An error occurred while processing the file";
        setErrors([errorMessage]);
        toast.error(errorMessage);
      } finally {
        setUploading(false);
      }
    },
    [setUploading, setErrors, setServers, setUploadedFileName]
  );

  const handleTestConnection = useCallback(async () => {
    if (servers.length === 0) return;

    setTesting(true);
    const controller = new AbortController();
    setAbortController(controller);

    // Set all servers to testing state
    setServers((prev) =>
      prev.map((server) => ({
        ...server,
        connection_status: "testing" as const,
        connection_message: "Testing...",
      }))
    );

    try {
      // Validate IP addresses first
      const validationResults = await ConnectionUtils.validateIpAddresses(
        servers
      );
      const validServers = servers.filter(
        (server) => validationResults[server.ip_address]
      );
      const invalidServers = servers.filter(
        (server) => !validationResults[server.ip_address]
      );

      // Update servers with invalid IPs
      if (invalidServers.length > 0) {
        setServers((prev) =>
          prev.map((server) => {
            if (!validationResults[server.ip_address]) {
              return {
                ...server,
                connection_status: "failed" as const,
                connection_message: "IP address already exists in the system",
              };
            }
            return server;
          })
        );
      }

      // Test valid servers
      if (validServers.length > 0) {
        const response = await ConnectionUtils.testConnections(
          validServers,
          controller.signal
        );

        setServers((prev) =>
          prev.map((server) => {
            if (!validationResults[server.ip_address]) {
              return server; // Keep failed state for invalid IPs
            }

            const result = response.results.find(
              (r) => r.ip === server.ip_address
            );
            if (result) {
              return {
                ...server,
                connection_status:
                  result.status === "success"
                    ? ("success" as const)
                    : ("failed" as const),
                connection_message: result.message,
                hostname: result.hostname || server.hostname,
                os_version: result.os_version || server.os_version,
              };
            }
            return server;
          })
        );

        toast.success(
          `Test connection completed: ${response.successful_connections}/${servers.length} successful`
        );
      } else {
        toast.warning("No valid servers to test connection");
      }

      // Filter successful servers after 5 seconds
      setTimeout(() => {
        setServers((prev) =>
          prev.filter((server) => server.connection_status === "success")
        );

        const successfulCount = servers.filter(
          (server) =>
            validationResults[server.ip_address] &&
            validServers.find((s) => s.ip_address === server.ip_address)
        ).length;

        if (successfulCount > 0) {
          toast.success(
            `Filtered and retained ${successfulCount} successful connected servers. You can add them to the system.`
          );
        } else {
          toast.error(
            "No servers connected successfully. Please check the information again."
          );
        }
      }, 5000);
    } catch (error: any) {
      console.error("Error testing connection:", error);

      setServers((prev) =>
        prev.map((server) => ({
          ...server,
          connection_status: "failed" as const,
          connection_message: "Error testing connection",
        }))
      );

      toast.error("An error occurred while testing connection");
    } finally {
      setTesting(false);
    }
  }, [servers, setTesting, setAbortController, setServers]);

  const handleAddServersWithWorkload = useCallback(
    async (
      workloadId: number,
      onSuccess?: () => void,
      onRefreshList?: () => void
    ) => {
      if (servers.length === 0) {
        toast.error("No servers to add");
        return;
      }

      if (!canAddServers) {
        toast.error(
          "Please successfully test the connection for all servers before adding"
        );
        return;
      }

      setAdding(true);
      const controller = new AbortController();
      setAbortController(controller);

      try {
        await ServerUtils.addServersWithWorkload(
          servers,
          workloadId,
          controller.signal
        );

        toast.success(
          `Successfully added ${servers.length} servers with workload!`
        );

        // Reset state
        setServers([]);
        setUploadedFileName("");
        setErrors([]);

        // Callbacks
        if (onSuccess) onSuccess();
        if (onRefreshList) onRefreshList();
      } catch (error: any) {
        console.error("Error adding servers with workload:", error);
        toast.error(error.message || "An error occurred while adding server");
      } finally {
        setAdding(false);
      }
    },
    [
      servers,
      canAddServers,
      setAdding,
      setAbortController,
      setServers,
      setUploadedFileName,
      setErrors,
    ]
  );

  return {
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
  };
}
