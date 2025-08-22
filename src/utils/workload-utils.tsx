// File: src/utils/workload-utils.tsx

import React from "react";
import {
  Server,
  Database,
  Globe,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

export const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    case "high":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
    case "medium":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "low":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case "success":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "failed":
    case "error":
      return <XCircle className="h-4 w-4 text-red-600" />;
    case "pending":
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    default:
      return <AlertTriangle className="h-4 w-4 text-gray-600" />;
  }
};

export const getServerStatusColor = (status: string) => {
  switch (status) {
    case "online":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "offline":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    case "maintenance":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};
