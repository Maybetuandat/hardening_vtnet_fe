// src/hooks/fix-request/use-fix-request.ts
import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import toastHelper from "@/utils/toast-helper";
import {
  FixRequestCreate,
  FixRequestResponse,
  FixRequestListResponse,
} from "@/types/fix-request";

interface UseFixRequestReturn {
  requests: FixRequestResponse[];
  loading: boolean;

  // User operations
  createFixRequest: (data: FixRequestCreate) => Promise<void>;
  fetchMyRequests: (status?: string) => Promise<void>;
  deleteMyRequest: (requestId: number) => Promise<void>;
  getRequestById: (requestId: number) => Promise<FixRequestResponse | null>;

  // Admin operations
  fetchAllRequests: (status?: string) => Promise<void>;
  approveRequest: (requestId: number, adminComment?: string) => Promise<void>;
  rejectRequest: (requestId: number, adminComment?: string) => Promise<void>;
}

export function useFixRequest(): UseFixRequestReturn {
  const [requests, setRequests] = useState<FixRequestResponse[]>([]);
  const [loading, setLoading] = useState(false);

  // ===== USER OPERATIONS =====

  const createFixRequest = useCallback(async (data: FixRequestCreate) => {
    try {
      setLoading(true);
      await api.post<FixRequestResponse>("/fix-requests/", data);
      toastHelper.success("Fix request created successfully");
    } catch (error: any) {
      const message = error.message || "Failed to create fix request";
      toastHelper.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyRequests = useCallback(async (status?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (status && status !== "all") {
        params.append("status", status);
      }

      const url = `/fix-requests/my-requests${
        params.toString() ? `?${params.toString()}` : ""
      }`;

      const response = await api.get<FixRequestListResponse>(url);
      setRequests(response.requests || []);
    } catch (error: any) {
      const message = error.message || "Failed to fetch fix requests";
      toastHelper.error(message);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMyRequest = useCallback(async (requestId: number) => {
    try {
      setLoading(true);
      await api.delete(`/fix-requests/${requestId}`);
      toastHelper.success("Fix request deleted successfully");

      // Refresh list after delete
      setRequests((prev) => prev.filter((req) => req.id !== requestId));
    } catch (error: any) {
      const message = error.message || "Failed to delete fix request";
      toastHelper.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getRequestById = useCallback(
    async (requestId: number): Promise<FixRequestResponse | null> => {
      try {
        setLoading(true);
        const response = await api.get<FixRequestResponse>(
          `/fix-requests/${requestId}`
        );
        return response;
      } catch (error: any) {
        const message = error.message || "Failed to fetch fix request";
        toastHelper.error(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ===== ADMIN OPERATIONS =====

  const fetchAllRequests = useCallback(async (status?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (status && status !== "all") {
        params.append("status", status);
      }

      const url = `/fix-requests/${
        params.toString() ? `?${params.toString()}` : ""
      }`;

      const response = await api.get<FixRequestListResponse>(url);
      setRequests(response.requests || []);
    } catch (error: any) {
      const message = error.message || "Failed to fetch fix requests";
      toastHelper.error(message);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const approveRequest = useCallback(
    async (requestId: number, adminComment?: string) => {
      try {
        setLoading(true);
        const response = await api.post<FixRequestResponse>(
          `/fix-requests/${requestId}/approve`,
          {
            admin_comment: adminComment,
          }
        );
        toastHelper.success("Fix request approved successfully");

        // Update local state
        setRequests((prev) =>
          prev.map((req) =>
            req.id === requestId
              ? {
                  ...req,
                  status: "approved" as const,
                  admin_comment: adminComment,
                }
              : req
          )
        );
      } catch (error: any) {
        const message = error.message || "Failed to approve fix request";
        toastHelper.error(message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const rejectRequest = useCallback(
    async (requestId: number, adminComment?: string) => {
      try {
        setLoading(true);
        const response = await api.post<FixRequestResponse>(
          `/fix-requests/${requestId}/reject`,
          {
            admin_comment: adminComment,
          }
        );
        toastHelper.success("Fix request rejected");

        // Update local state
        setRequests((prev) =>
          prev.map((req) =>
            req.id === requestId
              ? {
                  ...req,
                  status: "rejected" as const,
                  admin_comment: adminComment,
                }
              : req
          )
        );
      } catch (error: any) {
        const message = error.message || "Failed to reject fix request";
        toastHelper.error(message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );
  return {
    requests,
    loading,
    createFixRequest,
    fetchMyRequests,
    deleteMyRequest,
    getRequestById,
    fetchAllRequests,
    approveRequest,
    rejectRequest,
  };
}
