import { SshKey, SshKeyCreate, SshKeyUpdate } from "@/types/ssh-key";
import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
interface useSshKeyReturn{
    sshKeys: SshKey[];
    loading : boolean;
    error : string | null;
    fetchSshKeys: () => Promise<void>;
    createSshKey: (data: SshKeyCreate) => Promise<SshKey>;
    updateSshKey: (id: number, data: SshKeyUpdate) => Promise<SshKey>;
    deleteSshKey: (id: number) => Promise<void>;
    getSshKeyById: (id: number) => Promise<SshKey>;
}
export const useSshKeys = ():useSshKeyReturn =>{
    const [sshKeys, setSshKeys] = useState<SshKey[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    

    const fetchSshKeys = async (): Promise<void> =>{

        setLoading(true);
        setError(null);
        try
        {
            const response = await fetch(`${API_BASE}/ssh-keys`);

            if(!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data : SshKey[] = await response.json();
            setSshKeys(data);
            console.log("SSH Keys fetched successfully:", data);
        }
        catch (err) {
            setError("Failed to fetch SSH keys");
            console.error("Error fetching SSH keys:", err);
        } finally {
            setLoading(false);
        }

    };
    





    const createSshKey = async (data: SshKeyCreate): Promise<SshKey> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/ssh-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create SSH key');
      }

      const newSshKey: SshKey = await response.json();
      setSshKeys(prev => [newSshKey, ...prev]);
      return newSshKey;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to create SSH key: ${errorMessage}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };







  const updateSshKey = async (id: number, data: SshKeyUpdate): Promise<SshKey> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/ssh-keys/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update SSH key');
      }

      const updatedSshKey: SshKey = await response.json();
      setSshKeys(prev => 
        prev.map(key => key.id === id ? updatedSshKey : key)
      );
      return updatedSshKey;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to update SSH key: ${errorMessage}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };




  const deleteSshKey = async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/ssh-keys/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete SSH key');
      }

      setSshKeys(prev => prev.filter(key => key.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to delete SSH key: ${errorMessage}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };
   const getSshKeyById = async (id: number): Promise<SshKey> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/ssh-keys/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch SSH key');
      }
      const sshKey: SshKey = await response.json();
      return sshKey;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to fetch SSH key: ${errorMessage}`);
      throw err;
    } finally {
      setLoading(false);
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
