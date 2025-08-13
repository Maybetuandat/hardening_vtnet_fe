export enum SshKeyType {
  RSA = "rsa",
  ED25519 = "ed25519",
  ECDSA = "ecdsa",
  DSA = "dsa",
}
export interface SshKey {
  id: number;
  name: string;
  description?: string;
  key_type: SshKeyType;
  public_key: string;
  fingerprint: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
export interface SshKeyCreate {
  name: string;
  description?: string;
  key_type: SshKeyType;
  public_key: string;
  private_key: string;
}
export interface SshKeyUpdate {
  name?: string;
  description?: string;
  is_active?: boolean;
  public_key?: string;
  private_key?: string;
  key_type?: SshKeyType;
}
export interface SshKeyFormData {
  name: string;
  description: string;
  key_type: SshKeyType;
  public_key: string;
  private_key: string;
  is_active: boolean;
}
