import { useState, useEffect, useCallback } from "react";
import {
  Server,
  ServerCreate,
  ServerUpdate,
  ServerListResponse,
} from "@/types/server";
import { api } from "@/lib/api";

interface UseServersReturn {
  servers: Server[];
  loading: boolean;
  error: string | null;
  totalServers: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  fetchServers: (
    page?: number,
    pageSize?: number,
    keyword?: string,
    status?: string
  ) => Promise<void>;
  getServerById: (id: number) => Promise<Server>;
  createServer: (serverData: ServerCreate) => Promise<Server>;
  updateServer: (id: number, serverData: ServerUpdate) => Promise<Server>;
  deleteServer: (id: number) => Promise<void>;
  searchServers: (
    keyword?: string,
    status?: string,
    page?: number,
    pageSize?: number
  ) => Promise<void>;
}

export function useServers(): UseServersReturn {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalServers, setTotalServers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleError = useCallback((error: any, action: string) => {
    console.error(`Error ${action}:`, error);
    const message = error.message || `Failed to ${action}`;
    setError(message);
  }, []);

  const fetchServers = useCallback(
    async (page = 1, size = 10, keyword?: string, status?: string) => {
      setLoading(true);
      setError(null);
      try {
        // Build query parameters
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("page_size", size.toString());

        if (keyword && keyword.trim()) {
          params.append("keyword", keyword.trim());
        }

        if (status && status !== "status") {
          // Skip default filter value
          params.append("status", status);
        }

        const response = await api.get<ServerListResponse>(
          `/servers/?${params.toString()}`
        );

        setServers(response.instances);
        setTotalServers(response.total_servers);
        setTotalPages(response.total_pages);
        setCurrentPage(response.page);
        setPageSize(response.page_size);

        console.log("Fetched servers:", response);
      } catch (err) {
        handleError(err, "fetch servers");
        setServers([]);
        setTotalServers(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    },
    [handleError]
  );

  const searchServers = useCallback(
    async (keyword?: string, status?: string, page = 1, size = 10) => {
      await fetchServers(page, size, keyword, status);
    },
    [fetchServers]
  );

  const getServerById = useCallback(
    async (id: number): Promise<Server> => {
      try {
        const server = await api.get<Server>(`/servers/${id}`);
        if (!server) throw new Error("Server not found");
        return server;
      } catch (err: any) {
        if (err.message.includes("404")) {
          throw new Error("Server not found");
        }
        handleError(err, "get server by ID");
        throw err;
      }
    },
    [handleError]
  );

  const createServer = useCallback(
    async (serverData: ServerCreate): Promise<Server> => {
      try {
        const newServer = await api.post<Server>("/servers", serverData);
        // Refresh server list after creation
        await fetchServers(currentPage, pageSize);
        return newServer;
      } catch (err) {
        handleError(err, "create server");
        throw err;
      }
    },
    [handleError, fetchServers, currentPage, pageSize]
  );

  const updateServer = useCallback(
    async (id: number, serverData: ServerUpdate): Promise<Server> => {
      try {
        const updatedServer = await api.put<Server>(
          `/servers/${id}`,
          serverData
        );
        // Update local state
        setServers((prev) =>
          prev.map((server) => (server.id === id ? updatedServer : server))
        );
        return updatedServer;
      } catch (err) {
        handleError(err, "update server");
        throw err;
      }
    },
    [handleError]
  );

  const deleteServer = useCallback(
    async (id: number): Promise<void> => {
      try {
        await api.delete(`/servers/${id}`);
        // Remove from local state
        setServers((prev) => prev.filter((server) => server.id !== id));
        setTotalServers((prev) => prev - 1);
      } catch (err) {
        handleError(err, "delete server");
        throw err;
      }
    },
    [handleError]
  );

  // Fetch servers on mount
  useEffect(() => {
    fetchServers(1, 10);
  }, [fetchServers]);

  return {
    servers,
    loading,
    error,
    totalServers,
    totalPages,
    currentPage,
    pageSize,
    fetchServers,
    getServerById,
    createServer,
    updateServer,
    deleteServer,
    searchServers,
  };
}
