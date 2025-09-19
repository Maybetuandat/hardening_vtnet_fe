import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";

import { Server } from "@/types/server";
import { useServers } from "../server/use-servers";
import toastHelper from "@/utils/toast-helper";

export const useScanDialog = (open: boolean) => {
  const { t } = useTranslation("dashboard");
  const [scanType, setScanType] = useState<"all" | "selected">("all");
  const [selectedServers, setSelectedServers] = useState<Set<number>>(
    new Set()
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [scanning, setScanning] = useState(false);

  // Sử dụng useServers hook có sẵn
  const {
    servers: currentPageServers,
    loading,
    totalServers,
    totalPages,
    currentPage,
    pageSize,
    fetchServers,
    searchServers,
  } = useServers();

  // State cho infinite scroll
  const [loadingMore, setLoadingMore] = useState(false);
  const [allLoadedServers, setAllLoadedServers] = useState<Server[]>([]);
  const [totalSelected, setTotalSelected] = useState(0);
  const [currentPageInDialog, setCurrentPageInDialog] = useState(1);

  // Performance optimization
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoad = useRef(true);

  // Calculate hasMore based on current loaded servers vs total
  const hasMore = allLoadedServers.length < totalServers && totalServers > 0;

  // Reset state khi dialog mở
  useEffect(() => {
    if (open && scanType === "selected") {
      setAllLoadedServers([]);
      setCurrentPageInDialog(1);
      isInitialLoad.current = true;

      // Load initial data nếu không có search term
      if (!searchTerm.trim()) {
        fetchServers(1, pageSize);
      }
    }
  }, [open, scanType]);

  // Xử lý khi có dữ liệu mới từ useServers
  useEffect(() => {
    if (!open || scanType !== "selected") return;

    if (isInitialLoad.current || currentPageInDialog === 1) {
      // Lần đầu load hoặc search mới - reset data
      setAllLoadedServers(currentPageServers);
      isInitialLoad.current = false;
    } else {
      // Load more - append new data
      setAllLoadedServers((prev) => {
        const existingIds = new Set(prev.map((s) => s.id));
        const newServers = currentPageServers.filter(
          (s) => !existingIds.has(s.id)
        );
        return [...prev, ...newServers];
      });
    }
  }, [currentPageServers, open, scanType, currentPageInDialog]);

  // Debounced search
  useEffect(() => {
    if (open && scanType === "selected") {
      // Clear search timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Reset state cho search mới
      setCurrentPageInDialog(1);
      setAllLoadedServers([]);
      isInitialLoad.current = true;

      // Debounce search
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          if (searchTerm.trim()) {
            await searchServers(searchTerm.trim(), undefined, 1, pageSize);
          } else {
            await fetchServers(1, pageSize);
          }
        } catch (error) {
          console.error("Error searching servers:", error);
          toastHelper.error(t("scanDialog.messages.loadServersError"));
        }
      }, 300);

      return () => {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
      };
    }
  }, [searchTerm, open, scanType]);

  // Load more servers (infinite scroll)
  const loadMoreServers = useCallback(async () => {
    if (!hasMore || loadingMore || loading) return;

    try {
      setLoadingMore(true);
      const nextPage = currentPageInDialog + 1;

      // Đảm bảo dùng đúng API call với page_size
      if (searchTerm.trim()) {
        await searchServers(searchTerm.trim(), undefined, nextPage, pageSize);
      } else {
        await fetchServers(nextPage, pageSize);
      }

      setCurrentPageInDialog(nextPage);
    } catch (error) {
      console.error("Error loading more servers:", error);
      toastHelper.error(t("scanDialog.messages.loadServersError"));
    } finally {
      setLoadingMore(false);
    }
  }, [
    hasMore,
    loadingMore,
    loading,
    searchTerm,
    currentPageInDialog,
    pageSize,
    searchServers,
    fetchServers,
    t,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handle server selection
  const handleServerToggle = useCallback((serverId: number) => {
    setSelectedServers((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(serverId)) {
        newSelected.delete(serverId);
      } else {
        newSelected.add(serverId);
      }
      return newSelected;
    });
  }, []);

  // Select all servers (including not loaded ones)
  const handleSelectAllServers = useCallback(async () => {
    try {
      setLoadingMore(true);

      // API call để lấy tất cả server IDs (chỉ lấy id và status để tối ưu)
      const params = new URLSearchParams({
        page: "1",
        page_size: totalServers.toString(),
      });

      if (searchTerm.trim()) {
        params.append("keyword", searchTerm.trim());
      }

      const response = await api.get<{
        servers: Server[];
        total_servers: number;
      }>(`/servers/?${params.toString()}`);

      const activeServerIds = (response.servers || []).map((s) => s.id);

      setSelectedServers(new Set(activeServerIds));

      toastHelper.success(
        t("scanDialog.messages.selectedAllServers", {
          count: activeServerIds.length,
        })
      );
    } catch (error) {
      console.error("Error selecting all servers:", error);
      toastHelper.error(t("scanDialog.messages.selectAllError"));
    } finally {
      setLoadingMore(false);
    }
  }, [searchTerm, totalServers, t]);

  // Deselect all servers
  const handleSelectNone = useCallback(() => {
    setSelectedServers(new Set());
  }, []);

  // Update total selected count
  useEffect(() => {
    setTotalSelected(selectedServers.size);
  }, [selectedServers]);

  // Handle scan
  const handleStartScan = useCallback(
    async (onScanComplete: () => void, onClose: () => void) => {
      try {
        setScanning(true);

        const serverIds =
          scanType === "all" ? null : Array.from(selectedServers);
        const batchSize = serverIds && serverIds.length > 1000 ? 50 : 10;

        const scanRequest = {
          server_ids: serverIds,
          batch_size: batchSize,
        };

        const successMessage =
          scanType === "all"
            ? t("scanDialog.messages.scanStartedAll", { count: totalServers })
            : t("scanDialog.messages.scanStartedSelected", {
                count: selectedServers.size,
              });

        toastHelper.success(successMessage);
        onClose();
        onScanComplete();

        console.log("Starting scan with request:", scanRequest);

        // Start scan in background
        api
          .post("/compliance/scan", scanRequest)
          .then((response) => {
            console.log("Scan started:", response);
            toastHelper.success(t("scanDialog.messages.scanRequestSent"));
          })
          .catch((error) => {
            console.error("Error starting scan:", error);
            const errorMessage =
              error.response?.data?.message || "Unable to start scan";
            toastHelper.error(
              t("scanDialog.messages.scanError", { message: errorMessage })
            );
          });
      } catch (error: any) {
        console.error("Error starting scan:", error);
        const errorMessage = error.message || "Unable to start scan";
        toastHelper.error(
          t("scanDialog.messages.scanError", { message: errorMessage })
        );
      } finally {
        setScanning(false);
      }
    },
    [scanType, selectedServers, totalServers, t]
  );

  // Reset state
  const resetState = useCallback(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setScanType("all");
    setSelectedServers(new Set());
    setSearchTerm("");
    setAllLoadedServers([]);
    setTotalSelected(0);
    setCurrentPageInDialog(1);
    setLoadingMore(false);
    isInitialLoad.current = true;
  }, []);

  return {
    // State - sử dụng allLoadedServers để support infinite scroll
    scanType,
    servers: allLoadedServers,
    selectedServers,
    searchTerm,
    loading,
    loadingMore,
    scanning,
    hasMore,
    totalServers,
    totalSelected,
    currentPage: currentPageInDialog,
    t,

    // Actions
    setScanType,
    setSearchTerm,
    handleServerToggle,

    handleSelectAllServers,
    handleSelectNone,
    handleStartScan,
    resetState,
    loadMoreServers,
  };
};
