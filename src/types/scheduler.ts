export interface ScanScheduleRequest {
  scan_time: string; // Format: "HH:MM"
  is_enabled: boolean;
}

export interface ScanScheduleResponse {
  scan_time: string;
  is_enabled: boolean;
  next_run?: string; // ISO datetime string
  last_run?: string; // ISO datetime string
  message: string;
}

export interface SchedulerStatus {
  scheduler_running: boolean;
  job_exists: boolean;
  job_next_run?: string; // ISO datetime string
  scan_schedule: {
    scan_time: string;
    is_enabled: boolean;
    next_run?: string;
    last_run?: string;
  };
}

export interface DisableScheduleResponse {
  message: string;
  scan_time: string;
  is_enabled: boolean;
  success: boolean;
}
