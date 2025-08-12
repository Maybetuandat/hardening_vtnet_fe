import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Key, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { SshKey, SshKeyType } from '@/types/ssh-key';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';

interface SshKeyListProps {
  sshKeys: SshKey[];
  loading: boolean;
  error: string | null;
  onAdd: () => void;
  onEdit: (sshKey: SshKey) => void;
  onDelete: (sshKey: SshKey) => void;
  onRefresh: () => void;
}

export const SshKeyList: React.FC<SshKeyListProps> = ({
  sshKeys,
  loading,
  error,
  onAdd,
  onEdit,
  onDelete,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterType, setFilterType] = React.useState<string>('all');
  const [filterStatus, setFilterStatus] = React.useState<string>('all');
  const [copiedFingerprint, setCopiedFingerprint] = React.useState<string | null>(null);

  const handleCopyFingerprint = async (fingerprint: string) => {
    try {
      await navigator.clipboard.writeText(fingerprint);
      setCopiedFingerprint(fingerprint);
      setTimeout(() => setCopiedFingerprint(null), 2000);
    } catch (err) {
      console.error('Failed to copy fingerprint:', err);
    }
  };

  const getKeyTypeColor = (type: SshKeyType) => {
    switch (type) {
      case SshKeyType.ED25519:
        return 'bg-green-500';
      case SshKeyType.RSA:
        return 'bg-blue-500';
      case SshKeyType.ECDSA:
        return 'bg-purple-500';
      case SshKeyType.DSA:
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const filteredSshKeys = React.useMemo(() => {
    return sshKeys.filter(key => {
      const matchesSearch = key.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           key.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           key.fingerprint.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || key.key_type === filterType;
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && key.is_active) ||
                           (filterStatus === 'inactive' && !key.is_active);
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [sshKeys, searchTerm, filterType, filterStatus]);

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const truncateFingerprint = (fingerprint: string, length: number = 20) => {
    if (fingerprint.length <= length) return fingerprint;
    return `${fingerprint.substring(0, length)}...`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                SSH Keys ({sshKeys.length})
              </CardTitle>
              <CardDescription>
                Manage SSH key credentials for secure authentication
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={onAdd} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add SSH Key
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Filters */}
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, description, or fingerprint..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value={SshKeyType.RSA}>RSA</SelectItem>
                  <SelectItem value={SshKeyType.ED25519}>Ed25519</SelectItem>
                  <SelectItem value={SshKeyType.ECDSA}>ECDSA</SelectItem>
                  <SelectItem value={SshKeyType.DSA}>DSA</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* SSH Keys Table */}
      <Card>
        <CardContent className="p-0">
          {loading && sshKeys.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Loading SSH keys...</p>
              </div>
            </div>
          ) : filteredSshKeys.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Key className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground mb-2">
                  {sshKeys.length === 0 ? 'No SSH keys found' : 'No SSH keys match your filters'}
                </p>
                {sshKeys.length === 0 && (
                  <Button onClick={onAdd} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add your first SSH key
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Fingerprint</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSshKeys.map((sshKey) => (
                    <TableRow key={sshKey.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{sshKey.name}</p>
                          {sshKey.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {sshKey.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getKeyTypeColor(sshKey.key_type)} text-white`}>
                          {sshKey.key_type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                            {truncateFingerprint(sshKey.fingerprint)}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyFingerprint(sshKey.fingerprint)}
                            className="h-6 w-6 p-0"
                          >
                            {copiedFingerprint === sshKey.fingerprint ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={sshKey.is_active ? "default" : "secondary"}>
                          {sshKey.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(sshKey.created_at)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onEdit(sshKey)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleCopyFingerprint(sshKey.fingerprint)}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Copy Fingerprint
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => onDelete(sshKey)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    );
  };