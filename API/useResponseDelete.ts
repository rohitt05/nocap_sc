import { useState } from "react";
import { supabase } from "../lib/supabase"; // Adjust the import path as needed

interface DeleteResponseParams {
  responseId: string;
}

export const useResponseDelete = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteResponse = async ({
    responseId,
  }: DeleteResponseParams): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Get current user session
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData?.session?.user;

      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      // First, check if the response belongs to the current user
      const { data: responseData, error: fetchError } = await supabase
        .from("responses")
        .select("user_id")
        .eq("id", responseId)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      // If the response is not found or doesn't belong to the current user
      if (!responseData || responseData.user_id !== currentUser.id) {
        throw new Error("You do not have permission to delete this response");
      }

      // If the user is authorized, proceed with deletion
      const { error: deleteError } = await supabase
        .from("responses")
        .delete()
        .eq("id", responseId);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete response";
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteResponse,
    isLoading,
    error,
  };
};
