// src/components/work-loads/create-workload/os-selector.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search } from "lucide-react";
import { OSVersion } from "@/types/os";
import { useOS } from "@/hooks/os/use-os";
import { useDebouncedCallback } from "use-debounce";

interface OSSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export const OSSelector: React.FC<OSSelectorProps> = ({
  value,
  onValueChange,
  placeholder = "Chọn hệ điều hành...",
  disabled = false,
  error,
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allOSVersions, setAllOSVersions] = useState<OSVersion[]>([]);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const { osVersions, loading, totalPages, fetchOSVersions } = useOS();

  // Debounced search function
  const debouncedSearch = useDebouncedCallback((term: string) => {
    handleSearch(term);
  }, 300);

  const handleSearch = useCallback(
    async (searchTerm: string) => {
      setPage(1);
      setAllOSVersions([]);
      setHasNextPage(true);

      try {
        await fetchOSVersions(searchTerm, 1, 20);
      } catch (error) {
        console.error("Error searching OS versions:", error);
      }
    },
    [fetchOSVersions]
  );

  // Load more data when scrolling to bottom
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasNextPage) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      await fetchOSVersions(searchTerm, nextPage, 20);
      setPage(nextPage);
    } catch (error) {
      console.error("Error loading more OS versions:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasNextPage, page, searchTerm, fetchOSVersions]);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (loading || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasNextPage) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, hasNextPage, loading, loadingMore]);

  // Update OS versions list and pagination state
  useEffect(() => {
    if (page === 1) {
      setAllOSVersions(osVersions);
    } else {
      setAllOSVersions((prev) => {
        const existingIds = new Set(prev.map((os) => os.id));
        const newOSVersions = osVersions.filter(
          (os) => !existingIds.has(os.id)
        );
        return [...prev, ...newOSVersions];
      });
    }

    setHasNextPage(page < totalPages);
  }, [osVersions, page, totalPages]);

  // Initial load when dropdown opens
  useEffect(() => {
    if (open && allOSVersions.length === 0) {
      handleSearch("");
    }
  }, [open, allOSVersions.length, handleSearch]);

  // Handle search input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    debouncedSearch(newSearchTerm);
  };

  const selectedOS = allOSVersions.find((os) => os.version === value);

  return (
    <div className="space-y-2">
      <Label>
        Hệ điều hành <span className="text-red-500">*</span>
      </Label>
      <Select
        open={open}
        onOpenChange={setOpen}
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger className={error ? "border-red-500" : ""}>
          <SelectValue placeholder={placeholder}>
            {selectedOS ? selectedOS.version : placeholder}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {/* Search input */}
          <div className="p-2 border-b sticky top-0 bg-white">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm hệ điều hành..."
                value={searchTerm}
                onChange={handleSearchInputChange}
                className="pl-8"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Loading state */}
          {loading && allOSVersions.length === 0 && (
            <div className="p-4 text-center">
              <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
              <span className="text-sm text-muted-foreground">
                Đang tải danh sách hệ điều hành...
              </span>
            </div>
          )}

          {/* No results */}
          {!loading && allOSVersions.length === 0 && (
            <div className="p-4 text-center">
              <span className="text-sm text-muted-foreground">
                {searchTerm
                  ? "Không tìm thấy hệ điều hành nào"
                  : "Không có dữ liệu"}
              </span>
            </div>
          )}

          {/* OS versions list */}
          {allOSVersions.map((os) => (
            <SelectItem
              key={os.id}
              value={os.version}
              className="cursor-pointer hover:bg-accent"
            >
              <div className="flex flex-col">
                <span className="font-medium">{os.version}</span>
                <span className="text-xs text-muted-foreground">
                  ID: {os.id}
                </span>
              </div>
            </SelectItem>
          ))}

          {/* Load more trigger */}
          {hasNextPage && (
            <div ref={loadMoreRef} className="p-2 text-center border-t">
              {loadingMore ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    Đang tải thêm...
                  </span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Cuộn xuống để tải thêm
                </span>
              )}
            </div>
          )}
        </SelectContent>
      </Select>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};
