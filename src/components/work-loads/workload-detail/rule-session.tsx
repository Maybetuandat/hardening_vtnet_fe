import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRules, RuleResponse } from "@/hooks/rule/use-rules";
import { CreateRuleDialog } from "./create-rule-dialog";
import { DeleteRuleDialog } from "./delete-rule-dialog";
import { EditRuleDialog } from "./edit-rule-dialog";

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
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [isSearching, setIsSearching] = useState(false); // ✅ Track search state

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<RuleResponse | null>(null);
  const [deletingRule, setDeletingRule] = useState<RuleResponse | null>(null);

  const { rules, loading, error, totalRules, totalPages, fetchRules } =
    useRules();

  // ✅ Fetch rules based on search state
  useEffect(() => {
    const fetchParams = {
      keyword: searchKeyword || undefined,
      workload_id: isSearching ? undefined : workloadId, // ✅ Only pass workloadId when not searching
      page: currentPage,
      page_size: pageSize,
    };

    console.log("Fetching rules with params:", fetchParams);
    fetchRules(fetchParams);
  }, [workloadId, currentPage, searchKeyword, isSearching, fetchRules]);

  // ✅ Handle search input change
  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    setCurrentPage(1); // Reset to first page when searching
    setIsSearching(value.trim() !== ""); // ✅ Set search state based on input
  };

  // ✅ Clear search and return to workload-specific rules
  const handleClearSearch = () => {
    setSearchKeyword("");
    setCurrentPage(1);
    setIsSearching(false); // ✅ Return to workload-specific mode
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRuleCreated = () => {
    setIsCreateDialogOpen(false);
    // ✅ Refresh with current search state
    fetchRules({
      keyword: searchKeyword || undefined,
      workload_id: isSearching ? undefined : workloadId,
      page: currentPage,
      page_size: pageSize,
    });
  };

  const handleRuleUpdated = () => {
    setEditingRule(null);
    // ✅ Refresh with current search state
    fetchRules({
      keyword: searchKeyword || undefined,
      workload_id: isSearching ? undefined : workloadId,
      page: currentPage,
      page_size: pageSize,
    });
  };

  const handleRuleDeleted = () => {
    setDeletingRule(null);
    // If deleted rule was selected, clear selection
    if (deletingRule && selectedRuleId === deletingRule.id) {
      onRuleSelect(null);
    }
    // ✅ Refresh with current search state
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
              onClick={() => setIsCreateDialogOpen(true)}
              size="sm"
              className="h-8"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm Rule
            </Button>
          </div>

          {/* ✅ Enhanced Search with clear button */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={
                isSearching
                  ? "Tìm kiếm trong tất cả rules..."
                  : "Tìm kiếm rules của workload này..."
              }
              value={searchKeyword}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-10"
            />
            {/* ✅ Clear search button */}
            {searchKeyword && (
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

          {/* ✅ Search mode indicator */}
          {isSearching && (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  Đang tìm kiếm trong tất cả rules của hệ thống
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSearch}
                className="h-7"
              >
                Quay lại rules của workload
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
                  ? "Không tìm thấy rule nào"
                  : isSearching
                  ? "Không có rule nào trong hệ thống"
                  : "Workload này chưa có rule nào"}
              </p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên</TableHead>
                      <TableHead>Mức độ</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      {/* ✅ Show workload column when searching all rules */}
                      {isSearching && <TableHead>Workload</TableHead>}
                      <TableHead className="w-[100px]">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rules.map((rule) => (
                      <TableRow
                        key={rule.id}
                        className={`cursor-pointer ${
                          selectedRuleId === rule.id ? "bg-muted" : ""
                        }`}
                        onClick={() => onRuleSelect(rule.id)}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">{rule.name}</p>
                            {rule.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {rule.description}
                              </p>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              rule.is_active
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                            }
                          >
                            {rule.is_active ? "Hoạt động" : "Tạm dừng"}
                          </Badge>
                        </TableCell>
                        {/* ✅ Show workload info when searching */}
                        {isSearching && (
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              Workload ID: {rule.workload_id}
                            </span>
                          </TableCell>
                        )}
                        <TableCell>
                          <DropdownMenu modal={false}>
                            <DropdownMenuTrigger
                              asChild
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRuleSelect(rule.id);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Xem Commands
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingRule(rule);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingRule(rule);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Hiển thị {(currentPage - 1) * pageSize + 1} -{" "}
                  {Math.min(currentPage * pageSize, totalRules)} trong{" "}
                  {totalRules} rules
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateRuleDialog
        workloadId={workloadId}
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleRuleCreated}
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
