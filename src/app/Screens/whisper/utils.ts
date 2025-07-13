import { Animated, Dimensions } from "react-native";
import { State } from "react-native-gesture-handler";

const { width: screenWidth } = Dimensions.get("window");

export const createGestureHandlers = (
  translateX: Animated.Value,
  onClose: () => void
) => {
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX: translation, velocityX } = event.nativeEvent;

      // Close if swiped left significantly
      const shouldClose = translation < -50 || velocityX < -500;

      if (shouldClose) {
        Animated.timing(translateX, {
          toValue: -screenWidth,
          duration: 250,
          useNativeDriver: true,
        }).start(() => {
          onClose();
        });
      } else {
        // Bounce back
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  return {
    onGestureEvent,
    onHandlerStateChange,
  };
};
