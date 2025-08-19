import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { WorkloadType } from "@/types/workload";

// Component imports
import { WorkloadDetailHeader } from "@/components/work-loads/workload-detail/workload-detail-header";
import { WorkloadOverviewCards } from "@/components/work-loads/workload-detail/workload-overview-cards";

import { WorkloadRulesTab } from "@/components/work-loads/workload-detail/workload-rules-tab";
import { WorkloadServersTab } from "@/components/work-loads/workload-detail/workload-servers-tab";
import { WorkloadSettingsTab } from "@/components/work-loads/workload-detail/workload-settings-tab";

// Types and utils
import { WorkloadDetail, Rule, Server } from "@/types/workload-detail";
import {
  getMockWorkloadDetail,
  getMockRules,
  getMockServers,
} from "@/utils/mock-data";
import { WorkloadOverviewTab } from "@/components/work-loads/workload-detail/workload-overview-tab";

export default function WorkloadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation("workload");

  const [workload, setWorkload] = useState<WorkloadDetail | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkloadDetail = async () => {
      setLoading(true);
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (id) {
          setWorkload(getMockWorkloadDetail(id));
          setRules(getMockRules());
          setServers(getMockServers());
        }
      } catch (error) {
        console.error("Error fetching workload detail:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkloadDetail();
  }, [id]);

  const handleEditBasicInfo = () => {
    console.log("Edit basic info");
    // Implement edit basic info functionality
  };

  const handleEditMetadata = () => {
    console.log("Edit metadata");
    // Implement edit metadata functionality
  };

  const handleEditRule = (rule: Rule) => {
    console.log("Edit rule:", rule);
    // Implement edit functionality
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-20 bg-gray-200 rounded-lg"></div>
          <div className="h-40 bg-gray-200 rounded-lg"></div>
          <div className="h-60 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!workload) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Workload Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              The workload you're looking for doesn't exist.
            </p>
            <Button onClick={() => window.history.back()} className="mt-4">
              Back to Workloads
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <WorkloadDetailHeader workload={workload} />

      {/* Overview Cards */}
      <WorkloadOverviewCards workload={workload} />

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rules">Rules ({rules.length})</TabsTrigger>
          <TabsTrigger value="servers">Servers ({servers.length})</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <WorkloadOverviewTab
            workload={workload}
            onEditBasicInfo={handleEditBasicInfo}
            onEditMetadata={handleEditMetadata}
          />
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <WorkloadRulesTab rules={rules} onEditRule={handleEditRule} />
        </TabsContent>

        <TabsContent value="servers" className="space-y-6">
          <WorkloadServersTab servers={servers} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <WorkloadSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
