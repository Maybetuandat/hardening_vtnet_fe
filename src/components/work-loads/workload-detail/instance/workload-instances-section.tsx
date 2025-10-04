import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Server, Loader2, AlertTriangle, Plus } from "lucide-react";
import { useWorkloadInstances } from "@/hooks/workload/use-workload-instances";
import { InstanceList } from "@/components/instances/index/instance-list";
import { AssignInstancesDialog } from "./assign-instances-dialog";
import FilterBar from "@/components/ui/filter-bar";
import { Pagination } from "@/components/ui/pagination";

interface WorkloadInstancesSectionProps {
  workloadId: number;
}

export const WorkloadInstancesSection: React.FC<
  WorkloadInstancesSectionProps
> = ({ workloadId }) => {
  const { t } = useTranslation("workload");
  const {
    instances,
    loading,
    error,
    totalItems,
    totalPages,
    currentPage,
    pageSize,
    fetchInstancesByWorkload,
  } = useWorkloadInstances();

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (workloadId) {
      fetchInstancesByWorkload(workloadId, searchTerm, currentPage, pageSize);
    }
  }, [workloadId, searchTerm, currentPage, pageSize, fetchInstancesByWorkload]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    // Search sẽ được trigger tự động qua useEffect khi searchTerm thay đổi
  };

  const handleSearchSubmit = () => {
    // Trigger search khi nhấn Enter
    fetchInstancesByWorkload(workloadId, searchTerm, 1, pageSize);
  };

  const handleSearchClear = () => {
    setSearchTerm("");
    // useEffect sẽ tự động fetch lại khi searchTerm = ""
  };

  const handlePageChange = (page: number) => {
    // currentPage được quản lý trong hook, nên chỉ cần gọi lại fetch với page mới
    fetchInstancesByWorkload(workloadId, searchTerm, page, pageSize);
  };

  const handleAssignSuccess = () => {
    // Refresh lại danh sách sau khi assign thành công
    fetchInstancesByWorkload(workloadId, searchTerm, currentPage, pageSize);
  };

  // Loading state cho lần đầu load
  if (loading && currentPage === 1 && !searchTerm) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {t("workloadDetail.instances.loading")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-destructive">
            <AlertTriangle className="h-8 w-8 mb-4" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasInstances = instances && instances.length > 0;

  // Empty state - chưa có instance nào
  if (!hasInstances && !searchTerm) {
    return (
      <>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                {t("workloadDetail.instances.title")}
              </CardTitle>
              <Button
                onClick={() => setAssignDialogOpen(true)}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {t("workloadDetail.instances.assign.button")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Server className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                {t("workloadDetail.instances.empty.noInstances")}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t("workloadDetail.instances.empty.description")}
              </p>
              <Button
                onClick={() => setAssignDialogOpen(true)}
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("workloadDetail.instances.assign.button")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <AssignInstancesDialog
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          workloadId={workloadId}
          onSuccess={handleAssignSuccess}
        />
      </>
    );
  }

  // Main content - có data hoặc đang search
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              {t("workloadDetail.instances.title")}
              {totalItems > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({totalItems})
                </span>
              )}
            </CardTitle>
            <Button
              onClick={() => setAssignDialogOpen(true)}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {t("workloadDetail.instances.assign.button")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="mb-4">
            <FilterBar
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
              onSearchClear={handleSearchClear}
              placeholder={
                t("workloadDetail.instances.search.placeholder") ||
                "Search instances by name, IP, or hostname..."
              }
            />
          </div>

          {/* Instance List */}
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !hasInstances ? (
            <div className="text-center py-8">
              <Server className="h-8 w-8 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground">
                {t("workloadDetail.instances.empty.noResults") ||
                  "No instances found"}
              </p>
              {searchTerm && (
                <Button
                  variant="link"
                  onClick={handleSearchClear}
                  className="mt-2"
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <>
              <InstanceList
                instances={instances}
                loading={false}
                error={null}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    pageSize={pageSize}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <AssignInstancesDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        workloadId={workloadId}
        onSuccess={handleAssignSuccess}
      />
    </>
  );
};
