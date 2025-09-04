import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, MoreHorizontal, Terminal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCommands, CommandResponse } from "@/hooks/command/use-commands";

import { DeleteCommandDialog } from "./delete-command-dialog";
import { CreateCommandDialog } from "./create-command-dialog";
import { EditCommandDialog } from "./edit-command-dialog";

interface CommandsSectionProps {
  ruleId: number;
}

export const CommandsSection: React.FC<CommandsSectionProps> = ({ ruleId }) => {
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCommand, setEditingCommand] = useState<CommandResponse | null>(
    null
  );
  const [deletingCommand, setDeletingCommand] =
    useState<CommandResponse | null>(null);

  const { commands, loading, error, fetchCommandsByRuleId } = useCommands();

  useEffect(() => {
    if (ruleId) {
      fetchCommandsByRuleId(ruleId);
    }
  }, [ruleId, fetchCommandsByRuleId]);

  const handleCommandCreated = () => {
    setIsCreateDialogOpen(false);
    fetchCommandsByRuleId(ruleId);
  };

  const handleCommandUpdated = () => {
    setEditingCommand(null);
    fetchCommandsByRuleId(ruleId);
  };

  const handleCommandDeleted = () => {
    setDeletingCommand(null);
    fetchCommandsByRuleId(ruleId);
  };

  const truncateCommand = (command: string, maxLength: number = 60) => {
    if (command.length <= maxLength) return command;
    return command.substring(0, maxLength) + "...";
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Terminal className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle className="text-xl">
                  Commands ({commands.length})
                </CardTitle>
              </div>
            </div>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              size="sm"
              className="h-8"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm Command
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Có lỗi xảy ra: {error}</p>
            </div>
          ) : commands.length === 0 ? (
            <div className="text-center py-12">
              <Terminal className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">Chưa có command nào</p>
              <p className="text-sm text-muted-foreground">
                Thêm commands để thực thi rule này trên các hệ điều hành khác
                nhau
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>OS Version</TableHead>
                    <TableHead>Command</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="w-[100px]">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commands.map((command) => (
                    <TableRow key={command.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {command.os_version}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          <code className="text-sm bg-muted px-2 py-1 rounded block">
                            {truncateCommand(command.command_text)}
                          </code>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            command.is_active
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                          }
                        >
                          {command.is_active ? "Hoạt động" : "Tạm dừng"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setEditingCommand(command)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeletingCommand(command)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Xóa
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

      {/* Dialogs */}
      <CreateCommandDialog
        ruleId={ruleId}
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCommandCreated}
      />

      {editingCommand && (
        <EditCommandDialog
          command={editingCommand}
          open={!!editingCommand}
          onOpenChange={() => setEditingCommand(null)}
          onSuccess={handleCommandUpdated}
        />
      )}

      {deletingCommand && (
        <DeleteCommandDialog
          command={deletingCommand}
          open={!!deletingCommand}
          onOpenChange={() => setDeletingCommand(null)}
          onSuccess={handleCommandDeleted}
        />
      )}
    </>
  );
};
