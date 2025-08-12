import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Key, 
  AlertTriangle, 
  Info,
  Eye,
  EyeOff,
  Copy,
  Check,
  HelpCircle
} from 'lucide-react';
import { SshKeyType, SshKeyFormData } from '@/types/ssh-key';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

interface SshKeyFormProps {
  formData: SshKeyFormData;
  errors: Record<string, string>;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onFieldChange: (field: keyof SshKeyFormData, value: any) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

export const SshKeyForm: React.FC<SshKeyFormProps> = ({
  formData,
  errors,
  loading,
  onSubmit,
  onFieldChange,
  onCancel,
  isEdit = false,
}) => {
  const [showPrivateKey, setShowPrivateKey] = React.useState(false);
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const keyTypeOptions = [
    { value: SshKeyType.RSA, label: 'RSA', description: 'Most compatible, widely supported' },
    { value: SshKeyType.ED25519, label: 'Ed25519', description: 'Modern, secure, fast' },
    { value: SshKeyType.ECDSA, label: 'ECDSA', description: 'Elliptic curve, good security' },
    { value: SshKeyType.DSA, label: 'DSA', description: 'Legacy, not recommended' },
  ];

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
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

  return (
    <TooltipProvider>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            {isEdit ? 'Edit SSH Key' : 'New SSH Key'}
          </CardTitle>
          <CardDescription>
            {isEdit 
              ? 'Update your SSH key credentials'
              : 'Add a new SSH key credential for secure authentication'
            }
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            {/* General Error */}
            {errors.key_pair && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  {errors.key_pair}
                </AlertDescription>
              </Alert>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <Separator className="flex-1" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    Name
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>A unique identifier for this SSH key</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => onFieldChange('name', e.target.value)}
                    placeholder="my-ssh-key"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Key Type */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Key Type
                    <Badge className={`${getKeyTypeColor(formData.key_type)} text-white text-xs`}>
                      {formData.key_type.toUpperCase()}
                    </Badge>
                  </Label>
                  <Select 
                    value={formData.key_type} 
                    onValueChange={(value: SshKeyType) => onFieldChange('key_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {keyTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium">{option.label}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {option.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => onFieldChange('description', e.target.value)}
                  placeholder="SSH key for production servers"
                  rows={2}
                  className="resize-none"
                />
              </div>
            </div>

            {/* SSH Keys */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">SSH Key Pair</h3>
                <Separator className="flex-1" />
              </div>

              {/* Public Key */}
              <div className="space-y-2">
                <Label htmlFor="public_key" className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    Public Key
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>The public key that will be shared with remote servers</p>
                      </TooltipContent>
                    </Tooltip>
                  </span>
                  {formData.public_key && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(formData.public_key, 'public_key')}
                      className="h-6 px-2"
                    >
                      {copiedField === 'public_key' ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </Label>
                <Textarea
                  id="public_key"
                  value={formData.public_key}
                  onChange={(e) => onFieldChange('public_key', e.target.value)}
                  placeholder="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQ..."
                  rows={3}
                  className={`font-mono text-sm resize-none ${errors.public_key ? 'border-red-500' : ''}`}
                />
                {errors.public_key && (
                  <p className="text-sm text-red-600">{errors.public_key}</p>
                )}
              </div>

              {/* Private Key */}
              <div className="space-y-2">
                <Label htmlFor="private_key" className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    Private Key
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>The private key used for authentication (keep secure!)</p>
                      </TooltipContent>
                    </Tooltip>
                  </span>
                  <div className="flex items-center gap-2">
                    {formData.private_key && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(formData.private_key, 'private_key')}
                        className="h-6 px-2"
                      >
                        {copiedField === 'private_key' ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPrivateKey(!showPrivateKey)}
                      className="h-6 px-2"
                    >
                      {showPrivateKey ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </Label>
                <Textarea
                  id="private_key"
                  value={formData.private_key}
                  onChange={(e) => onFieldChange('private_key', e.target.value)}
                  placeholder="-----BEGIN OPENSSH PRIVATE KEY-----&#10;b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAAB...&#10;-----END OPENSSH PRIVATE KEY-----"
                  rows={6}
                  className={`font-mono text-sm resize-none ${errors.private_key ? 'border-red-500' : ''}`}
                />
                {errors.private_key && (
                  <p className="text-sm text-red-600">{errors.private_key}</p>
                )}
              </div>

              {/* Security Notice */}
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Security Notice:</strong> Private keys are stored securely and encrypted. 
                  Only use trusted key pairs and never share your private key.
                </AlertDescription>
              </Alert>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">Settings</h3>
                <Separator className="flex-1" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_active">Active</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable this SSH key for use in deployments
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => onFieldChange('is_active', checked)}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4">
              <Button type="submit" disabled={loading} className="flex items-center gap-2">
                {loading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {isEdit ? 'Update SSH Key' : 'Create SSH Key'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};