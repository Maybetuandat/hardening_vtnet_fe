import { useState } from 'react';
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

  const setFormData = (data: Partial<SshKeyFormData>) => {
    setFormDataState(prev => ({ ...prev, ...data }));
    // Clear errors for updated fields
    const clearedErrors = { ...errors };
    Object.keys(data).forEach(key => {
      delete clearedErrors[key];
    });
    setErrors(clearedErrors);
  };

  const updateField = (field: keyof SshKeyFormData, value: any) => {
    setFormData({ [field]: value });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    }

    
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
  };

  const resetForm = () => {
    setFormDataState(initialFormData);
    setErrors({});
  };

  return {
    formData,
    errors,
    setFormData,
    validateForm,
    resetForm,
    updateField,
  };
};