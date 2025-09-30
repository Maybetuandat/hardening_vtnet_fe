import { useEffect, useRef, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Server as InstanceIcon, Loader2 } from "lucide-react";
import { Instance } from "@/types/instance";

interface InstanceListProps {
  Instances: Instance[];
  selectedInstances: Set<number>;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  searchTerm: string;
  onInstanceToggle: (InstanceId: number) => void;
  onLoadMore: () => void;
  t: (key: string, options?: any) => string;
}

export const InstanceList = ({
  Instances,
  selectedInstances,
  loading,
  loadingMore,
  hasMore,
  searchTerm,
  onInstanceToggle,
  onLoadMore,
  t,
}: InstanceListProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Intersection ObInstance for infinite scroll
  const handleObInstance = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !loading && !loadingMore) {
        onLoadMore();
      }
    },
    [hasMore, loading, loadingMore, onLoadMore]
  );

  useEffect(() => {
    const option = {
      root: scrollAreaRef.current,
      rootMargin: "20px",
      threshold: 0,
    };

    const obInstance = new IntersectionObserver(handleObInstance, option);

    if (loadMoreRef.current) {
      obInstance.observe(loadMoreRef.current);
    }

    return () => {
      obInstance.disconnect();
    };
  }, [handleObInstance]);

  // Memoized Instance row component for better performance
  const InstanceRow = useCallback(
    ({ Instance }: { Instance: Instance }) => (
      <div
        key={Instance.id}
        className={`flex items-center space-x-3 p-2 rounded-lg border cursor-pointer transition-colors ${
          selectedInstances.has(Instance.id)
            ? "bg-primary/10 border-primary"
            : "hover:bg-muted"
        }`}
        onClick={() => onInstanceToggle(Instance.id)}
      >
        <Checkbox
          checked={selectedInstances.has(Instance.id)}
          onChange={() => onInstanceToggle(Instance.id)}
        />
        <InstanceIcon className="h-4 w-4 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="font-medium truncate">{Instance.name}</span>
          </div>
          <div className="text-sm text-muted-foreground truncate">
            {Instance.workload_name && (
              <span className="ml-2">• {Instance.workload_name}</span>
            )}
          </div>
        </div>
      </div>
    ),
    [selectedInstances, onInstanceToggle, t]
  );

  return (
    <ScrollArea className="h-80 border rounded-md" ref={scrollAreaRef}>
      <div className="p-3 space-y-2">
        {loading && Instances.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            {t("scanDialog.loading")}
          </div>
        ) : Instances.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm.trim()
              ? t("scanDialog.noResults")
              : t("scanDialog.noInstances")}
          </div>
        ) : (
          <>
            {/* Instance list */}
            {Instances.map((Instance) => (
              <InstanceRow key={Instance.id} Instance={Instance} />
            ))}

            {/* Load more section */}
            {hasMore && (
              <div ref={loadMoreRef} className="py-4">
                {loadingMore ? (
                  <div className="text-center text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1" />
                    <div className="text-sm">{t("scanDialog.loadingMore")}</div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onLoadMore}
                      className="text-xs"
                    >
                      {t("scanDialog.loadMore")}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* End message */}
            {!hasMore && Instances.length > 20 && (
              <div className="text-center py-2 text-xs text-muted-foreground border-t">
                {t("scanDialog.endOfList")} ({Instances.length}{" "}
                {t("scanDialog.InstancesLoaded")})
              </div>
            )}
          </>
        )}
      </div>
    </ScrollArea>
  );
};
