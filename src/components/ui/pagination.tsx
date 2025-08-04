import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  loading?: boolean;
}



export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  loading = false
}: PaginationProps) {
  
  

  const canGoPrevious = currentPage > 0;
  const canGoNext = currentPage < totalPages - 1;

  // Generate page numbers to show
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(0, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (range[0] > 0) {
      if (range[0] > 1) {
        rangeWithDots.push(0, '...');
      } else {
        rangeWithDots.push(0);
      }
    }

    rangeWithDots.push(...range);

    if (range[range.length - 1] < totalPages - 1) {
      if (range[range.length - 1] < totalPages - 2) {
        rangeWithDots.push('...', totalPages - 1);
      } else {
        rangeWithDots.push(totalPages - 1);
      }
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) {
    return null;
  }
return (
  <div className="flex items-center justify-center px-2 py-4">
    <div className="flex items-center space-x-1">
      <Button
        variant="outline"
        className="h-8 w-8 p-0"
        onClick={() => onPageChange(0)}
        disabled={!canGoPrevious || loading}
      >
        <span className="sr-only">Trang đầu</span>
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        className="h-8 w-8 p-0"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canGoPrevious || loading}
      >
        <span className="sr-only">Trang trước</span>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {getVisiblePages().map((page, idx) => (
        <React.Fragment key={idx}>
          {page === '...' ? (
            <span className="flex h-8 w-8 items-center justify-center text-sm">
              ...
            </span>
          ) : (
            <Button
              variant={page === currentPage ? "default" : "outline"}
              className="h-8 w-8 p-0"
              onClick={() => onPageChange(page as number)}
              disabled={loading}
            >
              {(page as number) + 1}
            </Button>
          )}
        </React.Fragment>
      ))}

      <Button
        variant="outline"
        className="h-8 w-8 p-0"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canGoNext || loading}
      >
        <span className="sr-only">Trang sau</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        className="h-8 w-8 p-0"
        onClick={() => onPageChange(totalPages - 1)}
        disabled={!canGoNext || loading}
      >
        <span className="sr-only">Trang cuối</span>
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  </div>
)
}