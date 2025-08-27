export interface DashboardStats {
  total_nodes: number;
  compliance_rate: number;
  critical_issues: number;
  last_audit: string | null;
}

export interface DashboardCardData {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  variant: "default" | "success" | "warning" | "info";
  isLoading?: boolean;
}
