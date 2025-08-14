import { api } from "@/lib/api";
import { SshKey, SshKeyCreate, SshKeyUpdate } from "@/types/ssh-key";

export const sshKeyService = {
  async getAll(): Promise<SshKey[]> {
    return api.get<SshKey[]>("/ssh-keys");
  },

  async getById(id: number): Promise<SshKey> {
    return api.get<SshKey>(`/ssh-keys/${id}`);
  },

  async create(data: SshKeyCreate): Promise<SshKey> {
    return api.post<SshKey>("/ssh-keys", data);
  },

  async update(id: number, data: SshKeyUpdate): Promise<SshKey> {
    return api.put<SshKey>(`/ssh-keys/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    return api.delete<void>(`/ssh-keys/${id}`);
  },
};
