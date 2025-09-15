// src/pages/profile/ProfilePage.tsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/authentication/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Edit2,
  Save,
  X,
  Eye,
  EyeOff,
} from "lucide-react";

const ProfilePage: React.FC = () => {
  const { t } = useTranslation("user");
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const getInitials = (user: any): string => {
    if (!user) return "U";

    if (user.full_name) {
      const parts = user.full_name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return parts[0][0].toUpperCase();
    }

    return user.username[0].toUpperCase();
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "user":
        return "default";
      default:
        return "secondary";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleEditSubmit = async () => {
    try {
      // TODO: Implement update user API call
      console.log("Update user:", editForm);
      // updateUser({ ...user, ...editForm });
      setIsEditing(false);
      // Show success message
      console.log(t("profile.messages.updateSuccess"));
    } catch (error) {
      console.error(t("profile.messages.updateError"));
    }
  };

  const handlePasswordSubmit = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert(t("profile.messages.passwordMismatch"));
      return;
    }

    try {
      // TODO: Implement change password API call
      console.log("Change password:", passwordForm);
      setIsChangingPassword(false);
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      // Show success message
      console.log(t("profile.messages.passwordChangeSuccess"));
    } catch (error) {
      console.error(t("profile.messages.passwordChangeError"));
    }
  };

  if (!user) {
    return <div>{t("profile.loading")}</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("profile.title")}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {getInitials(user)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl">
                {user.full_name || user.username}
              </CardTitle>
              <CardDescription className="flex items-center justify-center gap-2">
                <Badge
                  variant={getRoleBadgeVariant(user.role)}
                  className="capitalize"
                >
                  {t(`profile.roles.${user.role}`, user.role)}
                </Badge>
                {user.is_active ? (
                  <Badge variant="default" className="bg-green-500">
                    {t("profile.status.active")}
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    {t("profile.status.inactive")}
                  </Badge>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.username}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {t("profile.fields.joinedDate")} {formatDate(user.created_at)}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm capitalize">
                  {t(`profile.roles.${user.role}`, user.role)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Profile */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("profile.personalInfo.title")}</CardTitle>
                  <CardDescription>
                    {t("profile.personalInfo.description")}
                  </CardDescription>
                </div>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    <Edit2 className="mr-2 h-4 w-4" />
                    {t("profile.actions.edit")}
                  </Button>
                ) : (
                  <div className="space-x-2">
                    <Button onClick={handleEditSubmit} size="sm">
                      <Save className="mr-2 h-4 w-4" />
                      {t("profile.actions.save")}
                    </Button>
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      size="sm"
                    >
                      <X className="mr-2 h-4 w-4" />
                      {t("profile.actions.cancel")}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">
                    {t("profile.fields.username")}
                  </Label>
                  <Input
                    id="username"
                    value={user.username}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label htmlFor="full_name">
                    {t("profile.fields.fullName")}
                  </Label>
                  <Input
                    id="full_name"
                    value={
                      isEditing ? editForm.full_name : user.full_name || ""
                    }
                    onChange={(e) =>
                      setEditForm({ ...editForm, full_name: e.target.value })
                    }
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="email">{t("profile.fields.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={isEditing ? editForm.email : user.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("profile.security.title")}</CardTitle>
                  <CardDescription>
                    {t("profile.security.description")}
                  </CardDescription>
                </div>
                {!isChangingPassword ? (
                  <Button
                    onClick={() => setIsChangingPassword(true)}
                    variant="outline"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    {t("profile.actions.changePassword")}
                  </Button>
                ) : (
                  <div className="space-x-2">
                    <Button onClick={handlePasswordSubmit} size="sm">
                      <Save className="mr-2 h-4 w-4" />
                      {t("profile.actions.update")}
                    </Button>
                    <Button
                      onClick={() => setIsChangingPassword(false)}
                      variant="outline"
                      size="sm"
                    >
                      <X className="mr-2 h-4 w-4" />
                      {t("profile.actions.cancel")}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            {isChangingPassword && (
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="current_password">
                    {t("profile.fields.currentPassword")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="current_password"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordForm.current_password}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          current_password: e.target.value,
                        })
                      }
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="new_password">
                    {t("profile.fields.newPassword")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="new_password"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.new_password}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          new_password: e.target.value,
                        })
                      }
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirm_password">
                    {t("profile.fields.confirmPassword")}
                  </Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={passwordForm.confirm_password}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirm_password: e.target.value,
                      })
                    }
                  />
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
