// src/hooks/os/use-os.ts
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { OSVersion, OSCreate, OSUpdate, OSListResponse } from "@/types/os";

interface UseOSReturn {
  osVersions: OSVersion[];
  loading: boolean;
  error: string | null;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  fetchOSVersions: (
    keyword?: string,
    page?: number,
    size?: number
  ) => Promise<void>;
  createOSVersion: (osData: OSCreate) => Promise<void>;
  updateOSVersion: (osId: number, osData: OSUpdate) => Promise<void>;
  deleteOSVersion: (osId: number) => Promise<void>;
  getOSById: (osId: number) => Promise<OSVersion>;
  searchOSVersions: (
    keyword?: string,
    page?: number,
    size?: number
  ) => Promise<void>;
}

export function useOS(): UseOSReturn {
  const [osVersions, setOsVersions] = useState<OSVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const handleError = useCallback((error: any, action: string) => {
    console.error(`Error ${action}:`, error);
    const message = error.message || `Failed to ${action}`;
    setError(message);
    toast.error(message);
  }, []);

  const fetchOSVersions = useCallback(
    async (keyword?: string, page: number = 1, size: number = 10) => {
      setLoading(true);
      setError(null); // Clear error trước khi fetch

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          page_size: size.toString(),
        });

        if (keyword?.trim()) {
          params.append("keyword", keyword.trim());
        }

        const response = await api.get<OSListResponse>(
          `/os_version?${params.toString()}`
        );

        setOsVersions(response.os || []);
        setTotalItems(response.total || 0);
        setTotalPages(response.total_pages || 0);
        setCurrentPage(response.page || 1);
        setPageSize(response.page_size || size);
        setError(null); // Clear error khi thành công
      } catch (err) {
        handleError(err, "fetch OS versions");
        setOsVersions([]);
        setTotalItems(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    },
    [handleError]
  );

  const searchOSVersions = useCallback(
    async (keyword?: string, page: number = 1, size: number = 10) => {
      await fetchOSVersions(keyword, page, size);
    },
    [fetchOSVersions]
  );

  const createOSVersion = useCallback(
    async (osData: OSCreate): Promise<void> => {
      try {
        setError(null); // Clear error trước khi tạo
        await api.post("/os_version/", osData);
        toast.success("Tạo hệ điều hành thành công");
        // Refresh list sau khi tạo thành công
        await fetchOSVersions(undefined, currentPage, pageSize);
      } catch (err) {
        handleError(err, "create OS version");
        throw err;
      }
    },
    [handleError, fetchOSVersions, currentPage, pageSize]
  );

  const updateOSVersion = useCallback(
    async (osId: number, osData: OSUpdate): Promise<void> => {
      try {
        setError(null); // Clear error trước khi update
        const updatedOS = await api.put<OSVersion>(
          `/os_version/${osId}`,
          osData
        );

        // Update local state
        setOsVersions((prev) =>
          prev.map((os) => (os.id === osId ? updatedOS : os))
        );

        toast.success("Cập nhật hệ điều hành thành công");
      } catch (err) {
        handleError(err, "update OS version");
        throw err;
      }
    },
    [handleError]
  );

  const deleteOSVersion = useCallback(
    async (osId: number): Promise<void> => {
      try {
        setError(null); // Clear error trước khi xóa
        await api.delete(`/os_version/${osId}`);

        // Remove from local state
        setOsVersions((prev) => prev.filter((os) => os.id !== osId));
        setTotalItems((prev) => prev - 1);

        toast.success("Xóa hệ điều hành thành công");
      } catch (err) {
        handleError(err, "delete OS version");
        throw err;
      }
    },
    [handleError]
  );

  const getOSById = useCallback(
    async (osId: number): Promise<OSVersion> => {
      try {
        setError(null); // Clear error trước khi get
        const os = await api.get<OSVersion>(`/os_version/${osId}`);
        if (!os) throw new Error("OS version not found");
        return os;
      } catch (err: any) {
        if (err.message.includes("404")) {
          throw new Error("OS version not found");
        }
        handleError(err, "get OS version by ID");
        throw err;
      }
    },
    [handleError]
  );

  // Initial fetch
  useEffect(() => {
    fetchOSVersions();
  }, [fetchOSVersions]);

  return {
    osVersions,
    loading,
    error,
    totalItems,
    currentPage,
    totalPages,
    pageSize,
    fetchOSVersions,
    createOSVersion,
    updateOSVersion,
    deleteOSVersion,
    getOSById,
    searchOSVersions,
  };
}
