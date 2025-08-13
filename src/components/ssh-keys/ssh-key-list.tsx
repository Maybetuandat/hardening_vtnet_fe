import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { vi, enUS } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
} from "lucide-react";
import { SshKey, SshKeyType } from "@/types/ssh-key";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";

interface SshKeyListProps {
  sshKeys: SshKey[];
  loading: boolean;
  error: string | null;
  onEdit: (sshKey: SshKey) => void;
  onDelete: (sshKey: SshKey) => void;
}

export const SshKeyList: React.FC<SshKeyListProps> = ({
  sshKeys,
  loading,
  error,
  onEdit,
  onDelete,
}) => {
  const [copiedFingerprint, setCopiedFingerprint] = React.useState<
    string | null
  >(null);

  const { t } = useTranslation("sshkey");
  const handleCopyFingerprint = async (fingerprint: string) => {
    try {
      await navigator.clipboard.writeText(fingerprint);
      setCopiedFingerprint(fingerprint);
      setTimeout(() => setCopiedFingerprint(null), 2000);
    } catch (err) {
      console.error("Failed to copy fingerprint:", err);
    }
  };

  const getKeyTypeColor = (type: SshKeyType) => {
    switch (type) {
      case SshKeyType.ED25519:
        return "bg-green-500";
      case SshKeyType.RSA:
        return "bg-blue-500";
      case SshKeyType.ECDSA:
        return "bg-purple-500";
      case SshKeyType.DSA:
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
    const { i18n } = useTranslation();
    try {
      const currentLocale = i18n.language === "vi" ? vi : enUS;
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: currentLocale,
      });
    } catch {
      return i18n.language === "vi" ? "Không xác định" : "Unknown";
    }
  };

  const truncateFingerprint = (fingerprint?: string, length: number = 20) => {
    if (!fingerprint) return "";
    return fingerprint.length <= length
      ? fingerprint
      : `${fingerprint.substring(0, length)}...`;
  };

  return (
    <div className="space-y-6">
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
                <p className="text-muted-foreground">{t("sshKeys.loading")}</p>
              </div>
            </div>
          ) : sshKeys.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Key className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground mb-2">
                  {t("sshKeys.table.noKeys")}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("sshKeys.table.name")}</TableHead>
                    <TableHead>{t("sshKeys.table.type")}</TableHead>
                    <TableHead>{t("sshKeys.table.fingerprint")}</TableHead>
                    <TableHead>{t("sshKeys.table.status")}</TableHead>
                    <TableHead>{t("sshKeys.table.created")}</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sshKeys.map((sshKey) => (
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
                        <Badge
                          className={`${getKeyTypeColor(
                            sshKey.key_type
                          )} text-white`}
                        >
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
                            onClick={() =>
                              handleCopyFingerprint(sshKey.fingerprint)
                            }
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
                        <Badge
                          variant={sshKey.is_active ? "default" : "secondary"}
                        >
                          {sshKey.is_active
                            ? t("sshKeys.active")
                            : t("sshKeys.inactive")}
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
                            <DropdownMenuLabel>
                              {t("sshKeys.action")}
                            </DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onEdit(sshKey)}>
                              <Edit className="mr-2 h-4 w-4" />
                              {t("sshKeys.table.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleCopyFingerprint(sshKey.fingerprint)
                              }
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              {t("sshKeys.table.copyFingerprint")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onDelete(sshKey)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t("sshKeys.table.delete")}
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
