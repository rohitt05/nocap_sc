import { Animated } from 'react-native';

interface BrightnessPoint {
  x: number;
  y: number;
}

interface BrightnessAnimationRefs {
  brightnessSliderOpacity: Animated.Value;
  cameraOverlayOpacity: Animated.Value;
}

interface BrightnessState {
  brightness: number;
  showBrightnessSlider: boolean;
  brightnessAnchor: BrightnessPoint | null;
  isAdjustingBrightness: boolean;
}

export class CameraBrightnessManager {
  private animationRefs: BrightnessAnimationRefs;
  private onStateChange: (state: Partial<BrightnessState>) => void;
  private brightnessTimeoutRef: NodeJS.Timeout | null = null;
  private initialY: number = 0;
  private currentBrightness: number = 0;
  private isActive: boolean = false;

  constructor(
    animationRefs: BrightnessAnimationRefs,
    onStateChange: (state: Partial<BrightnessState>) => void
  ) {
    this.animationRefs = animationRefs;
    this.onStateChange = onStateChange;
  }

  public startBrightnessAdjustment = (x: number, y: number, currentBrightness: number) => {
    console.log('🔆 iPhone-style brightness adjustment started at:', { x, y });
    
    this.clearBrightnessTimeout();
    this.initialY = y;
    this.currentBrightness = currentBrightness;
    this.isActive = true;

    // Set brightness state
    this.onStateChange({
      showBrightnessSlider: true,
      brightnessAnchor: { x, y },
      isAdjustingBrightness: true
    });

    // iPhone-style brightness slider animation
    this.animationRefs.brightnessSliderOpacity.setValue(0);
    Animated.spring(this.animationRefs.brightnessSliderOpacity, {
      toValue: 1,
      tension: 120,
      friction: 8,
      useNativeDriver: true,
    }).start();

    console.log('🔆 Brightness slider activated');
  };

  public updateBrightness = (currentY: number): number => {
    if (!this.isActive) {
      console.log('🔆 Brightness update ignored - not active');
      return this.currentBrightness;
    }

    // iPhone-like sensitivity calculation
    const deltaY = this.initialY - currentY; // Up = positive = brighter
    const maxDelta = 200; // Maximum swipe distance for full range
    const sensitivity = deltaY / maxDelta;
    
    // Calculate new brightness (-1 to 1 range)
    let newBrightness = Math.max(-1, Math.min(1, sensitivity));
    
    // Smooth the transition
    const smoothedBrightness = this.currentBrightness * 0.3 + newBrightness * 0.7;
    this.currentBrightness = smoothedBrightness;

    // Update state
    this.onStateChange({ brightness: smoothedBrightness });

    // Apply visual camera overlay effect
    const overlayOpacity = Math.abs(smoothedBrightness) * 0.15;
    this.animationRefs.cameraOverlayOpacity.setValue(overlayOpacity);

    console.log('🔆 Brightness updated:', Math.round(smoothedBrightness * 100) + '%');
    return smoothedBrightness;
  };

  public finishBrightnessAdjustment = () => {
    console.log('🔆 Finishing brightness adjustment');
    this.isActive = false;
    
    this.onStateChange({ isAdjustingBrightness: false });

    // iPhone-style: show final value for a moment
    this.clearBrightnessTimeout();
    this.brightnessTimeoutRef = setTimeout(() => {
      this.hideBrightnessSlider();
    }, 1500); // Show for 1.5 seconds like iPhone
  };

  public hideBrightnessSlider = () => {
    console.log('🔆 Hiding brightness slider');
    
    Animated.parallel([
      Animated.timing(this.animationRefs.brightnessSliderOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(this.animationRefs.cameraOverlayOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      this.onStateChange({
        showBrightnessSlider: false,
        brightnessAnchor: null,
        isAdjustingBrightness: false
      });
    });
  };

  public forceHide = () => {
    this.isActive = false;
    this.clearBrightnessTimeout();
    this.hideBrightnessSlider();
  };

  private clearBrightnessTimeout = () => {
    if (this.brightnessTimeoutRef) {
      clearTimeout(this.brightnessTimeoutRef);
      this.brightnessTimeoutRef = null;
    }
  };

  public cleanup = () => {
    this.clearBrightnessTimeout();
    this.isActive = false;
  };
}
