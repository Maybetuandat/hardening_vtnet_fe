import { useState, useCallback } from "react";
import { SshKeyFormData, SshKeyType } from "@/types/ssh-key";

interface UseSshKeyFormReturn {
  formData: SshKeyFormData;
  errors: Record<string, string>;
  setFormData: (data: Partial<SshKeyFormData>) => void;
  validateForm: () => boolean;
  resetForm: () => void;
  updateField: (field: keyof SshKeyFormData, value: any) => void;
}

const initialFormData: SshKeyFormData = {
  name: "",
  description: "",
  key_type: SshKeyType.RSA,
  public_key: "",
  private_key: "",
  is_active: true,
};

export const useSshKeyForm = (
  initialData?: Partial<SshKeyFormData>,
  isEditMode = false
): UseSshKeyFormReturn => {
  const [formData, setFormDataState] = useState<SshKeyFormData>({
    ...initialFormData,
    ...initialData,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setFormData = useCallback((data: Partial<SshKeyFormData>) => {
    setFormDataState((prev) => ({ ...prev, ...data }));
    setErrors((prevErrors) => {
      const clearedErrors = { ...prevErrors };
      Object.keys(data).forEach((key) => {
        delete clearedErrors[key];
      });
      return clearedErrors;
    });
  }, []);

  const updateField = useCallback(
    (field: keyof SshKeyFormData, value: any) => {
      setFormData({ [field]: value });
    },
    [setFormData]
  ); // Depend on stable setFormData

  // Simplified validateForm - chỉ validate format và required
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length > 100) {
      newErrors.name = "Name must be less than 100 characters";
    }

    // Validate public key - chỉ check format cơ bản và required
    if (!formData.public_key.trim()) {
      newErrors.public_key = "Public key is required";
    } else {
      // Basic SSH public key format check
      const sshKeyPattern =
        /^(ssh-rsa|ssh-ed25519|ecdsa-sha2-[\w-]+|ssh-dss)\s+[A-Za-z0-9+/]+=*(\s+.*)?$/;
      if (!sshKeyPattern.test(formData.public_key.trim())) {
        newErrors.public_key = "Invalid SSH public key format";
      }
    }

    if (isEditMode) {
      // Edit mode: Private key không bắt buộc, nhưng nếu có thì phải đúng format
      if (formData.private_key.trim()) {
        const privateKey = formData.private_key.trim();
        if (
          !privateKey.startsWith("-----BEGIN") ||
          !privateKey.endsWith("-----")
        ) {
          newErrors.private_key =
            "Invalid private key format - must start with -----BEGIN and end with -----";
        }
      }
    } else {
      // Create mode: Private key bắt buộc
      if (!formData.private_key.trim()) {
        newErrors.private_key = "Private key is required";
      } else {
        const privateKey = formData.private_key.trim();
        if (
          !privateKey.startsWith("-----BEGIN") ||
          !privateKey.endsWith("-----")
        ) {
          newErrors.private_key =
            "Invalid private key format - must start with -----BEGIN and end with -----";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]); // Depend on formData

  //  Memoize resetForm
  const resetForm = useCallback(() => {
    setFormDataState(initialFormData);
    setErrors({});
  }, []); // Empty dependency

  return {
    formData,
    errors,
    setFormData,
    validateForm,
    resetForm,
    updateField,
  };
};
