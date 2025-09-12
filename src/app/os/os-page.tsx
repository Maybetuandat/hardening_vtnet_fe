import React, { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import FilterBar from "@/components/ui/filter-bar";
import { Pagination } from "@/components/ui/pagination";
import { OSHeader } from "@/components/os/os-header";
import { OSTable } from "@/components/os/os-table";
import { OSFormDialog } from "@/components/os/os-form-dialog";
import { OSDeleteDialog } from "@/components/os/os-delete-dialog";
import { useOS } from "@/hooks/os/use-os";
import { OSVersion, OSCreate, OSUpdate } from "@/types/os";
import { use } from "i18next";
import { useTranslation } from "react-i18next";

export default function OSPage() {
  const {
    osVersions,
    loading,
    error,
    totalItems,
    currentPage,
    totalPages,
    pageSize,
    fetchOSVersions,
    createOSVersion,
    updateOSVersion,
    deleteOSVersion,
    searchOSVersions,
  } = useOS();

  // Local state for UI
  const [searchInput, setSearchInput] = useState(""); // Input hiển thị
  const [currentSearchTerm, setCurrentSearchTerm] = useState(""); // Search term thực tế
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingOS, setEditingOS] = useState<OSVersion | null>(null);
  const [deletingOS, setDeletingOS] = useState<OSVersion | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const { t } = useTranslation("os");
  // Handle search input change (chỉ update input, chưa search)
  const handleSearchInputChange = useCallback(
    (value: string) => {
      setSearchInput(value);

      // Nếu xóa hết thì tự động search
      if (value === "" && currentSearchTerm !== "") {
        setCurrentSearchTerm("");
        searchOSVersions("", 1, pageSize);
      }
    },
    [currentSearchTerm, searchOSVersions, pageSize]
  );

  const handleSearchClear = useCallback(() => {
    setCurrentSearchTerm("");
    searchOSVersions("", 1, pageSize); // Fetch với keyword rỗng
  }, [searchOSVersions, pageSize]);

  // Handle actual search (khi ấn Enter hoặc form submit)
  const handleSearchSubmit = useCallback(() => {
    setCurrentSearchTerm(searchInput);
    searchOSVersions(searchInput, 1, pageSize);
  }, [searchInput, searchOSVersions, pageSize]);

  // Handle Enter key press
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearchSubmit();
      }
    },
    [handleSearchSubmit]
  );

  // Event handlers
  const handleRefresh = useCallback(() => {
    fetchOSVersions(currentSearchTerm, currentPage, pageSize);
    toast.success("Dữ liệu đã được làm mới");
  }, [fetchOSVersions, currentSearchTerm, currentPage, pageSize]);

  const handlePageChange = useCallback(
    (page: number) => {
      searchOSVersions(currentSearchTerm, page, pageSize);
    },
    [searchOSVersions, currentSearchTerm, pageSize]
  );

  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      searchOSVersions(currentSearchTerm, 1, newPageSize);
    },
    [searchOSVersions, currentSearchTerm]
  );

  const handleAddClick = () => {
    setEditingOS(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (os: OSVersion) => {
    setEditingOS(os);
    setFormDialogOpen(true);
  };

  const handleDelete = (os: OSVersion) => {
    setDeletingOS(os);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: OSCreate | OSUpdate) => {
    setFormLoading(true);
    try {
      if (editingOS) {
        await updateOSVersion(editingOS.id, data as OSUpdate);
      } else {
        await createOSVersion(data as OSCreate);
      }
    } catch (error) {
      // Error được handle trong hook và hiển thị toast
    } finally {
      setFormLoading(false);
      setFormDialogOpen(false); // Luôn đóng dialog sau khi submit
    }
  };

  const handleDeleteConfirm = async (osId: number) => {
    try {
      await deleteOSVersion(osId);
      setDeleteDialogOpen(false);
    } catch (error) {
      // Error được handle trong hook và hiển thị toast
    }
  };

  useEffect(() => {
    fetchOSVersions();
  }, [fetchOSVersions]);

  return (
    <div className="min-h-screen w-full px-6 space-y-6">
      {/* Header */}
      <OSHeader
        onRefresh={handleRefresh}
        onAddClick={handleAddClick}
        loading={loading}
      />

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="space-y-2">
          <div onKeyPress={handleKeyPress}>
            <FilterBar
              searchTerm={searchInput}
              onSearchChange={handleSearchInputChange}
              onSearchClear={handleSearchClear}
              filters={[]}
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {t("os:search.placeholder")}
            </p>
          </div>
        </div>
      </Card>

      {/* OS Table */}
      <OSTable
        osVersions={osVersions}
        loading={loading}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      {!loading && !error && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalItems}
          pageSize={pageSize}
          loading={loading}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          showInfo={true}
          showPageSizeSelector={true}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      )}

      {/* Form Dialog */}
      <OSFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        editingOS={editingOS}
        onSubmit={handleFormSubmit}
        loading={formLoading}
      />

      {/* Delete Dialog */}
      <OSDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        osVersion={deletingOS}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
