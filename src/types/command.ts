export interface Command {
  rule_index: number;
  os_version: string;
  command_text: string;
  is_active: boolean;
}
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
