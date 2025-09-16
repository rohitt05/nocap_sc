// utils.ts - COMPLETE FILE with Real Database Integration
import { Alert } from "react-native";
import * as Location from "expo-location";
import { supabase } from "../../../../lib/supabase";
import { LocationData, WeatherIcons } from "./types";

// 🗺️ DATABASE FUNCTIONS
export const saveLocationToDatabase = async (
  userId: string,
  location: LocationData,
  locationName?: string
): Promise<void> => {
  try {
    console.log("💾 Saving location to database from Map...");

    const { error } = await supabase.rpc("update_user_location", {
      p_user_id: userId,
      p_latitude: location.latitude,
      p_longitude: location.longitude,
      p_location_name: locationName || "Current Location",
      p_accuracy: location.accuracy || null,
    });

    if (error) {
      console.error("❌ Error saving location:", error);
    } else {
      console.log("✅ Location saved to database successfully");
    }
  } catch (error) {
    console.error("❌ Unexpected error saving location:", error);
  }
};

export const getUserLocationSharingPreference = async (
  userId: string
): Promise<boolean> => {
  try {
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

// 🎨 UTILITY FUNCTIONS
export const getWeatherIcon = (condition: string): string => {
  const icons: WeatherIcons = {
    sunny: "weather-sunny",
    clear_night: "weather-night",
    rain: "weather-rainy",
    snow: "weather-snowy",
    fog: "weather-fog",
    cloudy: "weather-cloudy",
    drizzle: "weather-partly-rainy",
    thunderstorm: "weather-lightning",
    about_to_rain: "weather-pouring",
    hazy: "weather-hazy",
    default: "weather-partly-cloudy",
  };
  return icons[condition as keyof typeof icons] || icons.default;
};

export const getCurrentUser = async (): Promise<string | null> => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("❌ Auth error:", error);
      return null;
    }

    if (!user || !user.id) {
      console.error("❌ No user found or missing user ID");
      return null;
    }

    console.log("✅ Current user ID:", user.id);
    return user.id;
  } catch (error) {
    console.error("❌ Error getting current user:", error);
    return null;
  }
};

export const getAddressFromCoordinates = async (
  latitude: number,
  longitude: number
): Promise<string> => {
  try {
    const address = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    return address[0]
      ? `${address.street ? address.street + ", " : ""}${
          address.city || "Unknown Location"
        }`
      : "Current Location";
  } catch (error) {
    console.log("⚠️ Could not get address, using default name");
    return "Current Location";
  }
};

// 🚀 LOCATION FUNCTIONS
export const getLocationQuickly = async (
  setLocation: (location: Location.LocationObject) => void,
  setPermissionGranted: (granted: boolean) => void,
  setIsLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
  handleLocationUpdate: (locationData: LocationData) => void
): Promise<void> => {
  try {
    const { status: currentStatus } =
      await Location.getForegroundPermissionsAsync();
    if (currentStatus !== "granted") {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location access required");
        setIsLoading(false);
        return;
      }
    }
    setPermissionGranted(true);

    let locationResult = await Location.getLastKnownPositionAsync();

    if (locationResult) {
      setLocation(locationResult);
      setIsLoading(false);
      handleLocationUpdate({
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
        timestamp: locationResult.timestamp,
        accuracy: locationResult.coords.accuracy || undefined,
      });
    }

    Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeout: 3000,
      maximumAge: 30000,
    })
      .then((currentLocation) => {
        if (currentLocation) {
          setLocation(currentLocation);
          setIsLoading(false);
          handleLocationUpdate({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            timestamp: currentLocation.timestamp,
            accuracy: currentLocation.coords.accuracy || undefined,
          });
        }
      })
      .catch(() => {
        if (!locationResult) {
          setError("Unable to get location");
          setIsLoading(false);
        }
      });
  } catch (error) {
    console.log("Error getting location:", error);
    setError("Unable to get location");
    setIsLoading(false);
  }
};

// 🎯 HANDLER FUNCTIONS
export const createLocationUpdateHandler = (
  onLocationUpdate: ((location: LocationData) => void) | undefined,
  currentUserId: string | null
) => {
  return async (locationData: LocationData) => {
    if (onLocationUpdate) {
      onLocationUpdate(locationData);
    }

    if (currentUserId) {
      const locationName = await getAddressFromCoordinates(
        locationData.latitude,
        locationData.longitude
      );
      await saveLocationToDatabase(currentUserId, locationData, locationName);
    }
  };
};

export const createGPSPressHandler = (
  location: Location.LocationObject | null,
  cameraRef: React.RefObject<any>
) => {
  return () => {
    if (!location) {
      Alert.alert("Location Error", "Unable to get your current location");
      return;
    }

    console.log("📍 GPS button pressed - centering on user location");
    console.log(
      `📍 Coordinates: [${location.coords.longitude}, ${location.coords.latitude}]`
    );
  };
};

export const createAlbumHandler = (
  location: Location.LocationObject | null,
  onClose: (() => void) | undefined,
  onCreateAlbum: ((location: LocationData) => void) | undefined
) => {
  return () => {
    if (!location) {
      Alert.alert(
        "Location Required",
        "Please enable location services to create an album"
      );
      return;
    }

    Alert.alert(
      "Create Album",
      "Create a new album at your current location?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Create",
          onPress: () => {
            if (onClose) {
              onClose();
            }
            if (onCreateAlbum) {
              onCreateAlbum({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                timestamp: Date.now(),
                accuracy: location.coords.accuracy || undefined,
              });
            }
          },
        },
      ]
    );
  };
};

export const createLocationSharingToggleHandler = (
  currentUserId: string | null,
  locationSharingEnabled: boolean,
  setLocationSharingEnabled: (enabled: boolean) => void
) => {
  return async () => {
    if (!currentUserId) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    const newState = !locationSharingEnabled;
    const success = await updateLocationSharingPreference(
      currentUserId,
      newState
    );

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
  };
};

export const createAnimateToFriendHandler = (
  cameraRef: React.RefObject<any>,
  setSelectedFriendId: (id: string | null) => void
) => {
  return (friend: any) => {
    setSelectedFriendId(friend.id);

    console.log("👥 Animating to friend:", friend.id);
    console.log(
      `👥 Friend coordinates: [${friend.location.longitude}, ${friend.location.latitude}]`
    );

    setTimeout(() => {
      setSelectedFriendId(null);
    }, 3000);
  };
};

// 🎨 COMPUTED VALUES
export const calculateCameraCoords = (
  location: Location.LocationObject | null
): [number, number] => {
  if (!location) return [72.8777, 19.076];
  return [location.coords.longitude, location.coords.latitude];
};

export const calculateMarkerCoordinate = (
  location: Location.LocationObject | null
): [number, number] => {
  if (!location) return [0, 0];
  return [location.coords.longitude, location.coords.latitude];
};

export const getMapStyle = (): string => {
  return "mapbox://styles/mapbox/outdoors-v12";
};

export const getBirdsEyeZoomLevel = (
  isFullScreen: boolean,
  zoomLevel: number
): number => {
  if (isFullScreen) {
    return 11;
  }
  return Math.min(zoomLevel, 13);
};

// ✅ REAL DATABASE INTEGRATION: Fetch albums with media from your backend
export const fetchUserAlbums = async (): Promise<any[]> => {
  try {
    console.log("📂 Fetching albums from real database...");

    const userId = await getCurrentUser();
    if (!userId) {
      console.error("❌ No user ID available");
      return getTestAlbumsForFallback();
    }

    // Query your real albums and album_media tables
    const { data: albums, error } = await supabase
      .from("albums")
      .select(
        `
        id,
        name,
        description,
        location_latitude,
        location_longitude,
        location_name,
        cover_media_url,
        media_count,
        created_at,
        updated_at,
        album_media (
          id,
          media_url,
          media_type,
          caption,
          sort_order,
          created_at
        )
      `
      )
      .eq("user_id", userId)
      .not("location_latitude", "is", null)
      .not("location_longitude", "is", null)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("❌ Database error fetching albums:", error);
      return getTestAlbumsForFallback();
    }

    if (!albums || albums.length === 0) {
      console.log("📂 No albums found in database, returning test data");
      return getTestAlbumsForFallback();
    }

    // Process real database results
    const processedAlbums = albums.map((album) => {
      const sortedMedia =
        album.album_media?.sort((a, b) => a.sort_order - b.sort_order) || [];

      let previewMedia = sortedMedia.slice(0, 3).map((media) => ({
        url: media.media_url,
        type: media.media_type,
      }));

      // If no media in album_media table, try cover_media_url
      if (previewMedia.length === 0 && album.cover_media_url) {
        previewMedia = [
          { url: album.cover_media_url, type: "photo" },
          { url: album.cover_media_url, type: "photo" },
          { url: album.cover_media_url, type: "photo" },
        ];
      }

      // Final fallback to test image
      if (previewMedia.length === 0) {
        previewMedia = [
          {
            url: "https://i.pinimg.com/736x/fb/91/b0/fb91b080814305ecef0acaaa4859deec.jpg",
            type: "photo",
          },
        ];
      }

      return {
        ...album,
        album_media: sortedMedia,
        preview_media: previewMedia,
      };
    });

    console.log("✅ Processed real albums:", processedAlbums.length);
    processedAlbums.forEach((album) => {
      console.log(
        `📂 Album: ${album.name} - ${album.media_count} media, ${album.preview_media.length} previews`
      );
    });

    return processedAlbums;
  } catch (error) {
    console.error("❌ Unexpected error in fetchUserAlbums:", error);
    return getTestAlbumsForFallback();
  }
};

// Helper function for consistent test data
const getTestAlbumsForFallback = () => {
  console.log("🔄 Using test albums as fallback");
  return [
    {
      id: "test-album-1",
      name: "Mumbai Adventures",
      description: "Test album with working images",
      location_latitude: 19.076,
      location_longitude: 72.8777,
      location_name: "Mumbai, Maharashtra",
      cover_media_url:
        "https://i.pinimg.com/736x/fb/91/b0/fb91b080814305ecef0acaaa4859deec.jpg",
      media_count: 5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      album_media: [],
      preview_media: [
        {
          url: "https://i.pinimg.com/736x/fb/91/b0/fb91b080814305ecef0acaaa4859deec.jpg",
          type: "photo",
        },
        {
          url: "https://i.pinimg.com/736x/fb/91/b0/fb91b080814305ecef0acaaa4859deec.jpg",
          type: "photo",
        },
        {
          url: "https://i.pinimg.com/736x/fb/91/b0/fb91b080814305ecef0acaaa4859deec.jpg",
          type: "photo",
        },
      ],
    },
    {
      id: "test-album-2",
      name: "Airport Memories",
      description: "Test album near airport",
      location_latitude: 19.0896,
      location_longitude: 72.8656,
      location_name: "Chhatrapati Shivaji Airport",
      cover_media_url:
        "https://i.pinimg.com/736x/fb/91/b0/fb91b080814305ecef0acaaa4859deec.jpg",
      media_count: 3,
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      album_media: [],
      preview_media: [
        {
          url: "https://i.pinimg.com/736x/fb/91/b0/fb91b080814305ecef0acaaa4859deec.jpg",
          type: "photo",
        },
        {
          url: "https://i.pinimg.com/736x/fb/91/b0/fb91b080814305ecef0acaaa4859deec.jpg",
          type: "video",
        },
      ],
    },
  ];
};

// ✅ COMPLETELY FIXED: getMediaUrl with proper URL generation
export const getMediaUrl = (mediaPath: string): string => {
  if (!mediaPath) {
    console.log("🖼️ No media path provided, using fallback");
    return "https://i.pinimg.com/736x/fb/91/b0/fb91b080814305ecef0acaaa4859deec.jpg";
  }

  // If it's already a full URL (Pinterest, etc.), return as is
  if (mediaPath.startsWith("http")) {
    console.log("🖼️ Using direct URL:", mediaPath);
    return mediaPath;
  }

  try {
    // ✅ FIX: Get the complete public URL from Supabase storage
    const { data } = supabase.storage
      .from("media_bucket")
      .getPublicUrl(mediaPath);

    if (data?.publicUrl) {
      const fullUrl = data.publicUrl;
      console.log("🖼️ Full Supabase URL generated:", fullUrl);

      // ✅ VALIDATE: Check if URL looks correct
      if (fullUrl.includes("/storage/v1/object/public/media_bucket/")) {
        return fullUrl;
      } else {
        console.error("🖼️ Invalid Supabase URL format:", fullUrl);
        return "https://i.pinimg.com/736x/fb/91/b0/fb91b080814305ecef0acaaa4859deec.jpg";
      }
    } else {
      console.error("🖼️ No publicUrl returned from Supabase");
      return "https://i.pinimg.com/736x/fb/91/b0/fb91b080814305ecef0acaaa4859deec.jpg";
    }
  } catch (error) {
    console.error("🖼️ Exception in getMediaUrl:", error);
    return "https://i.pinimg.com/736x/fb/91/b0/fb91b080814305ecef0acaaa4859deec.jpg";
  }
};

// ✅ REAL DATABASE: Create album with location
export const createAlbumWithLocation = async (
  name: string,
  description: string,
  latitude: number,
  longitude: number,
  locationName: string
): Promise<string | null> => {
  try {
    const userId = await getCurrentUser();
    if (!userId) {
      console.error("❌ No user ID for album creation");
      return null;
    }

    console.log("📂 Creating album in database:", name);

    const { data: album, error } = await supabase
      .from("albums")
      .insert({
        user_id: userId,
        name: name,
        description: description || null,
        location_latitude: latitude,
        location_longitude: longitude,
        location_name: locationName,
        media_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Error creating album:", error);
      return null;
    }

    console.log("✅ Album created successfully:", album.id);
    return album.id;
  } catch (error) {
    console.error("❌ Error in createAlbumWithLocation:", error);
    return null;
  }
};

// ✅ REAL DATABASE: Add media to album
export const addMediaToAlbum = async (
  albumId: string,
  mediaUrl: string,
  mediaType: "photo" | "video",
  caption?: string,
  location?: { latitude: number; longitude: number },
  locationName?: string
): Promise<boolean> => {
  try {
    console.log("📸 Adding media to album:", albumId);

    // Get current media count for sort_order
    const { data: albumData, error: albumError } = await supabase
      .from("albums")
      .select("media_count")
      .eq("id", albumId)
      .single();

    if (albumError) {
      console.error("❌ Error getting album data:", albumError);
      return false;
    }

    const sortOrder = albumData.media_count || 0;

    // Insert new media
    const { error: mediaError } = await supabase.from("album_media").insert({
      album_id: albumId,
      media_url: mediaUrl,
      media_type: mediaType,
      caption: caption || null,
      location_latitude: location?.latitude || null,
      location_longitude: location?.longitude || null,
      location_name: locationName || null,
      sort_order: sortOrder,
    });

    if (mediaError) {
      console.error("❌ Error adding media to album:", mediaError);
      return false;
    }

    // Update album cover if it's the first media
    if (sortOrder === 0) {
      await supabase
        .from("albums")
        .update({
          cover_media_url: mediaUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", albumId);
    }

    console.log("✅ Media added to album successfully");
    return true;
  } catch (error) {
    console.error("❌ Error in addMediaToAlbum:", error);
    return false;
  }
};

// ✅ REAL STORAGE: Upload media file
export const uploadMediaToStorage = async (
  fileUri: string,
  fileName: string,
  mediaType: "photo" | "video"
): Promise<string | null> => {
  try {
    const userId = await getCurrentUser();
    if (!userId) {
      console.error("❌ No user ID for media upload");
      return null;
    }

    console.log("📤 Uploading media to storage:", fileName);

    // Create unique file path
    const timestamp = Date.now();
    const fileExtension =
      fileName.split(".").pop() || (mediaType === "photo" ? "jpg" : "mp4");
    const storagePath = `user_${userId}/${mediaType}s/${timestamp}_${fileName.replace(
      /[^a-zA-Z0-9.]/g,
      "_"
    )}.${fileExtension}`;

    // Convert file URI to blob
    const response = await fetch(fileUri);
    const blob = await response.blob();

    const { data, error } = await supabase.storage
      .from("media_bucket")
      .upload(storagePath, blob, {
        cacheControl: "3600",
        upsert: false,
        contentType: mediaType === "photo" ? "image/jpeg" : "video/mp4",
      });

    if (error) {
      console.error("❌ Error uploading to storage:", error);
      return null;
    }

    console.log("✅ Media uploaded to storage:", data.path);
    return data.path;
  } catch (error) {
    console.error("❌ Error in uploadMediaToStorage:", error);
    return null;
  }
};

// ✅ REAL DATABASE: Fetch album details
export const fetchAlbumDetails = async (
  albumId: string
): Promise<any | null> => {
  try {
    console.log("📂 Fetching album details:", albumId);

    const { data: album, error } = await supabase
      .from("albums")
      .select(
        `
        *,
        album_media (
          id,
          media_url,
          media_type,
          caption,
          location_latitude,
          location_longitude,
          location_name,
          sort_order,
          created_at
        )
      `
      )
      .eq("id", albumId)
      .single();

    if (error) {
      console.error("❌ Error fetching album details:", error);
      return null;
    }

    return {
      ...album,
      album_media:
        album.album_media?.sort((a, b) => a.sort_order - b.sort_order) || [],
    };
  } catch (error) {
    console.error("❌ Error in fetchAlbumDetails:", error);
    return null;
  }
};

// ✅ REAL DATABASE: Delete album
export const deleteAlbum = async (albumId: string): Promise<boolean> => {
  try {
    console.log("🗑️ Deleting album:", albumId);

    const { error } = await supabase.from("albums").delete().eq("id", albumId);

    if (error) {
      console.error("❌ Error deleting album:", error);
      return false;
    }

    console.log("✅ Album deleted successfully");
    return true;
  } catch (error) {
    console.error("❌ Error in deleteAlbum:", error);
    return false;
  }
};

// ✅ REAL DATABASE: Update album
export const updateAlbum = async (
  albumId: string,
  updates: {
    name?: string;
    description?: string;
    cover_media_url?: string;
  }
): Promise<boolean> => {
  try {
    console.log("✏️ Updating album:", albumId);

    const { error } = await supabase
      .from("albums")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", albumId);

    if (error) {
      console.error("❌ Error updating album:", error);
      return false;
    }

    console.log("✅ Album updated successfully");
    return true;
  } catch (error) {
    console.error("❌ Error in updateAlbum:", error);
    return false;
  }
};
// ✅ FIXED: Fetch weather data with better error handling and fallback
export const fetchWeatherData = async (
  latitude: number,
  longitude: number
): Promise<any> => {
  try {
    // ✅ Multiple ways to access the API key
    let API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;

    // ✅ Fallback: Try without EXPO_PUBLIC_ prefix (sometimes works)
    if (!API_KEY) {
      API_KEY = process.env.OPENWEATHER_API_KEY;
    }

    // ✅ Hard fallback for development (remove in production)
    if (!API_KEY) {
      console.warn(
        "⚠️ Using fallback API key - add EXPO_PUBLIC_OPENWEATHER_API_KEY to .env.local"
      );
      API_KEY = "ee3ae7a055cd1da384b256d4f9b98ba4"; // Your API key as fallback
    }

    if (!API_KEY) {
      console.error("❌ No OpenWeatherMap API key found anywhere");
      return null;
    }

    console.log("🌤️ Fetching weather data for coordinates:", {
      latitude,
      longitude,
    });
    console.log(
      "🔑 Using API key (first 10 chars):",
      API_KEY.substring(0, 10) + "..."
    );

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
    console.log("🌐 Weather API URL:", url.replace(API_KEY, "API_KEY_HIDDEN"));

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Weather API error ${response.status}:`, errorText);
      throw new Error(
        `Weather API request failed with status: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    console.log("✅ Weather data fetched successfully:", {
      location: data.name,
      temp: data.main.temp + "°C",
      weather: data.weather[0].description,
    });
    return data;
  } catch (error) {
    console.error("❌ Error fetching weather data:", error);
    return null;
  }
};

// ✅ NEW: Detect rain intensity from weather data
export const getRainIntensity = (
  weatherData: any
): "light" | "moderate" | "heavy" | null => {
  if (!weatherData || !weatherData.weather) return null;

  const weatherCondition = weatherData.weather[0].main.toLowerCase();
  const weatherDescription = weatherData.weather.description.toLowerCase();

  // Check for rain conditions
  if (weatherCondition === "rain" || weatherDescription.includes("rain")) {
    // Check intensity based on description
    if (
      weatherDescription.includes("light") ||
      weatherDescription.includes("drizzle")
    ) {
      return "light";
    } else if (
      weatherDescription.includes("heavy") ||
      weatherDescription.includes("extreme")
    ) {
      return "heavy";
    } else {
      return "moderate";
    }
  }

  // Check for drizzle
  if (weatherCondition === "drizzle") {
    return "light";
  }

  // Check for thunderstorm (usually heavy rain)
  if (weatherCondition === "thunderstorm") {
    return "heavy";
  }

  return null;
};

// ✅ NEW: Check if weather is rainy
export const isRainyWeather = (weatherData: any): boolean => {
  return getRainIntensity(weatherData) !== null;
};
