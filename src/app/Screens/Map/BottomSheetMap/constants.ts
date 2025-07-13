import { Dimensions } from "react-native";

const { height: screenHeight } = Dimensions.get("window");

export const BOTTOM_SHEET_CONSTANTS = {
  CLOSED_HEIGHT: screenHeight * 0.8, // 25% visible
  HALF_HEIGHT: screenHeight * 0.5, // 50% visible
  FULL_HEIGHT: screenHeight * 0.15, // 85% visible
  HIDDEN_HEIGHT: screenHeight, // Completely hidden
  SCREEN_HEIGHT: screenHeight,
} as const;

export const ANIMATION_CONFIG = {
  tension: 100,
  friction: 8,
  useNativeDriver: true,
} as const;

export const GESTURE_THRESHOLDS = {
  FAST_VELOCITY: 1000,
} as const;
