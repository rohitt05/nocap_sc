// humanReactionService.ts
import { supabase } from "../../../../../lib/supabase"; // Adjust path as needed

export interface HumanReactionUpload {
  response_id: string;
  user_id: string;
  content_type: "text" | "image" | "video";
  file_url?: string; // Now optional since text doesn't need file_url
  text_content?: string; // New field for text content
}

// New function for text reactions
export const uploadTextReaction = async (
  textContent: string,
  userId: string,
  responseId: string
): Promise<{ success: boolean; error?: string; data?: any }> => {
  try {
    console.log("Starting text reaction upload...", {
      userId,
      responseId,
      textLength: textContent.length,
    });

    const humanReactionData: HumanReactionUpload = {
      response_id: responseId,
      user_id: userId,
      content_type: "text",
      text_content: textContent,
    };

    const { data: insertData, error: insertError } = await supabase
      .from("humanreactions")
      .insert([humanReactionData])
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      return { success: false, error: insertError.message };
    }

    console.log("Text reaction saved to database:", insertData);

    return {
      success: true,
      data: insertData,
    };
  } catch (error) {
    console.error("Text reaction upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export const uploadHumanReaction = async (
  mediaUri: string,
  mediaType: "image" | "video",
  userId: string,
  responseId: string
): Promise<{ success: boolean; error?: string; data?: any }> => {
  try {
    console.log("Starting human reaction upload...", {
      mediaType,
      userId,
      responseId,
    });

    // 1. Create file name
    const timestamp = Date.now();
    const fileExtension = mediaType === "image" ? "jpg" : "mp4";
    const fileName = `user_${userId}/humanreactions/${responseId}_${timestamp}.${fileExtension}`;

    // 2. Handle mobile file upload properly
    let fileData: any;

    // For React Native, we need to handle file uploads differently
    if (mediaUri.startsWith("file://")) {
      // Mobile file path - create FormData
      const formData = new FormData();
      formData.append("file", {
        uri: mediaUri,
        type: mediaType === "image" ? "image/jpeg" : "video/mp4",
        name: fileName.split("/").pop() || "file",
      } as any);
      fileData = formData;
    } else {
      // Web - convert to blob
      const response = await fetch(mediaUri);
      fileData = await response.blob();
    }

    console.log("File prepared for upload:", fileName);

    // 3. Upload to Supabase Storage with proper file handling
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("response_bucket")
      .upload(fileName, fileData, {
        contentType: mediaType === "image" ? "image/jpeg" : "video/mp4",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return { success: false, error: uploadError.message };
    }

    console.log("Upload successful:", uploadData);

    // 4. Get public URL
    const { data: urlData } = supabase.storage
      .from("response_bucket")
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;
    console.log("Public URL generated:", publicUrl);

    // 5. Insert record into humanreactions table
    const humanReactionData: HumanReactionUpload = {
      response_id: responseId,
      user_id: userId,
      content_type: mediaType,
      file_url: publicUrl,
    };

    const { data: insertData, error: insertError } = await supabase
      .from("humanreactions")
      .insert([humanReactionData])
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);

      // Clean up uploaded file if database insert fails
      await supabase.storage.from("response_bucket").remove([fileName]);

      return { success: false, error: insertError.message };
    }

    console.log("Human reaction saved to database:", insertData);

    return {
      success: true,
      data: {
        ...insertData,
        publicUrl,
      },
    };
  } catch (error) {
    console.error("Human reaction upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

// Fetch human reactions for a specific response
export const getHumanReactions = async (responseId: string) => {
  try {
    const { data, error } = await supabase
      .from("humanreactions")
      .select(
        `
        *,
        user:users(id, username, full_name, avatar_url)
      `
      )
      .eq("response_id", responseId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching human reactions:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching human reactions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

// Delete a human reaction
export const deleteHumanReaction = async (
  humanReactionId: string,
  userId: string
) => {
  try {
    // First get the human reaction to get the file URL and content type
    const { data: humanReaction, error: fetchError } = await supabase
      .from("humanreactions")
      .select("file_url, user_id, content_type")
      .eq("id", humanReactionId)
      .eq("user_id", userId) // Ensure user owns this reaction
      .single();

    if (fetchError || !humanReaction) {
      return {
        success: false,
        error: "Human reaction not found or access denied",
      };
    }

    // Delete from database first
    const { error: deleteError } = await supabase
      .from("humanreactions")
      .delete()
      .eq("id", humanReactionId)
      .eq("user_id", userId);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    // Only delete file from storage if it's not a text reaction
    if (humanReaction.content_type !== "text" && humanReaction.file_url) {
      // Extract file path from URL for deletion
      const fileUrl = humanReaction.file_url;
      const fileName = fileUrl.split("/").slice(-3).join("/"); // Extract user_id/humanreactions/filename
      await supabase.storage.from("response_bucket").remove([fileName]);
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting human reaction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
