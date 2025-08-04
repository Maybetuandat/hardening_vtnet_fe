import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  loading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  loading,
  onPageChange,
  onPageSizeChange,
}) => {
  const { t } = useTranslation('dashboard');
  // Tính toán các trang hiển thị cho desktop
  const getVisiblePages = () => {
    const current = currentPage + 1; // Convert to 1-based
    const result = [];

    if (totalPages <= 5) {
      // Nếu ít trang, hiển thị tất cả
      for (let i = 1; i <= totalPages; i++) {
        result.push(i);
      }
    } else {
      // Luôn có trang đầu
      result.push(1);

      // Nếu trang hiện tại > 3, thêm dấu ...
      if (current > 3) {
        result.push("...");
      }

      // Hiển thị trang hiện tại và 1 trang trước/sau
      const start = Math.max(2, current - 1);
      const end = Math.min(totalPages - 1, current + 1);

      for (let i = start; i <= end; i++) {
        if (!result.includes(i)) {
          result.push(i);
        }
      }

      // Nếu trang hiện tại < totalPages - 2, thêm dấu ...
      if (current < totalPages - 2) {
        result.push("...");
      }

      // Luôn có trang cuối
      if (!result.includes(totalPages)) {
        result.push(totalPages);
      }
    }

    return result;
  };

  // Tính toán các trang hiển thị cho mobile - compact hơn
  const getMobileVisiblePages = () => {
    const current = currentPage + 1; // Convert to 1-based
    const result = [];

    if (totalPages <= 4) {
      // Nếu ít trang, hiển thị tất cả
      for (let i = 1; i <= totalPages; i++) {
        result.push(i);
      }
    } else {
      // Luôn có trang đầu
      result.push(1);

      // Nếu trang hiện tại > 2, thêm dấu ...
      if (current > 2) {
        result.push("...");
      }

      // Hiển thị trang hiện tại
      if (current > 1 && current < totalPages && !result.includes(current)) {
        result.push(current);
      }

      // Nếu trang hiện tại < totalPages - 1, thêm dấu ...
      if (current < totalPages - 1) {
        result.push("...");
      }

      // Luôn có trang cuối
      if (!result.includes(totalPages)) {
        result.push(totalPages);
      }
    }

    return result;
  };

  const visiblePages = getVisiblePages();
  const mobileVisiblePages = getMobileVisiblePages();

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      {/* Desktop layout - giữ nguyên như cũ */}
      <div className="hidden sm:block text-sm text-muted-foreground">
{t("common:page")} {currentPage + 1} {t("common:of")} {totalPages} ({totalElements} {t("totalAssignments")})
      </div>

      <div className="hidden sm:flex items-center gap-4">
        {/* Phần chọn số phần tử */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t("common:showing")}:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(Number(value))}
            disabled={loading}
          >
            <SelectTrigger className="w-16 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="15">15</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="30">30</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">/ {t("common:page")}</span>
        </div>

        {/* Navigation controls cho desktop */}
        <div className="flex items-center gap-1">
          {/* Previous button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0 || loading}
            className="h-9 w-9 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page numbers */}
          {visiblePages.map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`dots-${index}`}
                  className="h-9 w-9 flex items-center justify-center text-muted-foreground"
                >
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isCurrentPage = pageNum === currentPage + 1;

            return (
              <Button
                key={pageNum}
                variant={isCurrentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum - 1)}
                disabled={loading}
                className="h-9 w-9 p-0"
              >
                {pageNum}
              </Button>
            );
          })}

          {/* Next button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1 || loading}
            className="h-9 w-9 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile layout - navigation controls + page size selector */}
      <div className="flex sm:hidden items-center justify-center gap-2 w-full">
        {/* Previous button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0 || loading}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-3 w-3" />
        </Button>

        {/* Page numbers cho mobile */}
        {mobileVisiblePages.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`dots-${index}`}
                className="h-8 w-8 flex items-center justify-center text-muted-foreground text-xs"
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isCurrentPage = pageNum === currentPage + 1;

          return (
            <Button
              key={pageNum}
              variant={isCurrentPage ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(pageNum - 1)}
              disabled={loading}
              className="h-8 w-8 p-0 text-xs"
            >
              {pageNum}
            </Button>
          );
        })}

        {/* Next button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1 || loading}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-3 w-3" />
        </Button>

        {/* Page size selector ngay bên cạnh */}
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => onPageSizeChange(Number(value))}
          disabled={loading}
        >
          <SelectTrigger className="w-16 h-8 text-xs ml-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="15">15</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="30">30</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
