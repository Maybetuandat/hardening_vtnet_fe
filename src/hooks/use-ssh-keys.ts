import { useState, useEffect } from "react";
import { SshKey, SshKeyCreate, SshKeyUpdate } from "@/types/ssh-key";
import { sshKeyService } from "@/services/ssh-key-service";

export function useSshKeys() {
  const [sshKeys, setSshKeys] = useState<SshKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSshKeys = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await sshKeyService.getAll();
      setSshKeys(data);
    } catch (err) {
      setError("Failed to fetch SSH keys");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createSshKey = async (data: SshKeyCreate) => {
    const newSshKey = await sshKeyService.create(data);
    setSshKeys((prev) => [...prev, newSshKey]);
    return newSshKey;
  };

  const updateSshKey = async (id: number, data: SshKeyUpdate) => {
    const updatedSshKey = await sshKeyService.update(id, data);
    setSshKeys((prev) =>
      prev.map((key) => (key.id === id ? updatedSshKey : key))
    );
    return updatedSshKey;
  };

  const deleteSshKey = async (id: number) => {
    await sshKeyService.delete(id);
    setSshKeys((prev) => prev.filter((key) => key.id !== id));
  };

  const getSshKeyById = async (id: number) => {
    return await sshKeyService.getById(id);
  };

  useEffect(() => {
    fetchSshKeys();
  }, []);

  return {
    sshKeys,
    loading,
    error,
    fetchSshKeys,
    createSshKey,
    updateSshKey,
    deleteSshKey,
    getSshKeyById,
  };
}
