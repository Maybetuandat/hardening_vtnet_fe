import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import toastHelper from "@/utils/toast-helper";

export interface RuleChangeRequestCreate {
  rule_id: number;
  new_value: Record<string, any>;
}

export interface RuleChangeRequestResponse {
  id: number;
  workload_id: number;
  rule_id?: number;
  user_id: number;
  request_type: "create" | "update";
  old_value?: Record<string, any>;
  new_value: Record<string, any>;
  status: "pending" | "approved" | "rejected";
  admin_id?: number;
  admin_note?: string;
  created_at: string;
  updated_at: string;
  processed_at?: string;
  workload_name?: string;
  rule_name?: string;
  requester_username?: string;
  admin_username?: string;
}

export interface RuleChangeRequestListResponse {
  requests: RuleChangeRequestResponse[];
  total: number;
}

interface UseRuleChangeRequestsReturn {
  requests: RuleChangeRequestResponse[];
  loading: boolean;

  // Operations cho cả user và admin
  fetchMyRequests: (status?: string) => Promise<void>;
  createUpdateRequest: (
    data: RuleChangeRequestCreate
  ) => Promise<RuleChangeRequestResponse>;
  updateMyRequest: (
    requestId: number,
    newValue: Record<string, any>
  ) => Promise<void>;
  deleteMyRequest: (requestId: number) => Promise<void>;

  // Admin operations
  fetchWorkloadRequests: (workloadId: number, status?: string) => Promise<void>;
  approveRequest: (requestId: number, adminNote?: string) => Promise<void>;
  rejectRequest: (requestId: number, adminNote?: string) => Promise<void>;
}

export function useRuleChangeRequests(): UseRuleChangeRequestsReturn {
  const [requests, setRequests] = useState<RuleChangeRequestResponse[]>([]);
  const [loading, setLoading] = useState(false);

  // ===== SHARED OPERATIONS =====

  /**
   * Fetch my requests - works for both user and admin
   * - User: xem requests của mình
   * - Admin: xem requests mà mình đã xử lý
   * @param status - "pending" | "approved" | "rejected" | undefined (all)
   */
  const fetchMyRequests = useCallback(async (status?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (status) {
        params.append("status", status);
      }

      const url = `/rule-change-requests/my-requests${
        params.toString() ? `?${params.toString()}` : ""
      }`;

      const response = await api.get<RuleChangeRequestListResponse>(url);
      setRequests(response.requests);
    } catch (err: any) {
      console.error("Error fetching my requests:", err);
      toastHelper.error("Failed to load requests");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUpdateRequest = useCallback(
    async (
      data: RuleChangeRequestCreate
    ): Promise<RuleChangeRequestResponse> => {
      try {
        console.log("Creating rule change request:", data);
        const response = await api.post<RuleChangeRequestResponse>(
          "/rule-change-requests/update",
          data
        );

        toastHelper.success(
          "Rule change request created successfully! Waiting for admin approval."
        );

        return response;
      } catch (err: any) {
        console.error("Error creating rule change request:", err);
        const errorMessage =
          err.message || "Failed to create rule change request";
        toastHelper.error(`Failed to create request: ${errorMessage}`);
        throw err;
      }
    },
    []
  );

  const updateMyRequest = useCallback(
    async (requestId: number, newValue: Record<string, any>) => {
      try {
        await api.put(`/rule-change-requests/${requestId}`, {
          new_value: newValue,
        });
        toastHelper.success("Request updated successfully!");

        // Update local state
        setRequests((prev) =>
          prev.map((req) =>
            req.id === requestId ? { ...req, new_value: newValue } : req
          )
        );
      } catch (err: any) {
        console.error("Error updating request:", err);
        const errorMessage = err.message || "Failed to update request";
        toastHelper.error(errorMessage);
        throw err;
      }
    },
    []
  );

  const deleteMyRequest = useCallback(async (requestId: number) => {
    try {
      await api.delete(`/rule-change-requests/${requestId}`);
      toastHelper.success("Request deleted successfully!");

      // Remove from local state
      setRequests((prev) => prev.filter((req) => req.id !== requestId));
    } catch (err: any) {
      console.error("Error deleting request:", err);
      const errorMessage = err.message || "Failed to delete request";
      toastHelper.error(errorMessage);
      throw err;
    }
  }, []);

  // ===== ADMIN OPERATIONS =====

  const fetchWorkloadRequests = useCallback(
    async (workloadId: number, status?: string) => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (status) {
          params.append("status", status);
        }

        const url = `/rule-change-requests/workload/${workloadId}${
          params.toString() ? `?${params.toString()}` : ""
        }`;

        const response = await api.get<RuleChangeRequestListResponse>(url);
        setRequests(response.requests);
      } catch (err: any) {
        console.error("Error fetching workload requests:", err);
        toastHelper.error("Failed to load requests");
        setRequests([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const approveRequest = useCallback(
    async (requestId: number, adminNote?: string) => {
      try {
        await api.post(`/rule-change-requests/${requestId}/approve`, {
          admin_note: adminNote,
        });
        toastHelper.success("Request approved successfully!");

        // Cập nhật status trong local state
        setRequests((prev) =>
          prev.map((req) =>
            req.id === requestId
              ? { ...req, status: "approved" as const, admin_note: adminNote }
              : req
          )
        );
      } catch (err: any) {
        console.error("Error approving request:", err);
        const errorMessage = err.message || "Failed to approve request";
        toastHelper.error(errorMessage);
        throw err;
      }
    },
    []
  );

  const rejectRequest = useCallback(
    async (requestId: number, adminNote?: string) => {
      try {
        await api.post(`/rule-change-requests/${requestId}/reject`, {
          admin_note: adminNote,
        });
        toastHelper.success("Request rejected");

        // Cập nhật status trong local state
        setRequests((prev) =>
          prev.map((req) =>
            req.id === requestId
              ? { ...req, status: "rejected" as const, admin_note: adminNote }
              : req
          )
        );
      } catch (err: any) {
        console.error("Error rejecting request:", err);
        const errorMessage = err.message || "Failed to reject request";
        toastHelper.error(errorMessage);
        throw err;
      }
    },
    []
  );

  return {
    requests,
    loading,

    // Shared operations
    fetchMyRequests,
    createUpdateRequest,
    updateMyRequest,
    deleteMyRequest,

    // Admin operations
    fetchWorkloadRequests,
    approveRequest,
    rejectRequest,
  };
}
