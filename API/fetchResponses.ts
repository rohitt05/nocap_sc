import { supabase } from "../lib/supabase";
import { fetchPromptOfTheDay } from "./fetchpromptoftheday";

// Define types to match your schema and existing components
export interface User {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
}

export interface Response {
  id: string;
  user_id: string;
  prompt_id: string;
  content_type: "text" | "image" | "video" | "audio" | "gif";
  file_url: string | null;
  text_content: string | null;
  created_at: string;
  reactions?: Reaction[];
  user?: User;
}

export interface Reaction {
  id: string;
  response_id: string;
  user_id: string;
  reaction_type: string;
  created_at: string;
}

// Map our Response type to the ResponseItemData type expected by the Responses component
export interface ResponseItemData {
  id: string;
  type: "text" | "image" | "video" | "audio" | "gif";
  content: string;
  caption?: string; // Add this line to include the caption field
  timestamp: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string | null;
  };
  reactions: {
    count: number;
    hasUserReacted: boolean;
  };
}

export interface ResponsesData {
  responses_received: ResponseItemData[];
}

/**
 * Fetches all responses for the current Prompt of the Day
 */
export async function fetchResponses(): Promise<ResponsesData> {
  try {
    // First, get the current prompt of the day
    const promptData = await fetchPromptOfTheDay();
    const promptId = promptData.prompt.id;

    // Get the current user's ID
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const currentUserId = user?.id;

    if (!currentUserId) {
      throw new Error("User not authenticated");
    }

    // Fetch the user's friends (those with 'accepted' status)
    const { data: friendships, error: friendshipsError } = await supabase
      .from("friendships")
      .select("friend_id")
      .eq("user_id", currentUserId)
      .eq("status", "accepted");

    if (friendshipsError) {
      throw friendshipsError;
    }

    // Also get friendships where the user is the friend
    const { data: reverseFriendships, error: reverseFriendshipsError } =
      await supabase
        .from("friendships")
        .select("user_id")
        .eq("friend_id", currentUserId)
        .eq("status", "accepted");

    if (reverseFriendshipsError) {
      throw reverseFriendshipsError;
    }

    // Create an array of friend IDs
    const friendIds = [
      ...friendships.map((f) => f.friend_id),
      ...reverseFriendships.map((f) => f.user_id),
    ];

    // Include the current user's ID in the allowed users
    const allowedUserIds = [currentUserId, ...friendIds];

    // Fetch responses from the allowed users only
    const { data: responses, error } = await supabase
      .from("responses")
      .select(
        `
                *,
                user:user_id(id, full_name, username, avatar_url)
            `
      )
      .eq("prompt_id", promptId)
      .in("user_id", allowedUserIds)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    // The rest of your existing code for reactions remains the same
    // Fetch all reactions for these responses
    let reactionsPromises = responses.map((response) =>
      supabase.from("reactions").select("*").eq("response_id", response.id)
    );

    // Wait for all reaction queries to complete
    const reactionsResults = await Promise.all(reactionsPromises);

    // Map the raw responses to the format expected by the Responses component
    const formattedResponses: ResponseItemData[] = responses.map(
      (response, index) => {
        const reactionsForResponse = reactionsResults[index].data || [];
        const hasUserReacted = reactionsForResponse.some(
          (reaction) => reaction.user_id === currentUserId
        );

        return {
          id: response.id,
          type: response.content_type,
          content:
            response.content_type === "text"
              ? response.text_content || ""
              : response.file_url || "",
          caption: response.text_content || "", // Add the text_content as caption for all response types
          timestamp: response.created_at,
          user: {
            id: response.user?.id || "",
            name: response.user?.full_name || "Unknown User",
            username: response.user?.username || "unknown",
            avatar: response.user?.avatar_url || null,
          },
          reactions: {
            count: reactionsForResponse.length,
            hasUserReacted: hasUserReacted,
          },
        };
      }
    );

    return {
      responses_received: formattedResponses,
    };
  } catch (error) {
    console.error("Error fetching responses:", error);
    // Return empty array in case of error
    return { responses_received: [] };
  }
}

/**
 * Adds a reaction to a response
 */
export async function toggleReaction(
  responseId: string,
  reactionType: string = "like"
): Promise<boolean> {
  try {
    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Check if the user has already reacted
    const { data: existingReaction } = await supabase
      .from("reactions")
      .select("*")
      .eq("response_id", responseId)
      .eq("user_id", user.id)
      .eq("reaction_type", reactionType)
      .single();

    if (existingReaction) {
      // If reaction exists, remove it
      const { error } = await supabase
        .from("reactions")
        .delete()
        .eq("id", existingReaction.id);

      if (error) throw error;
      return false; // Reaction removed
    } else {
      // Otherwise, add a new reaction
      const { error } = await supabase.from("reactions").insert({
        response_id: responseId,
        user_id: user.id,
        reaction_type: reactionType,
      });

      if (error) throw error;
      return true; // Reaction added
    }
  } catch (error) {
    console.error("Error toggling reaction:", error);
    throw error;
  }
}
