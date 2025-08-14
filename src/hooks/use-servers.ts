import { useState, useEffect, useCallback } from "react";
import { Server, ServerCreate, ServerUpdate } from "@/types/server";
import { api } from "@/lib/api";

export function useServers() {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((error: any, action: string) => {
    console.error(`Error ${action}:`, error);
    const message = error.message || `Failed to ${action}`;
    setError(message);
  }, []);

  const fetchServers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<Server[]>("/servers");
      setServers(data);
      console.log("Fetched servers:", data);
    } catch (err) {
      handleError(err, "fetch servers");
    } finally {
      setLoading(false);
    }
  }, [handleError]);

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
        setServers((prev) => [...prev, newServer]);
        return newServer;
      } catch (err) {
        handleError(err, "create server");
        throw err;
      }
    },
    [handleError]
  );

  const updateServer = useCallback(
    async (id: number, serverData: ServerUpdate): Promise<Server> => {
      try {
        const updatedServer = await api.put<Server>(
          `/servers/${id}`,
          serverData
        );
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
        await api.delete(`/api/servers/${id}`);
        setServers((prev) => prev.filter((server) => server.id !== id));
      } catch (err) {
        handleError(err, "delete server");
        throw err;
      }
    },
    [handleError]
  );

  // Fetch servers on mount
  useEffect(() => {
    fetchServers();
  }, [fetchServers]);

  return {
    servers,
    loading,
    error,
    fetchServers,
    getServerById,
    createServer,
    updateServer,
    deleteServer,
  };
}
