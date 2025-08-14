import { useState, useEffect } from "react";
import { SshKey, SshKeyCreate, SshKeyUpdate } from "@/types/ssh-key";
import { sshKeyService } from "@/services/ssh-key-service";

export function useSshKeys() {
  const [sshKeys, setSshKeys] = useState<SshKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSshKeys = async () => {
    console.log("🔄 Fetching SSH keys..."); // Debug log
    setLoading(true);
    setError(null);

    try {
      const data = await sshKeyService.getAll();
      console.log("✅ SSH Keys received:", data); // Debug log
      console.log("📊 Data type:", typeof data, Array.isArray(data)); // Debug log

      if (Array.isArray(data)) {
        setSshKeys(data);
      } else {
        console.error("❌ Data is not an array:", data);
        setError("Invalid data format received");
      }
    } catch (err) {
      console.error("❌ Error fetching SSH keys:", err); // Debug log
      setError("Failed to fetch SSH keys");
    } finally {
      setLoading(false);
    }
  };

  const createSshKey = async (data: SshKeyCreate) => {
    try {
      console.log("➕ Creating SSH key:", data);
      const newSshKey = await sshKeyService.create(data);
      console.log("✅ SSH key created:", newSshKey);
      setSshKeys((prev) => [...prev, newSshKey]);
      return newSshKey;
    } catch (err) {
      console.error("❌ Error creating SSH key:", err);
      throw err;
    }
  };

  const updateSshKey = async (id: number, data: SshKeyUpdate) => {
    try {
      console.log("✏️ Updating SSH key:", id, data);
      const updatedSshKey = await sshKeyService.update(id, data);
      console.log("✅ SSH key updated:", updatedSshKey);
      setSshKeys((prev) =>
        prev.map((key) => (key.id === id ? updatedSshKey : key))
      );
      return updatedSshKey;
    } catch (err) {
      console.error("❌ Error updating SSH key:", err);
      throw err;
    }
  };

  const deleteSshKey = async (id: number) => {
    try {
      console.log("🗑️ Deleting SSH key:", id);
      await sshKeyService.delete(id);
      console.log("✅ SSH key deleted");
      setSshKeys((prev) => prev.filter((key) => key.id !== id));
    } catch (err) {
      console.error("❌ Error deleting SSH key:", err);
      throw err;
    }
  };

  const getSshKeyById = async (id: number) => {
    try {
      console.log("🔍 Getting SSH key by ID:", id);
      const sshKey = await sshKeyService.getById(id);
      console.log("✅ SSH key found:", sshKey);
      return sshKey;
    } catch (err) {
      console.error("❌ Error getting SSH key by ID:", err);
      throw err;
    }
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
