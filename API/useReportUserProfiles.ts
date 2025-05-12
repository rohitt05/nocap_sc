import { useState } from "react";
import { supabase } from "../lib/supabase"; // Adjust path as needed

export type UserReportReason =
  | "i_dont_like_it"
  | "bullying_or_unwanted_contact"
  | "suicide_self_injury_or_eating_disorders"
  | "violence_hate_or_exploitation"
  | "selling_or_promoting_restricted_items"
  | "nudity_or_sexual_activity"
  | "scam_fraud_or_spam"
  | "false_information"
  | "intellectual_property";

type ReportStatus = "idle" | "loading" | "success" | "error";

interface UseReportUserProfilesProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for reporting user profiles
 */
export const useReportUserProfiles = (options?: UseReportUserProfilesProps) => {
  const [status, setStatus] = useState<ReportStatus>("idle");
  const [error, setError] = useState<Error | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentReportUserId, setCurrentReportUserId] = useState<string | null>(
    null
  );
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  /**
   * Reports a user for inappropriate behavior
   */
  const reportUser = async (
    reportedUserId: string,
    reason: UserReportReason
  ) => {
    try {
      setStatus("loading");

      // Get current user's ID
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to report a user");
      }

      // Format reason as a readable string with spaces
      const formattedReason = reason
        .replace(/_/g, " ")
        .replace(/^i_dont_like_it$/, "I just don't like it");

      const reportData = {
        reporter_id: user.id,
        reported_user_id: reportedUserId,
        reason: formattedReason,
      };

      // Insert into user_reports table
      const { error: insertError } = await supabase
        .from("user_reports")
        .insert(reportData);

      if (insertError) {
        // Handle unique constraint violation
        if (insertError.code === "23505") {
          throw new Error("You have already reported this user");
        }
        throw new Error(insertError.message);
      }

      setStatus("success");
      options?.onSuccess?.();

      return true;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to report user");
      setError(error);
      setStatus("error");
      options?.onError?.(error);

      return false;
    } finally {
      setStatus("idle"); // Reset status when done
    }
  };

  /**
   * Opens the report modal for a specific user
   */
  const openReportModal = (userId: string, username: string) => {
    setCurrentReportUserId(userId);
    setCurrentUsername(username);
    setIsModalVisible(true);
  };

  /**
   * Closes the report modal
   */
  const closeReportModal = () => {
    setIsModalVisible(false);
    // Reset values after animation completes
    setTimeout(() => {
      setCurrentReportUserId(null);
      setCurrentUsername(null);
    }, 300);
  };

  /**
   * Handles the submission of a report
   */
  const handleSubmitReport = async (reason: UserReportReason) => {
    if (!currentReportUserId) return;

    const success = await reportUser(currentReportUserId, reason);

    if (success) {
      closeReportModal();
    }
  };

  return {
    reportUser,
    openReportModal,
    closeReportModal,
    handleSubmitReport,
    isModalVisible,
    currentReportUserId,
    currentUsername,
    status,
    error,
    isLoading: status === "loading",
  };
};
