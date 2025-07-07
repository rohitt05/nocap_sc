import { Alert, Animated, PanResponder } from "react-native";
import { CameraView, CameraType, FlashMode } from "expo-camera";

export interface CapturedMedia {
  uri: string;
  type: "image";
}

export interface HumanReactionState {
  cameraType: CameraType;
  flashMode: FlashMode;
  capturedMedia: CapturedMedia | null;
  showPreview: boolean;
}

export const createPanResponder = (pan: Animated.ValueXY) => {
  return PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
      useNativeDriver: false,
    }),
    onPanResponderRelease: () => {
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false,
      }).start();
    },
  });
};

export const capturePhoto = async (
  cameraRef: React.RefObject<CameraView>,
  permission: any,
  requestPermission: () => Promise<any>
): Promise<CapturedMedia | null> => {
  try {
    if (!permission?.granted) {
      const newPermission = await requestPermission();
      if (!newPermission.granted) {
        Alert.alert(
          "Permission Required",
          "Camera permission is required to capture photos."
        );
        return null;
      }
    }

    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        exif: false,
        skipProcessing: false,
      });

      if (photo) {
        return { uri: photo.uri, type: "image" };
      }
    }
    return null;
  } catch (error) {
    console.error("Error capturing photo:", error);
    Alert.alert("Error", "Failed to capture photo. Please try again.");
    return null;
  }
};

export const toggleCameraType = (currentType: CameraType): CameraType => {
  return currentType === "back" ? "front" : "back";
};

