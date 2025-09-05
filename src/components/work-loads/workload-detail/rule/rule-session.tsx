import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Search, X, FileSpreadsheet } from "lucide-react";

import { useRules } from "@/hooks/rule/use-rules";

import { DeleteRuleDialog } from "./delete-rule-dialog";
import { EditRuleDialog } from "./edit-rule-dialog";
import { RuleExcelUploadDialog } from "./rule-excel-upload-dialog";
import { RuleResponse } from "@/types/rule";
import { Pagination } from "@/components/ui/pagination"; // Import component Pagination

import { RulesTable } from "./rule-table";

interface RulesSectionProps {
  workloadId: number;
  onRuleSelect: (ruleId: number | null) => void;
  selectedRuleId: number | null;
}

export const RulesSection: React.FC<RulesSectionProps> = ({
  workloadId,
  onRuleSelect,
  selectedRuleId,
}) => {
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Cho phép thay đổi pageSize
  const [isSearching, setIsSearching] = useState(false);

  // Dialog states
  const [isExcelUploadOpen, setIsExcelUploadOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<RuleResponse | null>(null);
  const [deletingRule, setDeletingRule] = useState<RuleResponse | null>(null);

  const { rules, loading, error, totalRules, totalPages, fetchRules } =
    useRules();

  useEffect(() => {
    const fetchParams = {
      keyword: searchKeyword || undefined,
      workload_id: isSearching ? undefined : workloadId,
      page: currentPage,
      page_size: pageSize,
    };

    console.log("Fetching rules with params:", fetchParams);
    fetchRules(fetchParams);
  }, [
    workloadId,
    currentPage,
    pageSize,
    searchKeyword,
    isSearching,
    fetchRules,
  ]);

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
    setCurrentPage(1); // Reset về trang đầu khi thay đổi page size
  };

  const handleRulesUploaded = () => {
    setIsExcelUploadOpen(false);

    fetchRules({
      keyword: searchKeyword || undefined,
      workload_id: isSearching ? undefined : workloadId,
      page: currentPage,
      page_size: pageSize,
    });
  };

  const handleRuleUpdated = () => {
    setEditingRule(null);
    fetchRules({
      keyword: searchKeyword || undefined,
      workload_id: isSearching ? undefined : workloadId,
      page: currentPage,
      page_size: pageSize,
    });
  };

  const handleRuleDeleted = () => {
    setDeletingRule(null);

    if (deletingRule && selectedRuleId === deletingRule.id) {
      onRuleSelect(null);
    }

    fetchRules({
      keyword: searchKeyword || undefined,
      workload_id: isSearching ? undefined : workloadId,
      page: currentPage,
      page_size: pageSize,
    });
  };

  const getTitle = () => {
    if (isSearching) {
      return `Tìm kiếm Rules (${totalRules})`;
    }
    return `Rules của Workload (${totalRules})`;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{getTitle()}</CardTitle>

            <Button
              onClick={() => setIsExcelUploadOpen(true)}
              size="sm"
              className="h-8 flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Thêm Rules từ Excel
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={
                isSearching
                  ? "Nhấn Enter để tìm kiếm trong tất cả rules..."
                  : "Nhấn Enter để tìm kiếm rules của workload này..."
              }
              value={searchInput}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-10"
            />
            {/* Clear search button */}
            {(searchInput || searchKeyword) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {searchInput && searchInput !== searchKeyword && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-yellow-50 border border-yellow-200 rounded-lg p-2">
              <Search className="h-4 w-4 text-yellow-600" />
              <span>Nhấn Enter để tìm kiếm "{searchInput}"</span>
            </div>
          )}

          {isSearching && (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  Đang tìm kiếm trong tất cả rules với từ khóa: "{searchKeyword}
                  "
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSearch}
                className="h-7"
              >
                Xóa tìm kiếm
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Có lỗi xảy ra: {error}</p>
            </div>
          ) : rules.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchKeyword
                  ? `Không tìm thấy rule nào với từ khóa "${searchKeyword}"`
                  : isSearching
                  ? "Không có rule nào trong hệ thống"
                  : "Workload này chưa có rule nào"}
              </p>
              {searchInput && searchInput !== searchKeyword && (
                <p className="text-sm text-muted-foreground mt-2">
                  Nhấn Enter để tìm kiếm "{searchInput}"
                </p>
              )}
            </div>
          ) : (
            <>
              <RulesTable
                rules={rules}
                selectedRuleId={selectedRuleId}
                onRuleSelect={onRuleSelect}
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

      <RuleExcelUploadDialog
        workloadId={workloadId}
        open={isExcelUploadOpen}
        onOpenChange={setIsExcelUploadOpen}
        onSuccess={handleRulesUploaded}
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
};
