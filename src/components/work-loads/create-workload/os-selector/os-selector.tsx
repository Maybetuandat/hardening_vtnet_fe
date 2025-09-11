import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOSSelector } from "@/hooks/workload/use-os-selector";
import { OSDropdown } from "./os-dropdown";

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
  placeholder,
  disabled = false,
  error,
}) => {
  const { t } = useTranslation("workload");
  const finalPlaceholder = placeholder || t("osSelector.placeholder");

  const {
    // State
    open,
    setOpen,
    currentSearchTerm,
    searchTerm,
    page,
    setPage,
    hasNextPage,
    setHasNextPage,
    loadingMore,
    allOSVersions,
    setAllOSVersions,
    initialLoadDone,
    setInitialLoadDone,
    selectedOS,

    // Refs
    observerRef,
    loadMoreRef,
    searchInputRef,
    dropdownRef,

    // Data
    osVersions,
    loading,
    totalPages,

    // Methods
    fetchData,
    loadMore,
    resetSearchState,
    handleOptionSelect,
    handleSearchInputChange,
    handleKeyDown,
  } = useOSSelector(value, onValueChange);

  // Intersection Observer for infinite scroll
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

  // Update OS versions list
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
  }, [osVersions, page, totalPages, loading, setAllOSVersions, setHasNextPage]);

  // Handle dropdown open/close logic
  useEffect(() => {
    if (!open) {
      setInitialLoadDone(false);
      resetSearchState();
    } else {
      if (!initialLoadDone && searchTerm === "") {
        fetchData("", true);
        setInitialLoadDone(true);
      }
    }
  }, [
    open,
    initialLoadDone,
    searchTerm,
    fetchData,
    setInitialLoadDone,
    resetSearchState,
  ]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        resetSearchState();
        setInitialLoadDone(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open, setOpen, resetSearchState, setInitialLoadDone]);

  return (
    <div className="space-y-2" ref={dropdownRef}>
      <Label>
        {t("osSelector.label")} <span className="text-red-500">*</span>
      </Label>

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
            {selectedOS ? selectedOS.version : finalPlaceholder}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 opacity-50 transition-transform",
              open && "rotate-180"
            )}
          />
        </Button>

        <OSDropdown
          open={open}
          allOSVersions={allOSVersions}
          selectedValue={value}
          loading={loading}
          loadingMore={loadingMore}
          hasNextPage={hasNextPage}
          searchTerm={searchTerm}
          currentSearchTerm={currentSearchTerm}
          searchInputRef={searchInputRef}
          loadMoreRef={loadMoreRef}
          onSearchChange={handleSearchInputChange}
          onSearchKeyDown={handleKeyDown}
          onOptionSelect={handleOptionSelect}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};
