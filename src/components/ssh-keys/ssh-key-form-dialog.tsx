import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Key, HelpCircle, Copy, Check, Shield, Loader2 } from "lucide-react";

import { useSshKeyForm } from "@/hooks/use-ssh-key-form";
import {
  SshKey,
  SshKeyCreate,
  SshKeyUpdate,
  SshKeyType,
} from "@/types/ssh-key";

interface SshKeyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  editingSshKey: SshKey | null;
  createSshKey: (data: SshKeyCreate) => Promise<SshKey>;
  updateSshKey: (id: number, data: SshKeyUpdate) => Promise<SshKey>;
  getSshKeyById: (id: number) => Promise<SshKey>;
  onSuccess: () => void;
}

export function SshKeyFormDialog({
  open,
  onOpenChange,
  onClose,
  editingSshKey,
  createSshKey,
  updateSshKey,
  getSshKeyById,
  onSuccess,
}: SshKeyFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const {
    formData,
    errors,
    setFormData,
    validateForm,
    resetForm,
    updateField,
  } = useSshKeyForm();

  // Key type options with colors and descriptions
  const keyTypeOptions = [
    {
      value: SshKeyType.RSA,
      label: "RSA",
      description: "Most compatible, widely supported",
      color: "bg-blue-500",
    },
    {
      value: SshKeyType.ED25519,
      label: "Ed25519",
      description: "Modern, secure, fast",
      color: "bg-green-500",
    },
    {
      value: SshKeyType.ECDSA,
      label: "ECDSA",
      description: "Elliptic curve, good security",
      color: "bg-purple-500",
    },
    {
      value: SshKeyType.DSA,
      label: "DSA",
      description: "Legacy, not recommended",
      color: "bg-orange-500",
    },
  ];

  const getKeyTypeColor = (type: SshKeyType) => {
    const option = keyTypeOptions.find((opt) => opt.value === type);
    return option?.color || "bg-gray-500";
  };

  // Copy to clipboard function
  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  // Load SSH key data when editing
  useEffect(() => {
    if (open && editingSshKey) {
      const loadSshKey = async () => {
        setInitialLoading(true);
        try {
          const sshKey = await getSshKeyById(editingSshKey.id);
          setFormData({
            name: sshKey.name,
            description: sshKey.description || "",
            key_type: sshKey.key_type,
            public_key: sshKey.public_key,
            private_key: "", // Don't populate private key for security
            is_active: sshKey.is_active,
          });
        } catch (err) {
          toast.error("Failed to load SSH key");
          onClose();
        } finally {
          setInitialLoading(false);
        }
      };
      loadSshKey();
    } else if (open && !editingSshKey) {
      resetForm();
    }
  }, [open, editingSshKey, getSshKeyById, setFormData, resetForm, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    setLoading(true);
    try {
      if (editingSshKey) {
        const updateData: SshKeyUpdate = {
          name: formData.name,
          description: formData.description || undefined,
          is_active: formData.is_active,
        };

        // Only include keys if they're provided
        if (formData.public_key) {
          updateData.public_key = formData.public_key;
        }
        if (formData.private_key) {
          updateData.private_key = formData.private_key;
        }
        if (formData.key_type) {
          updateData.key_type = formData.key_type;
        }

        await updateSshKey(editingSshKey.id, updateData);
        toast.success("SSH key updated successfully");
      } else {
        const createData: SshKeyCreate = {
          name: formData.name,
          description: formData.description || undefined,
          key_type: formData.key_type,
          public_key: formData.public_key,
          private_key: formData.private_key,
        };

        await createSshKey(createData);
        toast.success("SSH key created successfully");
      }

      onSuccess();
      onClose();
    } catch (err) {
      toast.error(
        editingSshKey ? "Failed to update SSH key" : "Failed to create SSH key"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            {editingSshKey ? "Edit SSH Key" : "Create SSH Key"}
          </DialogTitle>
        </DialogHeader>

        {initialLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-muted-foreground">Loading SSH key...</p>
            </div>
          </div>
        ) : (
          <TooltipProvider>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Key className="h-4 w-4" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        placeholder="my-ssh-key"
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-600">{errors.name}</p>
                      )}
                    </div>

                    {/* Key Type */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        Key Type
                        <Badge
                          className={`${getKeyTypeColor(
                            formData.key_type
                          )} text-white text-xs`}
                        >
                          {formData.key_type.toUpperCase()}
                        </Badge>
                      </Label>
                      <Select
                        value={formData.key_type}
                        onValueChange={(value: SshKeyType) =>
                          updateField("key_type", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {keyTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center justify-between w-full">
                                <span className="font-medium">
                                  {option.label}
                                </span>
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
                      onChange={(e) =>
                        updateField("description", e.target.value)
                      }
                      placeholder="SSH key for production servers"
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* SSH Key Pair */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="h-4 w-4" />
                    SSH Key Pair
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Public Key */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="public_key"
                      className="flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        Public Key <span className="text-red-500">*</span>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              The public key that will be shared with remote
                              servers
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </span>
                      {formData.public_key && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleCopy(formData.public_key, "public_key")
                          }
                          className="h-6 px-2"
                        >
                          {copiedField === "public_key" ? (
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
                      onChange={(e) =>
                        updateField("public_key", e.target.value)
                      }
                      placeholder="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQ..."
                      rows={3}
                      className={`font-mono text-sm resize-none ${
                        errors.public_key ? "border-red-500" : ""
                      }`}
                    />
                    {errors.public_key && (
                      <p className="text-sm text-red-600">
                        {errors.public_key}
                      </p>
                    )}
                  </div>

                  {/* Private Key */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="private_key"
                      className="flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        Private Key{" "}
                        {!editingSshKey && (
                          <span className="text-red-500">*</span>
                        )}
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              The private key used for authentication (keep
                              secure!)
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </span>
                      {formData.private_key && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleCopy(formData.private_key, "private_key")
                          }
                          className="h-6 px-2"
                        >
                          {copiedField === "private_key" ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                    </Label>
                    <Textarea
                      id="private_key"
                      value={formData.private_key}
                      onChange={(e) =>
                        updateField("private_key", e.target.value)
                      }
                      placeholder="-----BEGIN OPENSSH PRIVATE KEY-----&#10;b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAAB...&#10;-----END OPENSSH PRIVATE KEY-----"
                      rows={6}
                      className={`font-mono text-sm resize-none ${
                        errors.private_key ? "border-red-500" : ""
                      }`}
                    />
                    {errors.private_key && (
                      <p className="text-sm text-red-600">
                        {errors.private_key}
                      </p>
                    )}
                    {editingSshKey && (
                      <p className="text-xs text-muted-foreground">
                        Leave empty to keep existing private key
                      </p>
                    )}
                  </div>

                  {/* Key pair validation error */}
                  {errors.key_pair && (
                    <Alert className="border-red-200 bg-red-50">
                      <Shield className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        {errors.key_pair}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Security Notice */}
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Security Notice:</strong> Private keys are stored
                      securely and encrypted. Only use trusted key pairs and
                      never share your private key.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Settings */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Settings</CardTitle>
                </CardHeader>
                <CardContent>
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
                      onCheckedChange={(checked) =>
                        updateField("is_active", checked)
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex items-center justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingSshKey ? "Update SSH Key" : "Create SSH Key"}
                </Button>
              </div>
            </form>
          </TooltipProvider>
        )}
      </DialogContent>
    </Dialog>
  );
}
