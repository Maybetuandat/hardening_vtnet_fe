// src/services/ssh-key-service.ts
import { api } from "@/lib/api";
import { SshKey, SshKeyCreate, SshKeyUpdate } from "@/types/ssh-key";

export const sshKeyService = {
  async getAll(): Promise<SshKey[]> {
    return api.get<SshKey[]>("/ssh-keys"); // ✅ Direct return, no .data
  },

  async getById(id: number): Promise<SshKey> {
    return api.get<SshKey>(`/ssh-keys/${id}`); // ✅ Direct return, no .data
  },

  async create(data: SshKeyCreate): Promise<SshKey> {
    return api.post<SshKey>("/ssh-keys", data); // ✅ Direct return, no .data
  },

  async update(id: number, data: SshKeyUpdate): Promise<SshKey> {
    return api.patch<SshKey>(`/ssh-keys/${id}`, data); // ✅ Direct return, no .data
  },

  async delete(id: number): Promise<void> {
    return api.delete<void>(`/ssh-keys/${id}`); // ✅ Direct return, no .data
  },
};
