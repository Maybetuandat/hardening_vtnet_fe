// File: src/components/work-loads/workload-detail/workload-servers-tab.tsx

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server } from "lucide-react";
import { Server as ServerType } from "@/types/workload-detail";
import { getServerStatusColor, formatDate } from "@/utils/workload-utils";

interface WorkloadServersTabProps {
  servers: ServerType[];
}

export const WorkloadServersTab: React.FC<WorkloadServersTabProps> = ({
  servers,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assigned Servers</CardTitle>
        <p className="text-sm text-muted-foreground">
          Servers that are part of this workload
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {servers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No servers assigned to this workload.
              </p>
            </div>
          ) : (
            servers.map((server) => (
              <Card key={server.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Server className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{server.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {server.ip_address} • {server.os}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last check: {formatDate(server.last_check)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        Compliance: {server.compliance_score}%
                      </p>
                      <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${server.compliance_score}%` }}
                        ></div>
                      </div>
                    </div>
                    <Badge className={getServerStatusColor(server.status)}>
                      {server.status}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
