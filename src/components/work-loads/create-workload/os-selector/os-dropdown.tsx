import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { OSVersion } from "@/types/os";
import { SearchInput } from "./search-input";

interface OSDropdownProps {
  open: boolean;
  allOSVersions: OSVersion[];
  selectedValue: number;
  loading: boolean;
  loadingMore: boolean;
  hasNextPage: boolean;
  searchTerm: string;
  currentSearchTerm: string;
  searchInputRef: React.RefObject<HTMLInputElement>;
  loadMoreRef: React.RefObject<HTMLDivElement>;
  onSearchChange: (value: string) => void;
  onSearchKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onOptionSelect: (os: OSVersion) => void;
}

export const OSDropdown: React.FC<OSDropdownProps> = ({
  open,
  allOSVersions,
  selectedValue,
  loading,
  loadingMore,
  hasNextPage,
  searchTerm,
  currentSearchTerm,
  searchInputRef,
  loadMoreRef,
  onSearchChange,
  onSearchKeyDown,
  onOptionSelect,
}) => {
  const { t } = useTranslation("workload");

  // Auto focus search input when dropdown opens
  useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [open, searchInputRef]);

  if (!open) return null;

  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-[300px] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80">
      <SearchInput
        value={currentSearchTerm}
        onChange={onSearchChange}
        onKeyDown={onSearchKeyDown}
        inputRef={searchInputRef}
      />

      <div className="overflow-y-auto max-h-[240px]">
        {/* Loading state */}
        {loading && allOSVersions.length === 0 && (
          <div className="p-4 text-center">
            <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
            <span className="text-sm text-muted-foreground">
              {t("osSelector.loading")}
            </span>
          </div>
        )}

        {/* No results */}
        {!loading && allOSVersions.length === 0 && (
          <div className="p-4 text-center">
            <span className="text-sm text-muted-foreground">
              {searchTerm ? t("osSelector.noResults") : t("osSelector.noData")}
            </span>
          </div>
        )}

        {/* OS versions list */}
        {allOSVersions.map((os) => (
          <div
            key={os.id}
            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            onClick={() => onOptionSelect(os)}
          >
            <Check
              className={cn(
                "mr-2 h-4 w-4",
                selectedValue === os.id ? "opacity-100" : "opacity-0"
              )}
            />
            <div className="flex flex-col">
              <span className="font-medium">{os.name}</span>
              <span className="text-xs text-muted-foreground">ID: {os.id}</span>
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
                  {t("osSelector.loadingMore")}
                </span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">
                {t("osSelector.scrollToLoadMore")}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
