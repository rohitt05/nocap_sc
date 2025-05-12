import { supabase } from "../lib/supabase";

export interface BlockedUser {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
  blocked_user: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string | null;
  };
}

/**
 * Fetches the list of users blocked by the currently authenticated user
 */
export async function getBlockedUsers(): Promise<BlockedUser[]> {
  try {
    // First check if the user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    // Fetch blocked users with their profile information
    const { data, error } = await supabase
      .from("blocked_users")
      .select(
        `
        id,
        blocker_id,
        blocked_id,
        created_at,
        blocked_user:blocked_users_blocked_id_fkey!inner(
          id,
          full_name,
          username,
          avatar_url
        )
      `
      )
      .eq("blocker_id", user.id);

    if (error) {
      throw error;
    }

    return (
      data.map((item) => ({
        ...item,
        blocked_user: Array.isArray(item.blocked_user)
          ? item.blocked_user[0]
          : item.blocked_user,
      })) || []
    );
  } catch (error) {
    console.error("Error fetching blocked users:", error);
    throw error;
  }
}

/**
 * Unblocks a user by deleting the blocked_users record
 */
export async function unblockUser(blockedUserId: string): Promise<void> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    const { error } = await supabase
      .from("blocked_users")
      .delete()
      .eq("blocker_id", user.id)
      .eq("blocked_id", blockedUserId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error unblocking user:", error);
    throw error;
  }
}
