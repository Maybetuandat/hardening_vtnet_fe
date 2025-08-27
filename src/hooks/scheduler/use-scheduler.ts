import { useState, useCallback } from "react";

import {
  ScanScheduleRequest,
  ScanScheduleResponse,
  SchedulerStatus,
  DisableScheduleResponse,
} from "@/types/scheduler";
import { api } from "@/lib/api";

export function useScheduler() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scheduleInfo, setScheduleInfo] = useState<ScanScheduleResponse | null>(
    null
  );
  const [schedulerStatus, setSchedulerStatus] =
    useState<SchedulerStatus | null>(null);

  // Get current scan schedule
  const getScanSchedule =
    useCallback(async (): Promise<ScanScheduleResponse | null> => {
      try {
        setLoading(true);
        setError(null);

        const data = await api.get<ScanScheduleResponse>("/scheduler/");
        setScheduleInfo(data);
        return data;
      } catch (err: any) {
        const errorMessage =
          err.message || "Có lỗi xảy ra khi lấy thông tin lịch scan";
        setError(errorMessage);
        console.error("Error fetching scan schedule:", err);
        return null;
      } finally {
        setLoading(false);
      }
    }, []);

  // Update scan schedule
  const updateScanSchedule = useCallback(
    async (request: ScanScheduleRequest): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const data = await api.put<ScanScheduleResponse>(
          "/scheduler/",
          request
        );
        setScheduleInfo(data);
        return true;
      } catch (err: any) {
        const errorMessage =
          err.message || "Có lỗi xảy ra khi cập nhật lịch scan";
        setError(errorMessage);
        console.error("Error updating scan schedule:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get scheduler status
  const getSchedulerStatus =
    useCallback(async (): Promise<SchedulerStatus | null> => {
      try {
        setLoading(true);
        setError(null);

        const data = await api.get<SchedulerStatus>("/scheduler/status");
        setSchedulerStatus(data);
        return data;
      } catch (err: any) {
        const errorMessage =
          err.message || "Có lỗi xảy ra khi lấy trạng thái scheduler";
        setError(errorMessage);
        console.error("Error fetching scheduler status:", err);
        return null;
      } finally {
        setLoading(false);
      }
    }, []);

  // Disable scan schedule
  const disableScanSchedule = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const data = await api.delete<DisableScheduleResponse>("/scheduler/");

      if (data.success) {
        // Update local state
        setScheduleInfo((prev) =>
          prev
            ? {
                ...prev,
                is_enabled: false,
                message: data.message,
              }
            : null
        );
        return true;
      }
      return false;
    } catch (err: any) {
      const errorMessage = err.message || "Có lỗi xảy ra khi tắt lịch scan";
      setError(errorMessage);
      console.error("Error disabling scan schedule:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([getScanSchedule(), getSchedulerStatus()]);
  }, [getScanSchedule, getSchedulerStatus]);

  return {
    // State
    loading,
    error,
    scheduleInfo,
    schedulerStatus,

    // Actions
    getScanSchedule,
    updateScanSchedule,

    getSchedulerStatus,
    disableScanSchedule,
    refreshData,

    // Helpers
    clearError: () => setError(null),
  };
}
