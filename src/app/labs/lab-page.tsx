import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Server, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock,
  RefreshCw,
  Play,
  Search
} from 'lucide-react';

const API_BASE = 'http://localhost:8000';

// Type definitions based on your backend models
enum ServerStatus {
  ONLINE = "online",
  OFFLINE = "offline",
  SCANNING = "scanning",
  UNKNOWN = "unknown"
}

enum RuleSeverity {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low"
}

enum CheckStatus {
  COMPLIANT = "compliant",
  NON_COMPLIANT = "non_compliant",
  ERROR = "error",
  NOT_APPLICABLE = "not_applicable"
}

interface SecurityCheck {
  name: string;
  description: string;
  status: CheckStatus;
  severity: RuleSeverity;
  current_value?: string;
  expected_value?: string;
  remediation?: string;
  ansible_output?: string;
}

interface Server {
  ip: string;
  hostname?: string;
  os_info?: string;
  status: ServerStatus;
  last_scan?: string;
  compliance_score: number;
  total_checks: number;
  passed_checks: number;
  failed_checks: number;
  checks: SecurityCheck[];
}

interface ScanRequest {
  server_ip: string;
  username: string;
  ssh_key_path?: string;
  password?: string;
  checks?: string[];
}

interface ScanResult {
  server_ip: string;
  scan_id: string;
  status: string;
  compliance_score: number;
  total_checks: number;
  passed_checks: number;
  failed_checks: number;
  error_checks: number;
  checks: SecurityCheck[];
  scan_duration: number;
  scan_time: string;
  ansible_log?: string;
}

interface CheckDefinition {
  name: string;
  description: string;
  severity: RuleSeverity;
  file_path?: string;
  check_pattern?: string;
  expected_value?: string;
  remediation: string;
  command?: string;
  expected_contains?: string;
  check_exists?: boolean;
}

interface AvailableChecksResponse {
  available_checks: string[];
  check_details: Record<string, CheckDefinition>;
}

interface ConnectionTestResult {
  server_ip: string;
  connection_status: string;
  ansible_output: string;
  error_output?: string;
}

const SecurityHardeningDashboard: React.FC = () => {
  const [servers, setServers] = useState<Server[]>([]);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [availableChecks, setAvailableChecks] = useState<Record<string, CheckDefinition>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  // Scan form state
  const [scanForm, setScanForm] = useState<ScanRequest>({
    server_ip: '192.168.122.121',
    username: 'ubuntu',
    ssh_key_path: '~/.ssh/id_rsa',
    password: '',
    checks: []
  });

  // Load initial data
  useEffect(() => {
    loadAvailableChecks();
    loadServers();
    loadScanResults();
  }, []);

  const loadAvailableChecks = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/api/checks`);
      const data: AvailableChecksResponse = await response.json();
      setAvailableChecks(data.check_details || {});
    } catch (err) {
      console.error('Failed to load available checks:', err);
    }
  };

  const loadServers = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/api/servers`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Server[] = await response.json();
      setServers(data);
    } catch (err) {
      console.error('Failed to load servers:', err);
    }
  };

  const loadScanResults = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/api/scan-results`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: ScanResult[] = await response.json();
      setScanResults(data);
    } catch (err) {
      console.error('Failed to load scan results:', err);
    }
  };

  const testConnection = async (): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/test-connection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scanForm)
      });
      
      if (!response.ok) {
        throw new Error('Connection test failed');
      }

      const result: ConnectionTestResult = await response.json();
      if (result.connection_status === 'success') {
        setError('');
        alert('Connection successful!');
      } else {
        setError(`Connection failed: ${result.error_output || 'Unknown error'}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Connection test failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const runScan = async (): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scanForm)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Scan failed');
      }

      const result: ScanResult = await response.json();
      setScanResults(prev => [result, ...prev]);
      loadServers(); // Refresh servers list
      setError('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Scan failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: RuleSeverity): string => {
    switch (severity) {
      case RuleSeverity.CRITICAL: return 'bg-red-500';
      case RuleSeverity.HIGH: return 'bg-orange-500';
      case RuleSeverity.MEDIUM: return 'bg-yellow-500';
      case RuleSeverity.LOW: return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: CheckStatus): JSX.Element => {
    switch (status) {
      case CheckStatus.COMPLIANT: 
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case CheckStatus.NON_COMPLIANT: 
        return <XCircle className="h-4 w-4 text-red-500" />;
      case CheckStatus.ERROR: 
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: 
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const handleInputChange = (field: keyof ScanRequest) => (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setScanForm(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const getServerStatusVariant = (status: ServerStatus): "default" | "destructive" => {
    return status === ServerStatus.ONLINE ? "default" : "destructive";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Security Hardening Platform</h1>
          </div>
          <p className="text-gray-600">Real-time security scanning with Ansible for Ubuntu servers</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="scan" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="scan">New Scan</TabsTrigger>
            <TabsTrigger value="servers">Servers</TabsTrigger>
            <TabsTrigger value="results">Scan Results</TabsTrigger>
            <TabsTrigger value="checks">Security Checks</TabsTrigger>
          </TabsList>

          {/* New Scan Tab */}
          <TabsContent value="scan">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Run Security Scan
                </CardTitle>
                <CardDescription>
                  Configure and run a security scan on your Ubuntu server
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="server_ip">Server IP</Label>
                    <Input
                      id="server_ip"
                      value={scanForm.server_ip}
                      onChange={handleInputChange('server_ip')}
                      placeholder="192.168.122.121"
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={scanForm.username}
                      onChange={handleInputChange('username')}
                      placeholder="ubuntu"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ssh_key_path">SSH Key Path (optional)</Label>
                    <Input
                      id="ssh_key_path"
                      value={scanForm.ssh_key_path || ''}
                      onChange={handleInputChange('ssh_key_path')}
                      placeholder="/path/to/ssh/key"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password (optional)</Label>
                    <Input
                      id="password"
                      type="password"
                      value={scanForm.password || ''}
                      onChange={handleInputChange('password')}
                      placeholder="Enter password"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button 
                    onClick={testConnection} 
                    disabled={loading}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    Test Connection
                  </Button>
                  <Button 
                    onClick={runScan} 
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Shield className="h-4 w-4" />
                    )}
                    Run Security Scan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Servers Tab */}
          <TabsContent value="servers">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Servers ({servers.length})</h2>
                <Button onClick={loadServers} variant="outline" className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>

              <div className="grid gap-4">
                {servers.map((server: Server) => (
                  <Card key={server.ip}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Server className="h-6 w-6 text-blue-600" />
                          <div>
                            <h3 className="font-semibold text-lg">{server.ip}</h3>
                            <p className="text-gray-600">{server.hostname || 'Unknown hostname'}</p>
                          </div>
                        </div>
                        <Badge variant={getServerStatusVariant(server.status)}>
                          {server.status}
                        </Badge>
                      </div>

                      <Separator className="my-4" />

                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Compliance Score</p>
                          <div className="flex items-center gap-2">
                            <Progress value={server.compliance_score} className="flex-1" />
                            <span className="font-semibold">{server.compliance_score}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Checks</p>
                          <p className="font-semibold text-lg">{server.total_checks}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Passed</p>
                          <p className="font-semibold text-lg text-green-600">{server.passed_checks}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Failed</p>
                          <p className="font-semibold text-lg text-red-600">{server.failed_checks}</p>
                        </div>
                      </div>

                      {server.last_scan && (
                        <p className="text-sm text-gray-600 mt-4">
                          Last scan: {formatDate(server.last_scan)}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Scan Results Tab */}
          <TabsContent value="results">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Scan Results ({scanResults.length})</h2>
                <Button onClick={loadScanResults} variant="outline" className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>

              <div className="space-y-4">
                {scanResults.map((result: ScanResult) => (
                  <Card key={result.scan_id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            {result.server_ip}
                          </CardTitle>
                          <CardDescription>
                            {formatDate(result.scan_time)} • Duration: {result.scan_duration.toFixed(1)}s
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <Progress value={result.compliance_score} className="w-24" />
                            <span className="font-semibold">{result.compliance_score}%</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {result.passed_checks}/{result.total_checks} passed
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {result.checks.map((check: SecurityCheck, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            {getStatusIcon(check.status)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{check.name}</h4>
                                <Badge 
                                  className={`${getSeverityColor(check.severity)} text-white text-xs`}
                                >
                                  {check.severity}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{check.description}</p>
                              {check.current_value && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Current: {check.current_value}
                                </p>
                              )}
                              {check.status === CheckStatus.NON_COMPLIANT && check.remediation && (
                                <p className="text-xs text-blue-600 mt-1">
                                  Remediation: {check.remediation}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Security Checks Tab */}
          <TabsContent value="checks">
            <Card>
              <CardHeader>
                <CardTitle>Available Security Checks</CardTitle>
                <CardDescription>
                  Overview of all security checks that can be performed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(availableChecks).map(([checkId, check]: [string, CheckDefinition]) => (
                    <div key={checkId} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{check.name}</h3>
                        <Badge className={`${getSeverityColor(check.severity)} text-white`}>
                          {check.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{check.description}</p>
                      {check.remediation && (
                        <p className="text-xs text-blue-600">
                          Remediation: {check.remediation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SecurityHardeningDashboard;