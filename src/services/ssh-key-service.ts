import { api } from "@/lib/api";
import { SshKey, SshKeyCreate, SshKeyUpdate } from "@/types/ssh-key";

export const sshKeyService = {
  async getAll(): Promise<SshKey[]> {
    const response = await api.get("/ssh-keys");
    return response.data;
  },

  async getById(id: number): Promise<SshKey> {
    const response = await api.get(`/ssh-keys/${id}`);
    return response.data;
  },

  async create(data: SshKeyCreate): Promise<SshKey> {
    const response = await api.post("/ssh-keys", data);
    return response.data;
  },

  async update(id: number, data: SshKeyUpdate): Promise<SshKey> {
    const response = await api.patch(`/ssh-keys/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/ssh-keys/${id}`);
  },
};
