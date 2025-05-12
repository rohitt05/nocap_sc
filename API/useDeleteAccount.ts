import { useState } from "react";
import { Alert } from "react-native";
import { supabase } from "../lib/supabase";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Custom hook to handle account deletion functionality
 * @returns Object containing deletion status and functions
 */
export const useDeleteAccount = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Clears all local storage data
   */
  const clearLocalStorage = async () => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error("Error clearing AsyncStorage:", error);
    }
  };

  /**
   * Handles the account deletion process
   */
  const deleteAccount = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("No authenticated user found");
      }

      // Call the RPC function to delete the user account
      const { error: rpcError } = await supabase.rpc("delete_user_account", {
        user_id_to_delete: user.id,
      });

      if (rpcError) {
        throw new Error(`Failed to delete account: ${rpcError.message}`);
      }

      // Sign out the user
      await supabase.auth.signOut();

      // Clear local storage
      await clearLocalStorage();

    } catch (error: any) {
      setError(
        error.message || "An error occurred while deleting your account"
      );
      console.error("Delete account error:", error);
      return false;
    } finally {
      setIsDeleting(false);
    }

    return true;
  };

  /**
   * Shows confirmation dialog before deleting account
   */
  const confirmDelete = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: deleteAccount,
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  return {
    isDeleting,
    error,
    deleteAccount,
    confirmDelete,
  };
};
