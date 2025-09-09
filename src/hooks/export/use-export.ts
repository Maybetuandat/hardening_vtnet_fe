import { useState, useCallback } from "react";
import { toast } from "sonner";

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
      throw new Error("Không thể tải xuống file");
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

    // Default filename với timestamp
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
          // Thêm từng workload_id vào query params
          params.list_workload_id.forEach(id => {
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

        // Make request với fetch để handle blob response
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}${endpoint}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.detail || `Lỗi HTTP: ${response.status}`);
        }

        // Get file blob
        const blob = await response.blob();

        // Extract filename from headers
        const filename = extractFilename(response);

        // Download file
        downloadFile(blob, filename);

        // Show success toast
        toast.success("Xuất báo cáo thành công!", {
          description: `File ${filename} đã được tải xuống`,
        });
      } catch (err: any) {
        console.error("Error exporting compliance report:", err);
        const errorMessage = err.message || "Có lỗi xảy ra khi xuất báo cáo";
        setError(errorMessage);
        toast.error("Xuất báo cáo thất bại", {
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