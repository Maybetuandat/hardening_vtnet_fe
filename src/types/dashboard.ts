export interface WorkloadStats {
  workload_name: string;
  pass_count: number;
  fail_count: number;
  total: number;
}

export interface DashboardStats {
  total_nodes: number;
  compliance_rate: number;
  critical_issues: number;
  last_audit: string | null;
  passed_servers: number;
  failed_servers: number;
  workload_stats: WorkloadStats[];
}

export interface DashboardCardData {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  variant: "default" | "success" | "warning" | "info";
  isLoading?: boolean;
}
