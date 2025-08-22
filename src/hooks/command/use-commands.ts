import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export interface CommandResponse {
  id: number;
  rule_id: number;
  os_version: string;
  command_text: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommandCreate {
  rule_id: number;
  os_version: string;
  command_text: string;
  is_active: boolean;
}

export interface CommandUpdate {
  os_version?: string;
  command_text?: string;
  is_active?: boolean;
}

interface UseCommandsReturn {
  commands: CommandResponse[];
  loading: boolean;
  error: string | null;
  fetchCommandsByRuleId: (ruleId: number) => Promise<void>;
  createCommand: (data: CommandCreate) => Promise<CommandResponse>;
  updateCommand: (
    commandId: number,
    data: CommandUpdate
  ) => Promise<CommandResponse>;
  deleteCommand: (commandId: number) => Promise<void>;
}

export function useCommands(): UseCommandsReturn {
  const [commands, setCommands] = useState<CommandResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCommandsByRuleId = useCallback(async (ruleId: number) => {
    if (!ruleId || ruleId <= 0) {
      setCommands([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.get<CommandResponse[]>(`/commands/${ruleId}`);
      setCommands(response);
    } catch (err: any) {
      console.error("Error fetching commands:", err);
      setError(err.message || "Failed to fetch commands");
      setCommands([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCommand = useCallback(
    async (data: CommandCreate): Promise<CommandResponse> => {
      try {
        const response = await api.post<CommandResponse>("/commands", data);
        toast.success("Tạo command thành công");
        return response;
      } catch (err: any) {
        console.error("Error creating command:", err);
        const errorMessage = err.message || "Failed to create command";
        toast.error(`Có lỗi xảy ra khi tạo command: ${errorMessage}`);
        throw err;
      }
    },
    []
  );

  const updateCommand = useCallback(
    async (
      commandId: number,
      data: CommandUpdate
    ): Promise<CommandResponse> => {
      try {
        const response = await api.put<CommandResponse>(
          `/commands/${commandId}`,
          data
        );
        toast.success("Cập nhật command thành công");
        return response;
      } catch (err: any) {
        console.error("Error updating command:", err);
        const errorMessage = err.message || "Failed to update command";
        toast.error(`Có lỗi xảy ra khi cập nhật command: ${errorMessage}`);
        throw err;
      }
    },
    []
  );

  const deleteCommand = useCallback(
    async (commandId: number): Promise<void> => {
      try {
        await api.delete(`/commands/${commandId}`);
        toast.success("Xóa command thành công");
      } catch (err: any) {
        console.error("Error deleting command:", err);
        const errorMessage = err.message || "Failed to delete command";
        toast.error(`Có lỗi xảy ra khi xóa command: ${errorMessage}`);
        throw err;
      }
    },
    []
  );

  return {
    commands,
    loading,
    error,
    fetchCommandsByRuleId,
    createCommand,
    updateCommand,
    deleteCommand,
  };
}
