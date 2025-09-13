import { useEffect, useRef, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Server as ServerIcon, Loader2 } from "lucide-react";
import { Server } from "@/types/server";

interface ServerListProps {
  servers: Server[];
  selectedServers: Set<number>;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  searchTerm: string;
  onServerToggle: (serverId: number) => void;
  onLoadMore: () => void;
  t: (key: string, options?: any) => string;
}

export const ServerList = ({
  servers,
  selectedServers,
  loading,
  loadingMore,
  hasMore,
  searchTerm,
  onServerToggle,
  onLoadMore,
  t,
}: ServerListProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for infinite scroll
  const handleObserver = useCallback(
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

    const observer = new IntersectionObserver(handleObserver, option);

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [handleObserver]);

  // Memoized server row component for better performance
  const ServerRow = useCallback(
    ({ server }: { server: Server }) => (
      <div
        key={server.id}
        className={`flex items-center space-x-3 p-2 rounded-lg border cursor-pointer transition-colors ${
          selectedServers.has(server.id)
            ? "bg-primary/10 border-primary"
            : "hover:bg-muted"
        }`}
        onClick={() => onServerToggle(server.id)}
      >
        <Checkbox
          checked={selectedServers.has(server.id)}
          onChange={() => onServerToggle(server.id)}
        />
        <ServerIcon className="h-4 w-4 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="font-medium truncate">{server.ip_address}</span>
          </div>
          <div className="text-sm text-muted-foreground truncate">
            {server.hostname}
            {server.workload_name && (
              <span className="ml-2">• {server.workload_name}</span>
            )}
          </div>
        </div>
      </div>
    ),
    [selectedServers, onServerToggle, t]
  );

  return (
    <ScrollArea className="h-80 border rounded-md" ref={scrollAreaRef}>
      <div className="p-3 space-y-2">
        {loading && servers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            {t("scanDialog.loading")}
          </div>
        ) : servers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm.trim()
              ? t("scanDialog.noResults")
              : t("scanDialog.noServers")}
          </div>
        ) : (
          <>
            {/* Server list */}
            {servers.map((server) => (
              <ServerRow key={server.id} server={server} />
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
            {!hasMore && servers.length > 20 && (
              <div className="text-center py-2 text-xs text-muted-foreground border-t">
                {t("scanDialog.endOfList")} ({servers.length}{" "}
                {t("scanDialog.serversLoaded")})
              </div>
            )}
          </>
        )}
      </div>
    </ScrollArea>
  );
};
