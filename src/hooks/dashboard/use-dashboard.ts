import { useState, useEffect, useCallback } from "react";
import { DashboardStats } from "@/types/dashboard";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    total_nodes: 0,
    compliance_rate: 0,
    critical_issues: 0,
    last_audit: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Lấy thống kê dashboard từ API
   */
  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(" Fetching dashboard statistics..."); // Debug log theo style của api.ts

      const data = await api.get<DashboardStats>("/dashboard/statistics");
      setStats(data);

      console.log(" Dashboard stats fetched:", data); // Debug log
    } catch (err: any) {
      const errorMessage = err.message || "Không thể tải dữ liệu dashboard";
      setError(errorMessage);
      console.error(" Error fetching dashboard statistics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh dữ liệu với thông báo thành công
   * Có callback để refresh compliance data từ component cha
   */
  const refreshData = useCallback(
    async (refreshCompliance?: () => Promise<void>) => {
      try {
        // Refresh dashboard stats
        await fetchStatistics();

        // Refresh compliance data nếu có callback
        if (refreshCompliance) {
          await refreshCompliance();
        }

        toast.success("Dữ liệu đã được cập nhật");
      } catch (err) {
        toast.error("Không thể cập nhật dữ liệu dashboard");
      }
    },
    [fetchStatistics]
  );

  /**
   * Auto refresh mỗi 30 giây
   */
  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return {
    stats,
    loading,
    error,
    fetchStatistics,
    refreshData,
  };
};
