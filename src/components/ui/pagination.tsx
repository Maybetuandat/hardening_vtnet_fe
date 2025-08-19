import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements?: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  loading?: boolean;
  showInfo?: boolean;
  showPageSizeSelector?: boolean;
  className?: string;
  pageSizeOptions?: number[];
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onPageSizeChange,
  loading = false,
  showInfo = true,
  showPageSizeSelector = true,
  className,
  pageSizeOptions = [5, 10, 20, 50, 100],
}) => {
  // Tính toán chỉ số bắt đầu và kết thúc
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalElements || 0);

  // Tạo danh sách số trang
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Hiển thị tất cả trang nếu ít hơn hoặc bằng maxVisiblePages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logic phức tạp hơn cho nhiều trang
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);

      // Điều chỉnh để luôn hiển thị đủ 5 trang nếu có thể
      if (endPage - startPage < maxVisiblePages - 1) {
        if (startPage === 1) {
          endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        } else {
          startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
      }

      // Thêm trang đầu và dấu ... nếu cần
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push("...");
        }
      }

      // Thêm các trang ở giữa
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Thêm dấu ... và trang cuối nếu cần
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push("...");
        }
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Không hiển thị nếu chỉ có 1 trang hoặc ít hơn
  if (totalPages <= 1) {
    return null;
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage && !loading) {
      onPageChange(page);
    }
  };

  const handlePageSizeChange = (newPageSize: string) => {
    const size = parseInt(newPageSize);
    if (onPageSizeChange && size !== pageSize) {
      onPageSizeChange(size);
    }
  };

  return (
    <div className={cn("mt-6 pt-4 border-t", className)}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Thông tin trang */}
        {showInfo && totalElements !== undefined && (
          <div className="text-sm text-muted-foreground">
            Hiển thị {startIndex}-{endIndex} của {totalElements} mục
          </div>
        )}

        {/* Selector số lượng item mỗi trang */}
        {showPageSizeSelector && onPageSizeChange && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Hiển thị</span>
            <Select
              value={pageSize.toString()}
              onValueChange={handlePageSizeChange}
              disabled={loading}
            >
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">mục</span>
          </div>
        )}

        {/* Các nút phân trang */}
        <div className="flex items-center space-x-1">
          {/* Nút đầu trang */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1 || loading}
            className="h-8 w-8 p-0"
            title="Trang đầu"
          >
            <ChevronsLeft className="h-4 w-4" />
            <span className="sr-only">Trang đầu</span>
          </Button>

          {/* Nút trang trước */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="h-8 w-8 p-0"
            title="Trang trước"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Trang trước</span>
          </Button>

          {/* Các số trang */}
          <div className="flex items-center space-x-1">
            {generatePageNumbers().map((pageNumber, index) => {
              if (pageNumber === "...") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="text-muted-foreground px-2 text-sm"
                  >
                    ...
                  </span>
                );
              }

              const page = pageNumber as number;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  disabled={loading}
                  className={cn(
                    "h-8 w-8 p-0",
                    currentPage === page && "bg-primary text-primary-foreground"
                  )}
                >
                  {page}
                </Button>
              );
            })}
          </div>

          {/* Nút trang sau */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="h-8 w-8 p-0"
            title="Trang sau"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Trang sau</span>
          </Button>

          {/* Nút cuối trang */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages || loading}
            className="h-8 w-8 p-0"
            title="Trang cuối"
          >
            <ChevronsRight className="h-4 w-4" />
            <span className="sr-only">Trang cuối</span>
          </Button>
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center mt-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
};
