// utils.ts - FIXED VERSION WITH CORRECT DATE FILTERING
import {
  ActivityLocation,
  TimeframeType,
  MapStyleType,
  UserLocation,
  MediaItem,
} from "./types";
import { Alert } from "react-native";
import * as Location from "expo-location";
import { supabase } from "../../../../../lib/supabase";

export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getTimeframeText = (timeframe: TimeframeType): string => {
  switch (timeframe) {
    case "today":
      return "Today";
    case "week":
      return "This Week";
    case "month":
      return "This Month";
    case "year":
      return "This Year";
    default:
      return "Today";
  }
};

export const getMapStyleURL = (mapStyle: MapStyleType): string => {
  switch (mapStyle) {
    case "streets":
      return "mapbox://styles/mapbox/streets-v12";
    case "satellite":
      return "mapbox://styles/mapbox/satellite-streets-v12";
    case "outdoors":
      return "mapbox://styles/mapbox/outdoors-v12";
    default:
      return "mapbox://styles/mapbox/outdoors-v12";
  }
};

export const getNextMapStyle = (currentStyle: MapStyleType): MapStyleType => {
  const styles: MapStyleType[] = ["streets", "satellite", "outdoors"];
  const currentIndex = styles.indexOf(currentStyle);
  const nextIndex = (currentIndex + 1) % styles.length;
  return styles[nextIndex];
};

export const animateToLocation = (
  location: ActivityLocation,
  cameraRef: React.RefObject<any>,
  setSelectedLocationId: (id: string | null) => void
): void => {
  setSelectedLocationId(location.id);

  console.log(`📍 Animating to location: ${location.name}`);
  console.log(`📍 Coordinates: [${location.longitude}, ${location.latitude}]`);

  setTimeout(() => {
    setSelectedLocationId(null);
  }, 3000);
};

// FIXED: Updated filtering logic to work with database dates (created_at)
export const filterActivitiesByTimeframe = (
  activities: ActivityLocation[],
  timeframe: TimeframeType
): ActivityLocation[] => {
  const now = new Date();

  return activities.filter((activity) => {
    // Handle both timestamp (number) and created_at (string) formats
    const activityDate = activity.timestamp
      ? new Date(activity.timestamp)
      : new Date(activity.created_at || Date.now());

    switch (timeframe) {
      case "today":
        // Compare only date parts, ignoring time
        return (
          activityDate.getFullYear() === now.getFullYear() &&
          activityDate.getMonth() === now.getMonth() &&
          activityDate.getDate() === now.getDate()
        );

      case "week":
        // Current week (Sunday to Saturday)
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        return activityDate >= startOfWeek && activityDate <= endOfWeek;

      case "month":
        // Current month
        return (
          activityDate.getFullYear() === now.getFullYear() &&
          activityDate.getMonth() === now.getMonth()
        );

      case "year":
        // Current year
        return activityDate.getFullYear() === now.getFullYear();

      default:
        return true;
    }
  });
};

export const calculateMapCenter = (
  userLocation: { latitude: number; longitude: number } | null,
  activities: ActivityLocation[]
): [number, number] => {
  if (userLocation) {
    return [userLocation.longitude, userLocation.latitude];
  }

  if (activities.length > 0) {
    const avgLat =
      activities.reduce((sum, loc) => sum + loc.latitude, 0) /
      activities.length;
    const avgLng =
      activities.reduce((sum, loc) => sum + loc.longitude, 0) /
      activities.length;
    return [avgLng, avgLat];
  }

  // Default to San Francisco
  return [-122.4194, 37.7749];
};

export const createMapInteractionHandler = (
  setIsMapInteracting: (value: boolean) => void,
  timeoutRef: React.RefObject<NodeJS.Timeout | null>,
  onStart?: () => void,
  onEnd?: () => void
) => {
  const handleStart = (): void => {
    setIsMapInteracting(true);
    onStart?.();

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleEnd = (): void => {
    setIsMapInteracting(false);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onEnd?.();
    }, 200);
  };

  return { handleStart, handleEnd };
};

export const toggleExpandedItem = (
  id: string,
  expandedItems: Set<string>,
  setExpandedItems: React.Dispatch<React.SetStateAction<Set<string>>>
): void => {
  setExpandedItems((prev) => {
    const newSet = new Set(prev);
    if (newSet.has(id)) {
      newSet.delete(id);
      console.log("🔽 Collapsed item:", id);
    } else {
      newSet.add(id);
      console.log("🔼 Expanded item:", id);
    }
    return newSet;
  });
};

// 🗺️ DATABASE FUNCTIONS

export const saveLocationToDatabase = async (
  userId: string,
  location: UserLocation,
  locationName?: string
): Promise<void> => {
  try {
    console.log("💾 Saving location to database...");

    const { error } = await supabase.rpc("update_user_location", {
      p_user_id: userId,
      p_latitude: location.latitude,
      p_longitude: location.longitude,
      p_location_name: locationName || "Current Location",
      p_accuracy: location.accuracy || null,
    });

    if (error) {
      console.error("❌ Error saving location:", error);
      throw error;
    } else {
      console.log("✅ Location saved to database successfully");
    }
  } catch (error) {
    console.error("❌ Unexpected error saving location:", error);
    throw error;
  }
};

export const getStoredLocationFromDatabase = async (
  userId: string
): Promise<
  (UserLocation & { locationName?: string; lastUpdated: string }) | null
> => {
  try {
    console.log("📍 Fetching stored location from database...");

    const { data, error } = await supabase
      .from("user_locations")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        console.log("📍 No stored location found in database");
        return null;
      }
      throw error;
    }

    return {
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      accuracy: data.accuracy,
      locationName: data.location_name,
      lastUpdated: data.updated_at,
    };
  } catch (error) {
    console.error("❌ Error fetching stored location:", error);
    return null;
  }
};

export const getCurrentLocationWithAddress = async (): Promise<{
  location: UserLocation;
  locationName: string;
} | null> => {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      timeout: 10000,
      maximumAge: 60000,
    });

    if (!location) {
      return null;
    }

    const userLocation: UserLocation = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy || undefined,
    };

    try {
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const locationName = address[0]
        ? `${address[0].street ? address[0].street + ", " : ""}${
            address[0].city || "Unknown Location"
          }`
        : "Current Location";

      return {
        location: userLocation,
        locationName,
      };
    } catch (addressError) {
      console.log("⚠️ Could not get address, using default name");
      return {
        location: userLocation,
        locationName: "Current Location",
      };
    }
  } catch (error) {
    console.error("❌ Error getting current location:", error);
    return null;
  }
};

export const updateUserLocationInDatabase = async (
  userId: string,
  setUserLocation: (location: UserLocation) => void,
  setLocationLoading: (loading: boolean) => void
): Promise<void> => {
  try {
    setLocationLoading(true);

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Location permission is needed to update your location"
      );
      return;
    }

    const result = await getCurrentLocationWithAddress();
    if (!result) {
      Alert.alert("Error", "Failed to get current location");
      return;
    }

    const { location, locationName } = result;
    setUserLocation(location);
    await saveLocationToDatabase(userId, location, locationName);
    Alert.alert("Success", "Your location has been updated!");
  } catch (error) {
    console.error("❌ Error updating location:", error);
    Alert.alert("Error", "Failed to update location. Please try again.");
  } finally {
    setLocationLoading(false);
  }
};

export const initializeUserLocation = async (
  userId: string,
  setUserLocation: (location: UserLocation) => void,
  setLocationPermission: (permission: boolean) => void,
  setLocationLoading: (loading: boolean) => void
): Promise<void> => {
  try {
    setLocationLoading(true);

    const storedLocation = await getStoredLocationFromDatabase(userId);
    if (storedLocation) {
      console.log("📍 Using stored location from database");
      setUserLocation({
        latitude: storedLocation.latitude,
        longitude: storedLocation.longitude,
        accuracy: storedLocation.accuracy,
      });
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setLocationPermission(false);
      setLocationLoading(false);
      return;
    }

    setLocationPermission(true);

    const result = await getCurrentLocationWithAddress();
    if (result) {
      const { location, locationName } = result;
      setUserLocation(location);
      await saveLocationToDatabase(userId, location, locationName);
    }
  } catch (error) {
    console.error("❌ Error initializing location:", error);
    Alert.alert(
      "Location Error",
      "Unable to get your current location. Please check your location settings."
    );
  } finally {
    setLocationLoading(false);
  }
};

// 🔒 LOCATION SHARING FUNCTIONS

export const getUserLocationSharingPreference = async (
  userId: string
): Promise<boolean> => {
  try {
    console.log("🔍 Fetching location sharing preference...");

    const { data, error } = await supabase
      .from("users")
      .select("location_sharing_enabled")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("❌ Error fetching location sharing preference:", error);
      return false;
    }

    return data.location_sharing_enabled || false;
  } catch (error) {
    console.error(
      "❌ Unexpected error fetching location sharing preference:",
      error
    );
    return false;
  }
};

export const updateLocationSharingPreference = async (
  userId: string,
  enabled: boolean
): Promise<boolean> => {
  try {
    console.log(`🔄 ${enabled ? "Enabling" : "Disabling"} location sharing...`);

    const { error } = await supabase
      .from("users")
      .update({
        location_sharing_enabled: enabled,
        last_location_update: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("❌ Error updating location sharing preference:", error);
      return false;
    }

    console.log(
      `✅ Location sharing ${enabled ? "enabled" : "disabled"} successfully`
    );
    return true;
  } catch (error) {
    console.error(
      "❌ Unexpected error updating location sharing preference:",
      error
    );
    return false;
  }
};

export const toggleLocationSharing = async (
  userId: string,
  currentState: boolean,
  setLocationSharingEnabled: (enabled: boolean) => void
): Promise<void> => {
  try {
    const newState = !currentState;

    const success = await updateLocationSharingPreference(userId, newState);

    if (success) {
      setLocationSharingEnabled(newState);
      Alert.alert(
        "Location Sharing",
        newState
          ? "Your location is now shared with friends"
          : "Your location is no longer shared with friends"
      );
    } else {
      Alert.alert("Error", "Failed to update location sharing preference");
    }
  } catch (error) {
    console.error("❌ Error toggling location sharing:", error);
    Alert.alert("Error", "Failed to update location sharing preference");
  }
};

export const fetchUserStories = async (
  userId: string
): Promise<ActivityLocation[]> => {
  try {
    console.log("📱 Fetching user stories from database...");

    const { data: stories, error } = await supabase
      .from("stories")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching stories:", error);
      throw error;
    }

    if (!stories || stories.length === 0) {
      console.log("📱 No active stories found");
      return [];
    }

    const activityLocations: ActivityLocation[] = stories
      .filter((story) => story.location_latitude && story.location_longitude)
      .map((story) => ({
        id: story.id,
        latitude: parseFloat(story.location_latitude),
        longitude: parseFloat(story.location_longitude),
        timestamp: new Date(story.created_at).getTime(),
        created_at: story.created_at, // ADDED: Include created_at for filtering
        type: story.media_type as "photo" | "video",
        name: story.location_name || "Unknown Location",
        mediaUrl: story.media_url,
        description: story.caption || "No caption",
      }));

    console.log(
      `✅ Fetched ${activityLocations.length} stories with location data`
    );
    return activityLocations;
  } catch (error) {
    console.error("❌ Unexpected error fetching stories:", error);
    return [];
  }
};

// utils.ts - FIXED fetchUserStoriesArchive function
export const fetchUserStoriesArchive = async (
  userId: string
): Promise<ActivityLocation[]> => {
  try {
    console.log("📱 Fetching user stories archive from my_stories view...");

    // ✅ FIXED: Filter by user_id in the query, not in the view
    const { data: stories, error } = await supabase
      .from("my_stories")
      .select("*")
      .eq("user_id", userId) // ✅ Filter by user_id in application
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching stories archive:", error);
      throw error;
    }

    if (!stories || stories.length === 0) {
      console.log("📱 No stories found in archive for user:", userId);
      return [];
    }

    // Transform stories to ActivityLocation format
    const activityLocations: ActivityLocation[] = stories
      .filter((story) => story.location_latitude && story.location_longitude)
      .map((story) => ({
        id: story.id,
        latitude: parseFloat(story.location_latitude),
        longitude: parseFloat(story.location_longitude),
        timestamp: new Date(story.created_at).getTime(),
        created_at: story.created_at,
        type: story.media_type as "photo" | "video",
        name: story.location_name || "Unknown Location",
        mediaUrl: story.media_url,
        description: story.caption || "No caption",
      }));

    console.log(
      `✅ Fetched ${activityLocations.length} stories from my_stories view for user ${userId}`
    );
    return activityLocations;
  } catch (error) {
    console.error("❌ Unexpected error fetching stories archive:", error);
    return [];
  }
};
// utils.ts - FIXED: Create signed URLs for ALL media items
export const fetchUserAlbumsArchive = async (
  userId: string
): Promise<ActivityLocation[]> => {
  try {
    console.log("📱 Fetching albums and grouping their media items...");

    const { data: albums, error: albumsError } = await supabase
      .from("my_albums")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (albumsError || !albums) return [];

    const albumIds = albums.map((album: any) => album.id);
    const { data: mediaItems, error: mediaError } = await supabase
      .from("album_media")
      .select("*")
      .in("album_id", albumIds)
      .order("created_at", { ascending: false });

    if (mediaError || !mediaItems) return [];

    const validAlbums = albums.filter(
      (album: any) =>
        album.final_latitude &&
        album.final_longitude &&
        mediaItems?.some((media: any) => media.album_id === album.id)
    );

    const result: ActivityLocation[] = [];

    for (const album of validAlbums) {
      const albumMedia = mediaItems.filter(
        (media: any) => media.album_id === album.id
      );
      if (albumMedia.length === 0) continue;

      // ✅ FIXED: Create signed URLs for ALL media items
      const mediaItemsWithSignedUrls = await Promise.all(
        albumMedia.map(async (media: any) => {
          let signedMediaUrl = media.media_url;

          try {
            if (media.media_url) {
              const { data: signedUrlData, error: urlError } =
                await supabase.storage
                  .from("media_bucket")
                  .createSignedUrl(media.media_url, 60 * 60); // 1 hour expiry

              if (!urlError && signedUrlData?.signedUrl) {
                signedMediaUrl = signedUrlData.signedUrl;
              }
            }
          } catch (error) {
            console.error(
              "❌ Error creating signed URL for media:",
              media.id,
              error
            );
          }

          return {
            id: media.id,
            mediaUrl: signedMediaUrl, // ✅ Use signed URL
            originalUrl: media.media_url, // Keep original for reference
            mediaType: media.media_type as "photo" | "video",
            caption: media.caption || undefined,
            sortOrder: media.sort_order || 0,
            createdAt: media.created_at,
            locationLatitude: media.location_latitude || undefined,
            locationLongitude: media.location_longitude || undefined,
            locationName: media.location_name || undefined,
          };
        })
      );

      // ✅ FIXED: Create signed URL for album cover too
      let albumCoverSignedUrl = album.media_url;
      try {
        if (album.media_url) {
          const { data: signedUrlData, error: urlError } =
            await supabase.storage
              .from("media_bucket")
              .createSignedUrl(album.media_url, 60 * 60);

          if (!urlError && signedUrlData?.signedUrl) {
            albumCoverSignedUrl = signedUrlData.signedUrl;
          }
        }
      } catch (error) {
        console.error(
          "❌ Error creating signed URL for album cover:",
          album.id,
          error
        );
      }

      const activityLocation: ActivityLocation = {
        id: album.id,
        latitude: parseFloat(album.final_latitude),
        longitude: parseFloat(album.final_longitude),
        timestamp: new Date(album.created_at).getTime(),
        created_at: album.created_at,
        type: "photo",
        name: album.final_location_name || "Album Location",
        mediaUrl:
          albumCoverSignedUrl || mediaItemsWithSignedUrls[0]?.mediaUrl || "",
        description: album.description || album.title || "Untitled Album",
        title: album.title,
        albumId: album.id,
        albumTitle: album.title,
        photoCount: albumMedia.length,
        mediaItems: mediaItemsWithSignedUrls, // ✅ All media items now have signed URLs
      };

      result.push(activityLocation);
    }

    console.log(
      `✅ Fetched ${result.length} albums with signed URLs for all media items`
    );
    return result;
  } catch (error) {
    console.error("❌ Unexpected error fetching album media items:", error);
    return [];
  }
};
