import { CameraFocusManager } from './CameraFocus';
import { CameraBrightnessManager } from './CameraBrightness';

interface TouchHandlerConfig {
  longPressDelay: number;
  screenWidth: number;
  screenHeight: number;
}

export class CameraTouchHandler {
  private focusManager: CameraFocusManager;
  private brightnessManager: CameraBrightnessManager;
  private config: TouchHandlerConfig;
  
  private touchStartTime: number = 0;
  private longPressTimeoutRef: NodeJS.Timeout | null = null;
  private isLongPress: boolean = false;
  private touchStartPos: { x: number; y: number } = { x: 0, y: 0 };

  constructor(
    focusManager: CameraFocusManager,
    brightnessManager: CameraBrightnessManager,
    config: TouchHandlerConfig
  ) {
    this.focusManager = focusManager;
    this.brightnessManager = brightnessManager;
    this.config = config;
  }

  public handleTouchStart = (event: any, currentBrightness: number, isZooming: boolean, isCameraReady: boolean) => {
    if (!isCameraReady || isZooming) return;

    const { locationX, locationY } = event.nativeEvent;
    this.touchStartTime = Date.now();
    this.touchStartPos = { x: locationX, y: locationY };
    this.isLongPress = false;
    
    console.log('👆 Touch start at:', { x: locationX, y: locationY });

    // Clear any existing timeout
    this.clearLongPressTimeout();

    // Set up long press detection for brightness
    this.longPressTimeoutRef = setTimeout(() => {
      if (!isZooming && isCameraReady) {
        console.log('⏰ Long press detected - starting brightness');
        this.isLongPress = true;
        this.brightnessManager.startBrightnessAdjustment(
          locationX, 
          locationY, 
          currentBrightness
        );
      }
    }, this.config.longPressDelay);
  };

  public handleTouchMove = (event: any, isZooming: boolean, isAdjustingBrightness: boolean) => {
    if (!this.isLongPress || isZooming || !isAdjustingBrightness) return;

    const { locationY } = event.nativeEvent;
    console.log('👆 Touch move - updating brightness at Y:', locationY);
    this.brightnessManager.updateBrightness(locationY);
  };

  public handleTouchEnd = (event: any, isZooming: boolean, isAdjustingBrightness: boolean) => {
    const { locationX, locationY } = event.nativeEvent;
    const touchDuration = Date.now() - this.touchStartTime;
    
    console.log('👆 Touch end - Duration:', touchDuration, 'isLongPress:', this.isLongPress);

    // Clear long press timeout
    this.clearLongPressTimeout();

    // Handle brightness adjustment end
    if (this.isLongPress && isAdjustingBrightness) {
      console.log('🔆 Finishing brightness adjustment');
      this.brightnessManager.finishBrightnessAdjustment();
      this.isLongPress = false;
      return;
    }

    // Handle focus (short tap)
    if (touchDuration < this.config.longPressDelay && !isZooming && !this.isLongPress) {
      console.log('🎯 Short tap - triggering focus');
      this.focusManager.handleFocus(
        locationX, 
        locationY, 
        this.config.screenWidth, 
        this.config.screenHeight
      );
    }

    this.isLongPress = false;
  };

  public updateConfig = (newConfig: Partial<TouchHandlerConfig>) => {
    this.config = { ...this.config, ...newConfig };
  };

  private clearLongPressTimeout = () => {
    if (this.longPressTimeoutRef) {
      clearTimeout(this.longPressTimeoutRef);
      this.longPressTimeoutRef = null;
    }
  };

  public cleanup = () => {
    this.clearLongPressTimeout();
    this.focusManager.cleanup();
    this.brightnessManager.cleanup();
  };
}
