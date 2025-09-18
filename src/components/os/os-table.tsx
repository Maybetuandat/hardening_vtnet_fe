import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, Calendar, Loader2 } from "lucide-react";
import { OSVersion } from "@/types/os";
import { AdminOnly, NoPermission } from "@/components/auth/role-guard";
import { usePermissions } from "@/hooks/authentication/use-permissions";

interface OSTableProps {
  osVersions: OSVersion[];
  loading: boolean;
  error: string | null;
  onEdit: (os: OSVersion) => void;
  onDelete: (os: OSVersion) => void;
}

export const OSTable: React.FC<OSTableProps> = ({
  osVersions,
  loading,
  error,
  onEdit,
  onDelete,
}) => {
  const { t, i18n } = useTranslation("os");
  const { isAdmin } = usePermissions();

  const formatDate = (dateString: string) => {
    const locale = i18n.language === "vi" ? "vi-VN" : "en-US";
    return new Date(dateString).toLocaleString(locale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-900">
                {t("osTable.headers.id")}
              </TableHead>
              <TableHead className="font-semibold text-gray-900">
                {t("osTable.headers.version")}
              </TableHead>
              <TableHead className="font-semibold text-gray-900">
                {t("osTable.headers.createdAt")}
              </TableHead>
              <TableHead className="font-semibold text-gray-900">
                {t("osTable.headers.updatedAt")}
              </TableHead>
              {/* Chỉ hiển thị cột Actions cho admin */}
              <AdminOnly>
                <TableHead className="font-semibold text-gray-900 text-right">
                  {t("osTable.headers.actions")}
                </TableHead>
              </AdminOnly>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={isAdmin() ? 5 : 4}
                  className="text-center py-8"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("osTable.states.loading")}
                  </div>
                </TableCell>
              </TableRow>
            ) : osVersions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isAdmin() ? 5 : 4}
                  className="text-center py-8"
                >
                  <div className="text-gray-500">
                    {t("osTable.states.noData")}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              osVersions.map((os) => (
                <TableRow key={os.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{os.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono">
                        {os.version}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {formatDate(os.created_at)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {formatDate(os.updated_at)}
                    </div>
                  </TableCell>
                  {/* Chỉ hiển thị Actions cho admin */}
                  <AdminOnly>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(os)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete(os)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </AdminOnly>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
