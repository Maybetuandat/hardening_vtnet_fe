// File: src/utils/workload-utils.ts

import React from "react";
import { WorkloadType } from "@/types/workload";
import { Database, Globe, Package, BarChart3 } from "lucide-react";

export const getWorkloadTypeLabel = (type: WorkloadType): string => {
  switch (type) {
    case WorkloadType.OS:
      return "Operating System";
    case WorkloadType.DATABASE:
      return "Database";
    case WorkloadType.APP:
      return "Application";
    case WorkloadType.BIG_DATA:
      return "Big Data";
    default:
      return "Unknown";
  }
};

export const getWorkloadIcon = (type: WorkloadType) => {
  switch (type) {
    case WorkloadType.OS:
      return React.createElement(Package, {
        className: "h-6 w-6 text-primary",
      });
    case WorkloadType.DATABASE:
      return React.createElement(Database, {
        className: "h-6 w-6 text-primary",
      });
    case WorkloadType.APP:
      return React.createElement(Globe, { className: "h-6 w-6 text-primary" });
    case WorkloadType.BIG_DATA:
      return React.createElement(BarChart3, {
        className: "h-6 w-6 text-primary",
      });
    default:
      return React.createElement(Package, {
        className: "h-6 w-6 text-primary",
      });
  }
};

export const getServerStatusColor = (status: string): string => {
  switch (status) {
    case "online":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "offline":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    case "maintenance":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return dateString;
  }
};

export const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case "low":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "high":
      return "bg-orange-100 text-orange-800 hover:bg-orange-200";
    case "critical":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

export const getExecutionStatusColor = (status: string): string => {
  switch (status) {
    case "success":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "failed":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};
