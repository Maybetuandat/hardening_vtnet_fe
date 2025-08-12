// src/hooks/use-ssh-key-form.ts
import { useState, useCallback } from 'react';
import { SshKeyFormData, SshKeyType } from '@/types/ssh-key';

interface UseSshKeyFormReturn {
  formData: SshKeyFormData;
  errors: Record<string, string>;
  setFormData: (data: Partial<SshKeyFormData>) => void;
  validateForm: () => boolean;
  resetForm: () => void;
  updateField: (field: keyof SshKeyFormData, value: any) => void;
}

const initialFormData: SshKeyFormData = {
  name: '',
  description: '',
  key_type: SshKeyType.RSA,
  public_key: '',
  private_key: '',
  is_active: true,
};

export const useSshKeyForm = (initialData?: Partial<SshKeyFormData>): UseSshKeyFormReturn => {
  const [formData, setFormDataState] = useState<SshKeyFormData>({
    ...initialFormData,
    ...initialData,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ Memoize setFormData để tránh re-render
  const setFormData = useCallback((data: Partial<SshKeyFormData>) => {
    setFormDataState(prev => ({ ...prev, ...data }));
    // Clear errors for updated fields
    setErrors(prevErrors => {
      const clearedErrors = { ...prevErrors };
      Object.keys(data).forEach(key => {
        delete clearedErrors[key];
      });
      return clearedErrors;
    });
  }, []); // Empty dependency

  // ✅ Memoize updateField
  const updateField = useCallback((field: keyof SshKeyFormData, value: any) => {
    setFormData({ [field]: value });
  }, [setFormData]); // Depend on stable setFormData

  // ✅ Memoize validateForm
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    }

    // Validate public key
    if (!formData.public_key.trim()) {
      newErrors.public_key = 'Public key is required';
    } else {
      const sshKeyPattern = /^(ssh-rsa|ssh-ed25519|ecdsa-sha2-|ssh-dss)\s+[A-Za-z0-9+/]+[=]{0,2}(\s+.*)?$/;
      if (!sshKeyPattern.test(formData.public_key.trim())) {
        newErrors.public_key = 'Invalid SSH public key format';
      }
    }

    // Validate private key
    if (!formData.private_key.trim()) {
      newErrors.private_key = 'Private key is required';
    } else {
      const privateKey = formData.private_key.trim();
      if (!privateKey.startsWith('-----BEGIN') || !privateKey.endsWith('-----')) {
        newErrors.private_key = 'Invalid private key format';
      } else {
        const validKeyTypes = ['RSA PRIVATE KEY', 'OPENSSH PRIVATE KEY', 'EC PRIVATE KEY', 'DSA PRIVATE KEY'];
        const hasValidType = validKeyTypes.some(keyType => privateKey.includes(keyType));
        if (!hasValidType) {
          newErrors.private_key = 'Invalid private key type';
        }
      }
    }

    // Validate key pair match
    if (formData.public_key && formData.private_key) {
      const publicKeyType = formData.public_key.split(' ')[0];
      const privateKey = formData.private_key;

      let isMatch = false;
      if (publicKeyType === 'ssh-rsa' && privateKey.includes('RSA')) {
        isMatch = true;
      } else if (publicKeyType === 'ssh-ed25519' && privateKey.includes('OPENSSH')) {
        isMatch = true;
      } else if (publicKeyType.startsWith('ecdsa-') && privateKey.includes('EC')) {
        isMatch = true;
      } else if (publicKeyType === 'ssh-dss' && privateKey.includes('DSA')) {
        isMatch = true;
      }

      if (!isMatch) {
        newErrors.key_pair = 'Public and private keys do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]); // Depend on formData

  // ✅ Memoize resetForm
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