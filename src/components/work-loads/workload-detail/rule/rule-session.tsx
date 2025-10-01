// src/components/work-loads/workload-detail/rule/rule-session.tsx
// UPDATED VERSION - Thêm button View Requests

import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { AdminOnly } from "@/components/auth/role-guard";

import { Search, X, FileSpreadsheet, Bell } from "lucide-react";

import { useRules } from "@/hooks/rule/use-rules";

import { DeleteRuleDialog } from "./delete-rule-dialog";
import { EditRuleDialog } from "./edit-rule-dialog";
import { RuleExcelUploadDialog } from "./rule-excel-upload-dialog";
import { RuleViewDialog } from "./rule-view-dialog";
import { RuleResponse } from "@/types/rule";
import { Pagination } from "@/components/ui/pagination";

import { RulesTable } from "./rule-table";

interface RulesSectionProps {
  workloadId: number;
  onRuleSelect: (ruleId: number | null) => void;
  selectedRuleId: number | null;
  onOpenRequests?: () => void;
  showRequestsButton?: boolean;
}

export const RulesSection = forwardRef<
  { refreshRules: () => void },
  RulesSectionProps
>(
  (
    {
      workloadId,
      onRuleSelect,
      selectedRuleId,
      onOpenRequests,
      showRequestsButton = false,
    },
    ref
  ) => {
    const { t } = useTranslation("workload");
    const [searchInput, setSearchInput] = useState("");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isSearching, setIsSearching] = useState(false);

    // Dialog states
    const [isExcelUploadOpen, setIsExcelUploadOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<RuleResponse | null>(null);
    const [deletingRule, setDeletingRule] = useState<RuleResponse | null>(null);
    const [viewingRule, setViewingRule] = useState<RuleResponse | null>(null);

    const { rules, loading, error, totalRules, totalPages, fetchRules } =
      useRules();

    const doFetchRules = () => {
      const fetchParams = {
        keyword: searchKeyword || undefined,
        workload_id: workloadId,
        page: currentPage,
        page_size: pageSize,
      };

      console.log("Fetching rules with params:", fetchParams);
      fetchRules(fetchParams);
    };

    // Expose refresh function to parent
    useImperativeHandle(ref, () => ({
      refreshRules: doFetchRules,
    }));

    useEffect(() => {
      doFetchRules();
    }, [workloadId, currentPage, pageSize, searchKeyword, isSearching]);

    useEffect(() => {
      if (searchInput === "") handleClearSearch();
    }, [searchInput]);

    const handleSearchInputChange = (value: string) => {
      setSearchInput(value);
    };

    const handleSearchSubmit = (value: string) => {
      const trimmedValue = value.trim();
      setSearchKeyword(trimmedValue);
      setCurrentPage(1);
      setIsSearching(trimmedValue !== "");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearchSubmit(searchInput);
      }
    };

    const handleClearSearch = () => {
      setSearchInput("");
      setSearchKeyword("");
      setCurrentPage(1);
      setIsSearching(false);
    };

    const handlePageChange = (page: number) => {
      setCurrentPage(page);
    };

    const handlePageSizeChange = (newPageSize: number) => {
      setPageSize(newPageSize);
      setCurrentPage(1);
    };

    const handleRulesUploaded = () => {
      setIsExcelUploadOpen(false);
      doFetchRules();
    };

    const handleRuleUpdated = () => {
      setEditingRule(null);
      doFetchRules();
    };

    const handleRuleDeleted = () => {
      setDeletingRule(null);

      if (deletingRule && selectedRuleId === deletingRule.id) {
        onRuleSelect(null);
      }

      doFetchRules();
    };

    return (
      <>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                {t("workloadDetail.rules.title.workload", {
                  count: totalRules,
                })}
              </CardTitle>

              <div className="flex gap-2">
                {/* Button View Requests - CHỈ HIỂN THỊ VỚI ADMIN */}
                {showRequestsButton && onOpenRequests && (
                  <Button
                    onClick={onOpenRequests}
                    variant="outline"
                    size="sm"
                    className="h-8 flex items-center gap-2"
                  >
                    <Bell className="h-4 w-4" />
                    View Requests
                  </Button>
                )}

                {/* Button Add Rules from Excel */}
                <AdminOnly>
                  <Button
                    onClick={() => setIsExcelUploadOpen(true)}
                    size="sm"
                    className="h-8 flex items-center gap-2"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    {t("workloadDetail.rules.actions.addFromExcel")}
                  </Button>
                </AdminOnly>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={
                  isSearching
                    ? t("workloadDetail.rules.search.placeholderAll")
                    : t("workloadDetail.rules.search.placeholderWorkload")
                }
                value={searchInput}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 pr-10"
              />
              {searchInput && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500">
                  {t("workloadDetail.rules.error", { error })}
                </p>
              </div>
            ) : rules.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchKeyword
                    ? t("workloadDetail.rules.empty.noRulesFound", {
                        keyword: searchKeyword,
                      })
                    : isSearching
                    ? t("workloadDetail.rules.empty.noRulesSystem")
                    : t("workloadDetail.rules.empty.noRulesWorkload")}
                </p>
                {searchInput && searchInput !== searchKeyword && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {t("workloadDetail.rules.search.pressEnterSearch", {
                      query: searchInput,
                    })}
                  </p>
                )}
              </div>
            ) : (
              <>
                <RulesTable
                  rules={rules}
                  selectedRuleId={selectedRuleId}
                  onRuleSelect={onRuleSelect}
                  onViewRule={(rule) => setViewingRule(rule)}
                  onEditRule={(rule) => setEditingRule(rule)}
                  onDeleteRule={(rule) => setDeletingRule(rule)}
                />

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalElements={totalRules}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  loading={loading}
                  showInfo={true}
                  showPageSizeSelector={true}
                  pageSizeOptions={[5, 10, 20, 50, 100]}
                />
              </>
            )}
          </CardContent>
        </Card>

        <AdminOnly>
          <RuleExcelUploadDialog
            workloadId={workloadId}
            open={isExcelUploadOpen}
            onOpenChange={setIsExcelUploadOpen}
            onSuccess={handleRulesUploaded}
          />
        </AdminOnly>

        <RuleViewDialog
          open={!!viewingRule}
          onOpenChange={() => setViewingRule(null)}
          rule={viewingRule}
        />

        {editingRule && (
          <EditRuleDialog
            rule={editingRule}
            open={!!editingRule}
            onOpenChange={() => setEditingRule(null)}
            onSuccess={handleRuleUpdated}
          />
        )}

        {deletingRule && (
          <DeleteRuleDialog
            rule={deletingRule}
            open={!!deletingRule}
            onOpenChange={() => setDeletingRule(null)}
            onSuccess={handleRuleDeleted}
          />
        )}
      </>
    );
  }
);

RulesSection.displayName = "RulesSection";
