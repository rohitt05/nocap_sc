import { supabase } from "../../../../../../lib/supabase";
import { Story, MasonryColumnData } from "./types";

/**
 * Fetches user's stories from database with signed URLs
 */
export const fetchMyStories = async (): Promise<Story[]> => {
  try {
    console.log("🔍 Fetching stories...");

    const { data: storiesData, error } = await supabase
      .from("my_stories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Database error:", error);
      return [];
    }

    console.log("📊 Raw stories data:", storiesData?.length || 0);

    if (!storiesData || storiesData.length === 0) {
      console.log("📝 No stories found - showing empty state");
      return [];
    }

    const storiesWithUrls = await Promise.all(
      storiesData.map(async (story) => {
        const { data: signedUrlData } = await supabase.storage
          .from("media_bucket")
          .createSignedUrl(story.media_url, 60 * 60);

        return {
          ...story,
          signedUrl: signedUrlData?.signedUrl,
        };
      })
    );

    console.log("✅ Stories loaded:", storiesWithUrls.length);
    return storiesWithUrls;
  } catch (error) {
    console.error("❌ Error fetching stories:", error);
    return [];
  }
};

/**
 * Formats date for story display
 */
export const formatStoryDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

/**
 * Gets display text for story caption
 */
export const getStoryCaption = (caption: string | null): string => {
  return caption || "Untitled Memory";
};

/**
 * Gets display text for story location
 */
export const getStoryLocation = (locationName: string | null): string => {
  return locationName || "Unknown location";
};

/**
 * Calculate dynamic height for story card based on content
 */
export const calculateStoryCardHeight = (story: Story): number => {
  const baseHeight = 140;
  const captionLength = (story.caption || "").length;
  const locationLength = (story.location_name || "").length;

  // Add height based on text content
  const textHeight = Math.max(
    40,
    Math.min(80, captionLength * 0.8 + locationLength * 0.5)
  );

  // Random variation for Pinterest-like effect (20-60px)
  const randomHeight = Math.floor(Math.random() * 40) + 20;

  return baseHeight + textHeight + randomHeight;
};

/**
 * Create masonry columns from stories array
 */
export const createMasonryColumns = (
  stories: Story[],
  numColumns: number = 2
): MasonryColumnData[] => {
  const columns: MasonryColumnData[] = Array.from(
    { length: numColumns },
    () => ({
      data: [],
      height: 0,
    })
  );

  stories.forEach((story) => {
    // Find column with minimum height
    const shortestColumn = columns.reduce(
      (min, col, index) => (col.height < columns[min].height ? index : min),
      0
    );

    const cardHeight = calculateStoryCardHeight(story);
    columns[shortestColumn].data.push(story);
    columns[shortestColumn].height += cardHeight + 12; // +12 for margin
  });

  return columns;
};
