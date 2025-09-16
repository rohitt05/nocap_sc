// types.ts
export interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
}

export interface Friend {
  id: string;
  name: string;
  username: string;
  location: {
    latitude: number;
    longitude: number;
    name: string;
  };
  profile_pic: string;
  story: {
    type: "photo" | "video";
    url: string;
    timestamp: number;
  };
}

export interface MapProps {
  onLocationUpdate?: (location: LocationData) => void;
  style?: any;
  zoomLevel?: number;
  isFullScreen?: boolean;
  onClose?: () => void;
  onCreateAlbum?: (location: LocationData) => void;
}

export interface WeatherIcons {
  sunny: string;
  clear_night: string;
  rain: string;
  snow: string;
  fog: string;
  cloudy: string;
  drizzle: string;
  thunderstorm: string;
  about_to_rain: string;
  hazy: string;
  default: string;
}
