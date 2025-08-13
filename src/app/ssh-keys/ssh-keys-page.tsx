import HeaderSshKeyManagement from "@/components/ssh-keys/ssh-key-header";
import { SshKeyList } from "@/components/ssh-keys/ssh-key-list";
import FilterBar from "@/components/ui/filter-bar";
import { SshKeyType } from "@/types/ssh-key";
import { useState } from "react";

export default function SshKeyPage() {
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("all");
  const [sshKeyType, setSshKeyType] = useState(SshKeyType.DSA);

  const handleClickButtonAdd = () => {
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  return (
    <div className="min-h-screen w-full px-4 px-6 space-y-6">
      <HeaderSshKeyManagement
        onAdd={handleClickButtonAdd}
        onRefresh={() => {}}
        loading={false}
      />
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={[
          {
            value: status,
            onChange: setStatus,
            options: [
              { value: "all", label: "All" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ],
            placeholder: "Status",
            widthClass: "w-32",
          },
          {
            value: sshKeyType,
            onChange: (value) => setSshKeyType(value as SshKeyType),
            options: [
              { value: SshKeyType.RSA, label: "RSA" },
              { value: SshKeyType.ED25519, label: "Ed25519" },
              { value: SshKeyType.ECDSA, label: "ECDSA" },
              { value: SshKeyType.DSA, label: "DSA" },
            ],
            placeholder: "SSH Key Type",
            widthClass: "w-32",
          },
        ]}
      />
    </div>
  );
}
