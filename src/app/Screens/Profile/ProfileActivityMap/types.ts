// types.ts - UPDATED WITH REFRESH TRIGGER
export interface ActivityLocation {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  created_at?: string;
  type: "photo" | "video";
  name: string;
  mediaUrl: string;
  description: string;
  title?: string;
  albumId?: string;
  albumTitle?: string;
  sortOrder?: number;
  photoCount?: number;
  mediaItems?: MediaItem[];
}

export interface MediaItem {
  id: string;
  mediaUrl: string;
  originalUrl?: string;
  mediaType: "photo" | "video";
  caption?: string;
  sortOrder: number;
  createdAt: string;
  locationLatitude?: number;
  locationLongitude?: number;
  locationName?: string;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

// ✅ UPDATED: Add refreshTrigger prop to existing interface
export interface ProfileActivityMapProps {
  userId: string;
  isOwnProfile?: boolean;
  isVisible?: boolean;
  refreshTrigger?: number; // NEW: Added for pull-to-refresh support
  onMapInteractionStart?: () => void;
  onMapInteractionEnd?: () => void;
}

export type TimeframeType = "today" | "week" | "month" | "year";
export type MapStyleType = "streets" | "satellite" | "outdoors";
