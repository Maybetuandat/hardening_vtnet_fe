import React, { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Search, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { OSVersion } from "@/types/os";
import { useOS } from "@/hooks/os/use-os";

interface OSSelectorProps {
  value: number;
  onValueChange: (value: number) => void;
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
  const [currentSearchTerm, setCurrentSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allOSVersions, setAllOSVersions] = useState<OSVersion[]>([]);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [selectedOSCache, setSelectedOSCache] = useState<OSVersion | null>(
    null
  ); // Cache selected OS

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    osVersions,
    loading,
    totalPages,
    fetchOSVersionsAvailable,
    getOSById,
  } = useOS();

  // Load selected OS data if value exists and not in cache
  useEffect(() => {
    const loadSelectedOS = async () => {
      if (value && (!selectedOSCache || selectedOSCache.id !== value)) {
        try {
          const osData = await getOSById(value);
          setSelectedOSCache(osData);
        } catch (error) {
          console.error("Error loading selected OS:", error);
          setSelectedOSCache(null);
        }
      } else if (!value) {
        setSelectedOSCache(null);
      }
    };

    loadSelectedOS();
  }, [value, getOSById, selectedOSCache]);

  const fetchData = useCallback(
    async (term: string, resetPageAndList: boolean = true) => {
      if (resetPageAndList) {
        setPage(1);
        setAllOSVersions([]);
        setHasNextPage(true);
      }

      try {
        await fetchOSVersionsAvailable(term, resetPageAndList ? 1 : page, 20);
      } catch (error) {
        console.error("Error fetching OS versions:", error);
      }
    },
    [fetchOSVersionsAvailable, page]
  );

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasNextPage || loading || !open) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      await fetchOSVersionsAvailable(searchTerm, nextPage, 20);
      setPage(nextPage);
    } catch (error) {
      console.error("Error loading more OS versions:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [
    loadingMore,
    hasNextPage,
    page,
    searchTerm,
    fetchOSVersionsAvailable,
    loading,
    open,
  ]);

  useEffect(() => {
    if (loading || loadingMore || !open) return;

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
  }, [loadMore, hasNextPage, loading, loadingMore, open]);

  useEffect(() => {
    if (osVersions && osVersions.length > 0) {
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
    } else if (
      osVersions &&
      osVersions.length === 0 &&
      page === 1 &&
      !loading
    ) {
      setAllOSVersions([]);
    }

    setHasNextPage(page < totalPages);
  }, [osVersions, page, totalPages, loading]);

  // Quản lý việc load dữ liệu ban đầu khi mở dropdown
  useEffect(() => {
    if (!open) {
      setInitialLoadDone(false);
      setCurrentSearchTerm("");
      setSearchTerm("");
      setAllOSVersions([]);
      setPage(1);
      setHasNextPage(true);
    } else {
      if (!initialLoadDone && searchTerm === "") {
        fetchData("", true);
        setInitialLoadDone(true);
      }
    }
  }, [open, initialLoadDone, searchTerm, fetchData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setCurrentSearchTerm("");
        setSearchTerm("");
        setAllOSVersions([]);
        setPage(1);
        setHasNextPage(true);
        setInitialLoadDone(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  // Auto focus search input when dropdown opens
  useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setCurrentSearchTerm(newSearchTerm);

    if (newSearchTerm === "" && searchTerm !== "") {
      setSearchTerm("");
      fetchData("", true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (currentSearchTerm !== searchTerm && currentSearchTerm !== "") {
        setSearchTerm(currentSearchTerm);
        fetchData(currentSearchTerm, true);
      }
    }
  };

  // Fixed: Khi chọn một item, cache selected OS và không reset search state ngay lập tức
  const handleOptionSelect = (selectedOS: OSVersion) => {
    onValueChange(selectedOS.id);
    setSelectedOSCache(selectedOS); // Cache the selected OS
    setOpen(false);

    // Reset search state when closing
    setCurrentSearchTerm("");
    setSearchTerm("");
    setAllOSVersions([]);
    setPage(1);
    setHasNextPage(true);
    setInitialLoadDone(false);
  };

  // Fixed: Use cached selected OS first, then try to find in current list
  const selectedOS =
    selectedOSCache || allOSVersions.find((os) => os.id === value);

  return (
    <div className="space-y-2" ref={dropdownRef}>
      <Label>
        Hệ điều hành <span className="text-red-500">*</span>
      </Label>

      {/* Custom Select Trigger */}
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-between text-left font-normal",
            error && "border-red-500",
            !selectedOS && "text-muted-foreground"
          )}
          onClick={() => setOpen(!open)}
          disabled={disabled}
        >
          <span className="truncate">
            {selectedOS ? selectedOS.version : placeholder}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 opacity-50 transition-transform",
              open && "rotate-180"
            )}
          />
        </Button>

        {/* Custom Dropdown */}
        {open && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-[300px] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80">
            {/* Search Input */}
            <div className="border-b bg-background p-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  placeholder="Tìm kiếm hệ điều hành..."
                  value={currentSearchTerm}
                  onChange={handleSearchInputChange}
                  onKeyDown={handleKeyDown}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-8 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  autoComplete="off"
                  type="text"
                />
              </div>
            </div>

            {/* Dropdown Content */}
            <div className="overflow-y-auto max-h-[240px]">
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
                <div
                  key={os.id}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  onClick={() => handleOptionSelect(os)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === os.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{os.version}</span>
                    <span className="text-xs text-muted-foreground">
                      ID: {os.id}
                    </span>
                  </div>
                </div>
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
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};
