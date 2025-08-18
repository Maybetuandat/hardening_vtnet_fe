import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Server, Database, Globe, BarChart3, Edit, Trash2 } from "lucide-react";
import { Workload, WorkloadType } from "@/types/workload";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";

interface WorkloadCardProps {
  workload: Workload;
  onEdit: (workload: Workload) => void;
  onDelete: (workload: Workload) => void;
  getNumberOfServersByWorkload: (workloadId: number) => Promise<number>;
}

const getWorkloadIcon = (type: WorkloadType) => {
  switch (type) {
    case WorkloadType.OS:
      return <Server className="h-5 w-5" />;
    case WorkloadType.DATABASE:
      return <Database className="h-5 w-5" />;
    case WorkloadType.APP:
      return <Globe className="h-5 w-5" />;
    case WorkloadType.BIG_DATA:
      return <BarChart3 className="h-5 w-5" />;
    default:
      return <Server className="h-5 w-5" />;
  }
};

const getWorkloadTypeLabel = (type: WorkloadType) => {
  switch (type) {
    case WorkloadType.OS:
      return "OS";
    case WorkloadType.DATABASE:
      return "Database";
    case WorkloadType.APP:
      return "Application";
    case WorkloadType.BIG_DATA:
      return "Big Data";
    default:
      return type;
  }
};

const getWorkloadTypeColor = (type: WorkloadType) => {
  switch (type) {
    case WorkloadType.OS:
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case WorkloadType.DATABASE:
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
    case WorkloadType.APP:
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case WorkloadType.BIG_DATA:
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

const getComplianceStandard = (type: WorkloadType) => {
  switch (type) {
    case WorkloadType.OS:
      return "CIS Benchmarks";
    case WorkloadType.DATABASE:
      return "PCI DSS";
    case WorkloadType.APP:
      return "ISO 27001";
    case WorkloadType.BIG_DATA:
      return "Custom";
    default:
      return "Standard";
  }
};

export default function WorkloadCard({
  workload,
  onEdit,
  onDelete,
  getNumberOfServersByWorkload,
}: WorkloadCardProps) {
  const { t } = useTranslation("workload");
  const navigate = useNavigate();
  const [serverCount, setServerCount] = useState<number | null>(null);

  React.useEffect(() => {
    const fetchServerCount = async () => {
      try {
        const count = await getNumberOfServersByWorkload(workload.id);
        setServerCount(count);
      } catch (error) {
        console.error("Error fetching server count:", error);
        setServerCount(0);
      }
    };

    fetchServerCount();
  }, [workload.id, getNumberOfServersByWorkload]);

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation when clicking on action buttons
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    navigate(`/workload/${workload.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(workload);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(workload);
  };

  return (
    <Card
      className="group hover:shadow-md transition-all duration-200 cursor-pointer hover:border-primary/50"
      onClick={handleCardClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            {/* Icon */}
            <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              {getWorkloadIcon(workload.workload_type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                  {workload.display_name || workload.name}
                </h3>
                <Badge
                  variant={workload.is_active ? "default" : "secondary"}
                  className="shrink-0"
                >
                  {workload.is_active
                    ? t("workloads.active")
                    : t("workloads.inactive")}
                </Badge>
              </div>

              {/* Name (if different from display_name) */}
              {workload.display_name &&
                workload.display_name !== workload.name && (
                  <p className="text-sm text-muted-foreground font-mono mb-2">
                    {workload.name}
                  </p>
                )}

              {/* Description */}
              {workload.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {workload.description}
                </p>
              )}

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Badge
                    variant="outline"
                    className={getWorkloadTypeColor(workload.workload_type)}
                  >
                    {getWorkloadTypeLabel(workload.workload_type)}
                  </Badge>
                </div>

                <div className="flex items-center space-x-1">
                  <Server className="h-4 w-4" />
                  <span>
                    {serverCount !== null
                      ? `${serverCount} servers`
                      : "Loading..."}
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  <span className="text-xs">
                    {getComplianceStandard(workload.workload_type)}
                  </span>
                </div>
              </div>

              {/* Timestamps */}
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    Created:{" "}
                    {new Date(workload.created_at).toLocaleDateString()}
                  </span>
                  <span>
                    Updated:{" "}
                    {new Date(workload.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="flex items-center space-x-1"
            >
              <Edit className="h-3 w-3" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:border-red-300"
            >
              <Trash2 className="h-3 w-3" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>

        {/* Click hint */}
        <div className="mt-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          Click to view details
        </div>
      </CardContent>
    </Card>
  );
}
