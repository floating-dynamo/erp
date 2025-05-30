import { useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import APIService from '@/services/api';
import { useToast } from './use-toast';

export const useAuthAPI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const updateProfile = async (data: { name: string; email: string }) => {
    setIsLoading(true);
    try {
      const response = await APIService.updateProfile(data);
      if (response.success) {
        toast({
          title: "Profile Updated",
          description: response.message,
        });
        return true;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update profile",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    setIsLoading(true);
    try {
      const response = await APIService.changePassword(data);
      if (response.success) {
        toast({
          title: "Password Changed",
          description: response.message,
        });
        return true;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Password Change Failed",
        description: error instanceof Error ? error.message : "Failed to change password",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    updateProfile,
    changePassword,
    logout,
  };
};