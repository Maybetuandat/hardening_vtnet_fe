import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { Rule } from "@/types/workload-detail";
import { RulesFilterSection } from "@/components/work-loads/workload-detail/rules-filter-section";
import { RuleCard } from "@/components/work-loads/workload-detail/rule-card";
import { Pagination } from "@/components/ui/pagination";

interface WorkloadRulesTabProps {
  rules: Rule[];
  onEditRule: (rule: Rule) => void;
}

export const WorkloadRulesTab: React.FC<WorkloadRulesTabProps> = ({
  rules,
  onEditRule,
}) => {
  // Pagination states for rules
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Search and filter states for rules
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Filter and search rules
  const filteredRules = rules.filter((rule) => {
    const matchesSearch =
      rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity =
      severityFilter === "all" || rule.severity === severityFilter;
    const matchesStatus =
      statusFilter === "all" || rule.execution_status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredRules.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRules = filteredRules.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, severityFilter, statusFilter, itemsPerPage]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setSeverityFilter("all");
    setStatusFilter("all");
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newPageSize: number) => {
    setItemsPerPage(newPageSize);
    setCurrentPage(1);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Security Rules</CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage security rules and policies for this workload
            </p>
          </div>
          <Button className="flex items-center space-x-2">
            <Edit className="h-4 w-4" />
            <span>Add Rule</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters and Search */}
        <RulesFilterSection
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          severityFilter={severityFilter}
          setSeverityFilter={setSeverityFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          itemsPerPage={itemsPerPage}
          handleItemsPerPageChange={(value: string) =>
            handleItemsPerPageChange(Number(value))
          }
          filteredCount={filteredRules.length}
          totalCount={rules.length}
          onClearFilters={handleClearFilters}
        />

        {/* Rules List */}
        <div className="space-y-4 mt-4">
          {paginatedRules.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No rules found matching your criteria.
              </p>
            </div>
          ) : (
            paginatedRules.map((rule) => (
              <RuleCard key={rule.id} rule={rule} onEdit={onEditRule} />
            ))
          )}
        </div>

        {/* Pagination - chỉ hiển thị khi có rules và nhiều hơn 1 trang */}
        {filteredRules.length > 0 && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={filteredRules.length}
            pageSize={itemsPerPage}
            onPageChange={handlePageChange}
            onPageSizeChange={handleItemsPerPageChange}
            showInfo={true}
            showPageSizeSelector={true}
            pageSizeOptions={[5, 10, 20, 30]}
          />
        )}
      </CardContent>
    </Card>
  );
};
