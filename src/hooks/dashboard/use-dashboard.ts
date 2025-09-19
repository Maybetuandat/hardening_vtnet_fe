import { useState, useEffect, useCallback } from "react";
import { DashboardStats } from "@/types/dashboard";
import { api } from "@/lib/api";
import toastHelper from "@/utils/toast-helper";

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    total_nodes: 0,
    compliance_rate: 0,
    critical_issues: 0,
    last_audit: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await api.get<DashboardStats>("/dashboard/statistics");
      data.compliance_rate = Math.round(data.compliance_rate * 100);
      setStats(data);

      console.log(" Dashboard stats fetched:", data); // Debug log
    } catch (err: any) {
      const errorMessage = err.message || "Error fetching dashboard statistics";
      setError(errorMessage);
      console.error(" Error fetching dashboard statistics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(
    async (refreshCompliance?: () => Promise<void>) => {
      try {
        // Refresh dashboard stats
        await fetchStatistics();

        // Refresh compliance data nếu có callback
        if (refreshCompliance) {
          await refreshCompliance();
        }

        toastHelper.success("Data has been updated");
      } catch (err) {
        toastHelper.error("Error updating dashboard data  ");
      }
    },
    [fetchStatistics]
  );

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
