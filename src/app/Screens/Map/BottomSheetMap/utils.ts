// utils.ts
import * as FileSystem from "expo-file-system";
import { supabase } from "../../../../../lib/supabase";

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

// 🗄️ AUTH UTILITIES
export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) {
      throw new Error("User not authenticated");
    }
    return user;
  } catch (error) {
    console.error("❌ Error getting current user:", error);
    throw error;
  }
};

// 🗄️ FILE UPLOAD UTILITIES
export const decode = (str: string): Uint8Array => {
  const binaryString = atob(str);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const uploadMediaToStorageBucket = async (
  mediaUri: string,
  mediaType: string
): Promise<string> => {
  try {
    console.log("📤 Uploading media to storage bucket...");

    const user = await getCurrentUser();

    // Generate unique filename
    const fileExtension = mediaType === "photo" ? "jpg" : "mp4";
    const fileName = `user_${user.id}/${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}.${fileExtension}`;

    // Read file as base64
    const fileInfo = await FileSystem.getInfoAsync(mediaUri);
    if (!fileInfo.exists) {
      throw new Error("Media file not found");
    }

    const base64 = await FileSystem.readAsStringAsync(mediaUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Upload to storage bucket
    const { data, error } = await supabase.storage
      .from("media_bucket")
      .upload(fileName, decode(base64), {
        contentType: mediaType === "photo" ? "image/jpeg" : "video/mp4",
        upsert: false,
      });

    if (error) {
      throw error;
    }

    console.log("✅ Media uploaded successfully:", fileName);
    return fileName; // Return the path for database storage
  } catch (error) {
    console.error("❌ Error uploading media:", error);
    throw error;
  }
};

// utils.ts - Fix the createStoryInDatabase function
export const createStoryInDatabase = async (
  mediaPath: string,
  mediaType: string,
  caption: string,
  location: LocationData | null,
  locationName: string,
  isLocationVisible: boolean
): Promise<void> => {
  try {
    console.log("📱 Creating story in database...");

    const user = await getCurrentUser();

    const storyData = {
      user_id: user.id,
      media_url: mediaPath,
      media_type: mediaType,
      caption: caption.trim() || null,
      location_latitude:
        isLocationVisible && location ? location.latitude : null,
      location_longitude:
        isLocationVisible && location ? location.longitude : null,
      location_name: isLocationVisible && location ? locationName : null,
      location_accuracy:
        isLocationVisible && location ? location.accuracy : null,
      duration_ms: mediaType === "photo" ? 5000 : 15000,
      is_location_visible: isLocationVisible,
      // ✅ FIX: Explicitly set these values
      is_active: true,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
    };

    console.log("🔍 Story data being inserted:", storyData);

    const { data, error } = await supabase
      .from("stories")
      .insert([storyData])
      .select() // ✅ FIX: Add select() to return inserted data
      .single();

    if (error) {
      console.error("❌ Database error:", error);
      throw error;
    }

    console.log("✅ Story created successfully:", data);
  } catch (error) {
    console.error("❌ Error creating story:", error);
    throw error;
  }
};

// 🗄️ ALBUM DATABASE FUNCTIONS
export const createAlbumInDatabase = async (
  mediaPath: string,
  mediaType: string,
  caption: string,
  location: LocationData | null,
  locationName: string,
  albumName: string
): Promise<void> => {
  try {
    console.log("📸 Creating album in database...");

    const user = await getCurrentUser();

    // Create album
    const albumData = {
      user_id: user.id,
      name: albumName,
      description: `Album created at ${locationName}`,
      location_latitude: location ? location.latitude : null,
      location_longitude: location ? location.longitude : null,
      location_name: locationName,
      cover_media_url: mediaPath, // Use this media as cover
    };

    const { data: album, error: albumError } = await supabase
      .from("albums")
      .insert([albumData])
      .select()
      .single();

    if (albumError) {
      throw albumError;
    }

    // Add media to album
    const mediaData = {
      album_id: album.id,
      media_url: mediaPath,
      media_type: mediaType,
      caption: caption.trim() || null,
      location_latitude: location ? location.latitude : null,
      location_longitude: location ? location.longitude : null,
      location_name: locationName,
      location_accuracy: location ? location.accuracy : null,
      sort_order: 0, // First item in album
    };

    const { error: mediaError } = await supabase
      .from("album_media")
      .insert([mediaData]);

    if (mediaError) {
      throw mediaError;
    }

    console.log("✅ Album created successfully:", album.id);
  } catch (error) {
    console.error("❌ Error creating album:", error);
    throw error;
  }
};

// 🗄️ MAPBOX UTILITIES
export const getLocationNameFromCoordinates = async (
  latitude: number,
  longitude: number,
  mapboxToken: string
): Promise<string> => {
  if (!mapboxToken) {
    console.error("Mapbox access token not found");
    return "Location unavailable";
  }

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxToken}&types=place,locality,neighborhood`;

    console.log("🌍 Requesting location from Mapbox:", { latitude, longitude });

    const response = await fetch(url);
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      let bestLocationName = "";

      for (const feat of data.features) {
        const placeType = feat.place_type || [];

        if (placeType.includes("locality")) {
          bestLocationName = feat.text;
          break;
        } else if (placeType.includes("place")) {
          bestLocationName = feat.text;
          break;
        } else if (placeType.includes("neighborhood")) {
          bestLocationName = feat.text;
          break;
        }
      }

      if (!bestLocationName) {
        bestLocationName =
          feature.text || feature.place_name || "Unknown location";
      }

      const cleanLocationName = bestLocationName.split(",")[0].trim();
      console.log("📍 Location found:", cleanLocationName);
      return cleanLocationName;
    } else {
      console.log("No location features found");
      return "Location not found";
    }
  } catch (error) {
    console.error("Error getting location name:", error);
    return "Location unavailable";
  }
};

// 🗄️ MEDIA UTILITIES
export const formatTime = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const generateMediaId = (): string => {
  return `saved_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 🗄️ CONTENT MODE UTILITIES
export const determineContentMode = (
  mode: string,
  mediaUri: string | null,
  mediaType: string | null
): "stories" | "friends" | "media" => {
  console.log("🎯 Determining content mode:", { mode, mediaUri, mediaType });

  if (mode === "stories") {
    console.log("📚 Showing Stories mode");
    return "stories";
  }
  if (mode === "friends") {
    console.log("👥 Showing Friends mode");
    return "friends";
  }
  if (mode === "media" && mediaUri && mediaType) {
    console.log("🎬 Showing Media mode");
    return "media";
  }

  console.log("👥 Defaulting to Friends mode");
  return "friends";
};

export const getMediaInfo = (
  contentMode: string,
  mediaWithLocation: any,
  mediaUri: string | null,
  mediaType: string | null
) => {
  if (contentMode !== "media") return null;

  if (mediaWithLocation) {
    return {
      uri: mediaWithLocation.uri,
      type: mediaWithLocation.type,
      hasLocation: !!mediaWithLocation.location,
      isFromCapture: true,
    };
  } else if (mediaUri && mediaType) {
    return {
      uri: mediaUri,
      type: mediaType,
      hasLocation: false,
      isFromCapture: false,
    };
  }
  return null;
};
// utils.ts - FIXED: Remove user_id from album_media insert
export const addMediaToExistingAlbum = async (
  albumId: string,
  mediaPath: string,
  mediaType: "photo" | "video",
  caption: string,
  location: LocationData,
  locationName: string
) => {
  try {
    const userId = await getCurrentUser();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    console.log("📸 Adding media to album:", albumId);

    // ✅ FIXED: Remove user_id from insert - album_media table doesn't have this column
    const { error: mediaError } = await supabase.from("album_media").insert({
      album_id: albumId,
      // ❌ REMOVED: user_id: userId, // This column doesn't exist in album_media table
      media_url: mediaPath,
      media_type: mediaType,
      caption: caption.trim() || null,
      location_latitude: location.latitude,
      location_longitude: location.longitude,
      location_name: locationName,
      location_accuracy: location.accuracy || null,
      sort_order: 0, // ✅ ADDED: Default sort order
      created_at: new Date().toISOString(),
    });

    if (mediaError) {
      console.error("❌ Error inserting media into album:", mediaError);
      throw mediaError;
    }

    console.log("✅ Media added to existing album successfully");
  } catch (error) {
    console.error("❌ Error in addMediaToExistingAlbum:", error);
    throw error;
  }
};
