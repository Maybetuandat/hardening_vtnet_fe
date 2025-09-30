import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";

import { Instance } from "@/types/instance";
import { useInstances } from "../instance/use-instance";
import toastHelper from "@/utils/toast-helper";

export const useScanDialog = (open: boolean) => {
  const { t } = useTranslation("dashboard");
  const [scanType, setScanType] = useState<"all" | "selected">("all");
  const [selectedInstances, setSelectedInstances] = useState<Set<number>>(
    new Set()
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [scanning, setScanning] = useState(false);

  // Sử dụng useInstances hook có sẵn
  const {
    instances: currentPageInstances,
    loading,
    totalInstances,
    totalPages,
    currentPage,
    pageSize,
    fetchInstances,
    searchInstances,
  } = useInstances();

  // State cho infinite scroll
  const [loadingMore, setLoadingMore] = useState(false);
  const [allLoadedInstances, setAllLoadedInstances] = useState<Instance[]>([]);
  const [totalSelected, setTotalSelected] = useState(0);
  const [currentPageInDialog, setCurrentPageInDialog] = useState(1);

  // Performance optimization
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoad = useRef(true);

  // Calculate hasMore based on current loaded instances vs total
  const hasMore =
    allLoadedInstances.length < totalInstances && totalInstances > 0;

  // Reset state khi dialog mở
  useEffect(() => {
    if (open && scanType === "selected") {
      setAllLoadedInstances([]);
      setCurrentPageInDialog(1);
      isInitialLoad.current = true;

      // Load initial data nếu không có search term
      if (!searchTerm.trim()) {
        fetchInstances(1, pageSize);
      }
    }
  }, [open, scanType]);

  // Xử lý khi có dữ liệu mới từ useInstances
  useEffect(() => {
    if (!open || scanType !== "selected") return;

    if (isInitialLoad.current || currentPageInDialog === 1) {
      // Lần đầu load hoặc search mới - reset data
      setAllLoadedInstances(currentPageInstances);
      isInitialLoad.current = false;
    } else {
      // Load more - append new data
      setAllLoadedInstances((prev) => {
        const existingIds = new Set(prev.map((s) => s.id));
        const newInstances = currentPageInstances.filter(
          (s) => !existingIds.has(s.id)
        );
        return [...prev, ...newInstances];
      });
    }
  }, [currentPageInstances, open, scanType, currentPageInDialog]);

  // Debounced search
  useEffect(() => {
    if (open && scanType === "selected") {
      // Clear search timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Reset state cho search mới
      setCurrentPageInDialog(1);
      setAllLoadedInstances([]);
      isInitialLoad.current = true;

      // Debounce search
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          if (searchTerm.trim()) {
            await searchInstances(searchTerm.trim(), undefined, 1, pageSize);
          } else {
            await fetchInstances(1, pageSize);
          }
        } catch (error) {
          console.error("Error searching instances:", error);
          toastHelper.error(t("scanDialog.messages.loadInstancesError"));
        }
      }, 300);

      return () => {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
      };
    }
  }, [searchTerm, open, scanType]);

  // Load more instances (infinite scroll)
  const loadMoreInstances = useCallback(async () => {
    if (!hasMore || loadingMore || loading) return;

    try {
      setLoadingMore(true);
      const nextPage = currentPageInDialog + 1;

      // Đảm bảo dùng đúng API call với page_size
      if (searchTerm.trim()) {
        await searchInstances(searchTerm.trim(), undefined, nextPage, pageSize);
      } else {
        await fetchInstances(nextPage, pageSize);
      }

      setCurrentPageInDialog(nextPage);
    } catch (error) {
      console.error("Error loading more instances:", error);
      toastHelper.error(t("scanDialog.messages.loadInstancesError"));
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
    searchInstances,
    fetchInstances,
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

  // Handle instance selection
  const handleInstanceToggle = useCallback((instanceId: number) => {
    setSelectedInstances((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(instanceId)) {
        newSelected.delete(instanceId);
      } else {
        newSelected.add(instanceId);
      }
      return newSelected;
    });
  }, []);

  // Select all instances (including not loaded ones)
  const handleSelectAllInstances = useCallback(async () => {
    try {
      setLoadingMore(true);

      // API call để lấy tất cả instance IDs (chỉ lấy id và status để tối ưu)
      const params = new URLSearchParams({
        page: "1",
        page_size: totalInstances.toString(),
      });

      if (searchTerm.trim()) {
        params.append("keyword", searchTerm.trim());
      }

      const response = await api.get<{
        instances: Instance[];
        total_instances: number;
      }>(`/instance/?${params.toString()}`);

      const activeInstanceIds = (response.instances || []).map((s) => s.id);

      setSelectedInstances(new Set(activeInstanceIds));

      toastHelper.success(
        t("scanDialog.messages.selectedAllInstances", {
          count: activeInstanceIds.length,
        })
      );
    } catch (error) {
      console.error("Error selecting all instances:", error);
      toastHelper.error(t("scanDialog.messages.selectAllError"));
    } finally {
      setLoadingMore(false);
    }
  }, [searchTerm, totalInstances, t]);

  // Deselect all instances
  const handleSelectNone = useCallback(() => {
    setSelectedInstances(new Set());
  }, []);

  // Update total selected count
  useEffect(() => {
    setTotalSelected(selectedInstances.size);
  }, [selectedInstances]);

  // Handle scan
  const handleStartScan = useCallback(
    async (onScanComplete: () => void, onClose: () => void) => {
      try {
        setScanning(true);

        const instanceIds =
          scanType === "all" ? null : Array.from(selectedInstances);
        const batchSize = instanceIds && instanceIds.length > 1000 ? 50 : 10;

        const scanRequest = {
          server_ids: instanceIds, // Backend vẫn dùng server_ids
          batch_size: batchSize,
        };

        const successMessage =
          scanType === "all"
            ? t("scanDialog.messages.scanStartedAll", { count: totalInstances })
            : t("scanDialog.messages.scanStartedSelected", {
                count: selectedInstances.size,
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
    [scanType, selectedInstances, totalInstances, t]
  );

  // Reset state
  const resetState = useCallback(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setScanType("all");
    setSelectedInstances(new Set());
    setSearchTerm("");
    setAllLoadedInstances([]);
    setTotalSelected(0);
    setCurrentPageInDialog(1);
    setLoadingMore(false);
    isInitialLoad.current = true;
  }, []);

  return {
    // State - sử dụng allLoadedInstances để support infinite scroll
    scanType,
    instances: allLoadedInstances,
    selectedInstances,
    searchTerm,
    loading,
    loadingMore,
    scanning,
    hasMore,
    totalInstances,
    totalSelected,
    currentPage: currentPageInDialog,
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
  };
};
