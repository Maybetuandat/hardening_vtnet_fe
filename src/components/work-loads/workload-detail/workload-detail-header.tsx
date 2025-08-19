import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Pause } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WorkloadType } from "@/types/workload";
import { getWorkloadIcon } from "@/utils/workload-utils";

interface WorkloadDetailHeaderProps {
  workload: {
    id: number;
    display_name: string;
    description: string;
    workload_type: WorkloadType;
    is_active: boolean;
  };
}

export const WorkloadDetailHeader: React.FC<WorkloadDetailHeaderProps> = ({
  workload,
}) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/workloads")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="p-2 bg-primary/10 rounded-lg">
            {getWorkloadIcon(workload.workload_type)}
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <CardTitle className="text-2xl font-bold">
                {workload.display_name}
              </CardTitle>
              <Badge
                variant={workload.is_active ? "default" : "secondary"}
                className="flex items-center space-x-1"
              >
                {workload.is_active ? (
                  <Play className="h-3 w-3" />
                ) : (
                  <Pause className="h-3 w-3" />
                )}
                <span>{workload.is_active ? "Active" : "Inactive"}</span>
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">{workload.description}</p>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};
