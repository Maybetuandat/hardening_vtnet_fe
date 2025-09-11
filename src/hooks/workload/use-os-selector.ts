import { useState, useEffect, useCallback, useRef } from "react";
import { OSVersion } from "@/types/os";
import { useOS } from "@/hooks/os/use-os";

export const useOSSelector = (
  value: number,
  onValueChange: (value: number) => void
) => {
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
  );

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { osVersions, loading, totalPages, fetchOSVersions, getOSById } =
    useOS();

  // Load selected OS data
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
        await fetchOSVersions(term, resetPageAndList ? 1 : page, 20);
      } catch (error) {
        console.error("Error fetching OS versions:", error);
      }
    },
    [fetchOSVersions, page]
  );

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasNextPage || loading || !open) return;

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
  }, [
    loadingMore,
    hasNextPage,
    page,
    searchTerm,
    fetchOSVersions,
    loading,
    open,
  ]);

  const resetSearchState = useCallback(() => {
    setCurrentSearchTerm("");
    setSearchTerm("");
    setAllOSVersions([]);
    setPage(1);
    setHasNextPage(true);
    setInitialLoadDone(false);
  }, []);

  const handleOptionSelect = useCallback(
    (selectedOS: OSVersion) => {
      onValueChange(selectedOS.id);
      setSelectedOSCache(selectedOS);
      setOpen(false);
      resetSearchState();
    },
    [onValueChange, resetSearchState]
  );

  const selectedOS =
    selectedOSCache || allOSVersions.find((os) => os.id === value);

  const handleSearchInputChange = useCallback(
    (newSearchTerm: string) => {
      setCurrentSearchTerm(newSearchTerm);

      if (newSearchTerm === "" && searchTerm !== "") {
        setSearchTerm("");
        fetchData("", true);
      }
    },
    [searchTerm, fetchData]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (currentSearchTerm !== searchTerm && currentSearchTerm !== "") {
          setSearchTerm(currentSearchTerm);
          fetchData(currentSearchTerm, true);
        }
      }
    },
    [currentSearchTerm, searchTerm, fetchData]
  );

  return {
    // State
    open,
    setOpen,
    currentSearchTerm,
    searchTerm,
    setSearchTerm,
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

    // Data from hook
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
  };
};
