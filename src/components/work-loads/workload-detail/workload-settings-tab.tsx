// File: src/components/work-loads/workload-detail/workload-settings-tab.tsx

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const WorkloadSettingsTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workload Settings</CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure workload settings and preferences
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">General Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Scan Frequency</label>
                <select className="w-full p-2 border border-input rounded-md bg-background">
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Alert Level</label>
                <select className="w-full p-2 border border-input rounded-md bg-background">
                  <option>Critical Only</option>
                  <option>High and Critical</option>
                  <option>All Levels</option>
                </select>
              </div>
            </div>
          </div>
          <Separator />
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Notifications</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive email alerts for rule violations
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Slack Integration</p>
                  <p className="text-sm text-muted-foreground">
                    Send alerts to Slack channels
                  </p>
                </div>
                <input type="checkbox" className="w-4 h-4" />
              </div>
            </div>
          </div>
          <Separator />
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Advanced Settings</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-remediation</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically fix common security issues
                  </p>
                </div>
                <input type="checkbox" className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Detailed Logging</p>
                  <p className="text-sm text-muted-foreground">
                    Enable verbose logging for debugging
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
