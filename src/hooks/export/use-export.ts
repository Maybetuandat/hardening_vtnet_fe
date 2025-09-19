import { useState, useCallback } from "react";

import { api } from "@/lib/api"; // Import ApiClient instance
import { toastHelper } from "@/utils/toast-helper";

export interface ExportParams {
  keyword?: string;
  list_workload_id?: number[];
  status?: string;
}

interface UseExportReturn {
  loading: boolean;
  error: string | null;
  exportComplianceToExcel: (params?: ExportParams) => Promise<void>;
}

export function useExport(): UseExportReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadFile = useCallback((blob: Blob, filename: string) => {
    try {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading file:", err);
      throw new Error("Error downloading file");
    }
  }, []);

  const extractFilename = useCallback((response: Response): string => {
    const contentDisposition = response.headers.get("Content-Disposition");
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename=([^;]+)/);
      if (filenameMatch) {
        return filenameMatch[1].replace(/"/g, "");
      }
    }

    // Default filename with timestamp
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, "");
    return `compliance_daily_report_${dateStr}_${timeStr}.xlsx`;
  }, []);

  const exportComplianceToExcel = useCallback(
    async (params?: ExportParams) => {
      setLoading(true);
      setError(null);

      try {
        // Build query parameters
        const searchParams = new URLSearchParams();

        if (params?.keyword?.trim()) {
          searchParams.append("keyword", params.keyword.trim());
        }

        if (params?.list_workload_id && params.list_workload_id.length > 0) {
          params.list_workload_id.forEach((id) => {
            searchParams.append("list_workload_id", id.toString());
          });
        }

        if (params?.status) {
          searchParams.append("status", params.status);
        }

        const queryString = searchParams.toString();
        const endpoint = `/export/compliance/excel${
          queryString ? `?${queryString}` : ""
        }`;

        // Use api.get from ApiClient instead of fetch
        const response = await api.get<Response>(endpoint);

        const blobResponse = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}${endpoint}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(api.getAuthToken()
                ? { Authorization: `Bearer ${api.getAuthToken()}` }
                : {}),
            },
          }
        );

        if (!blobResponse.ok) {
          const errorData = await blobResponse.json().catch(() => null);
          throw new Error(
            errorData?.detail || `Error HTTP: ${blobResponse.status}`
          );
        }

        // Get file blob
        const blob = await blobResponse.blob();

        // Extract filename from headers
        const filename = extractFilename(blobResponse);

        // Download file
        downloadFile(blob, filename);

        // Show success toastHelper
        toastHelper.success("Export report successfully!", {
          description: `File ${filename} has been downloaded`,
          duration: 3000,
        });
      } catch (err: any) {
        console.error("Error exporting compliance report:", err);
        const errorMessage = err.message || "Error exporting report";
        setError(errorMessage);
        toastHelper.error("Error exporting report", {
          description: errorMessage,
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [downloadFile, extractFilename]
  );

  return {
    loading,
    error,
    exportComplianceToExcel,
  };
}
