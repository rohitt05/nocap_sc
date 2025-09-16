import { Animated } from "react-native";

interface FocusPoint {
  x: number;
  y: number;
}

interface FocusAnimationRefs {
  focusAnimatedValue: Animated.Value;
  focusOpacity: Animated.Value;
  cameraOverlayOpacity: Animated.Value;
}

interface FocusState {
  focusPoint: FocusPoint | null;
  showFocusAnimation: boolean;
  isFocusing: boolean;
}

export class CameraFocusManager {
  private animationRefs: FocusAnimationRefs;
  private focusTimeoutRef: NodeJS.Timeout | null = null;
  private onStateChange: (state: Partial<FocusState>) => void;

  constructor(
    animationRefs: FocusAnimationRefs,
    onStateChange: (state: Partial<FocusState>) => void
  ) {
    this.animationRefs = animationRefs;
    this.onStateChange = onStateChange;
  }

  public handleFocus = async (
    x: number,
    y: number,
    screenWidth: number,
    screenHeight: number
  ) => {
    console.log("🎯 Starting focus at:", { x, y });

    // Clear any existing focus timeout
    this.clearFocusTimeout();

    // Set focus state immediately
    this.onStateChange({
      focusPoint: { x, y },
      showFocusAnimation: true,
      isFocusing: true,
    });

    // Reset animation values
    this.animationRefs.focusOpacity.setValue(1);
    this.animationRefs.focusAnimatedValue.setValue(1.8);
    this.animationRefs.cameraOverlayOpacity.setValue(0);

    // Start focus animation sequence
    this.startFocusAnimation();

    // Simulate camera focus effect
    this.simulateFocusEffect();

    // Convert coordinates for potential camera API use
    const normalizedCoords = {
      x: x / screenWidth,
      y: y / screenHeight,
    };

    console.log("🎯 Normalized focus coords:", normalizedCoords);

    // Set timeout to clear focus after animation
    this.focusTimeoutRef = setTimeout(() => {
      this.clearFocus();
    }, 2500); // Extended duration for better UX

    return normalizedCoords;
  };

  private startFocusAnimation = () => {
    // Enhanced focus animation sequence
    Animated.sequence([
      // Initial focus indicator animation
      Animated.parallel([
        Animated.spring(this.animationRefs.focusAnimatedValue, {
          toValue: 1,
          tension: 120,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(this.animationRefs.cameraOverlayOpacity, {
          toValue: 0.2,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
      // Focus confirmation phase
      Animated.timing(this.animationRefs.cameraOverlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      // Fade out focus indicator
      Animated.timing(this.animationRefs.focusOpacity, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  };

  private simulateFocusEffect = () => {
    // Simulate camera focus with a subtle flash effect
    Animated.sequence([
      Animated.timing(this.animationRefs.cameraOverlayOpacity, {
        toValue: 0.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(this.animationRefs.cameraOverlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  public clearFocus = () => {
    console.log("🎯 Clearing focus");
    this.clearFocusTimeout();

    this.onStateChange({
      showFocusAnimation: false,
      focusPoint: null,
      isFocusing: false,
    });
  };

  private clearFocusTimeout = () => {
    if (this.focusTimeoutRef) {
      clearTimeout(this.focusTimeoutRef);
      this.focusTimeoutRef = null;
    }
  };

  public cleanup = () => {
    this.clearFocusTimeout();
  };
}
