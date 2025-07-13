import { useRef, useEffect } from "react";
import { Animated } from "react-native";
import {
  PanGestureHandlerGestureEvent,
  State,
} from "react-native-gesture-handler";
import { BOTTOM_SHEET_CONSTANTS, ANIMATION_CONFIG } from "./constants";
import {
  getTargetPosition,
  getTargetYFromPosition,
  constrainY,
  BottomSheetPosition,
} from "./utils";

export const useBottomSheetAnimation = (
  onPositionChange?: (position: BottomSheetPosition) => void,
  forcePosition?: BottomSheetPosition
) => {
  const translateY = useRef(
    new Animated.Value(BOTTOM_SHEET_CONSTANTS.CLOSED_HEIGHT)
  ).current;
  const lastGestureY = useRef(0);

  // Initialize position
  useEffect(() => {
    Animated.spring(translateY, {
      toValue: BOTTOM_SHEET_CONSTANTS.CLOSED_HEIGHT,
      ...ANIMATION_CONFIG,
    }).start();

    onPositionChange?.("closed");
  }, []);

  // Handle force position changes
  useEffect(() => {
    if (forcePosition) {
      const targetY = getTargetYFromPosition(forcePosition);
      lastGestureY.current = targetY;

      Animated.spring(translateY, {
        toValue: targetY,
        ...ANIMATION_CONFIG,
      }).start();

      // Only notify position change if not hidden
      if (forcePosition !== "hidden") {
        onPositionChange?.(forcePosition);
      }
    }
  }, [forcePosition]);

  const onGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    const { translationY } = event.nativeEvent;
    const newY = lastGestureY.current + translationY;
    const constrainedY = constrainY(newY);
    translateY.setValue(constrainedY);
  };

  const onHandlerStateChange = (event: PanGestureHandlerGestureEvent) => {
    if (event.nativeEvent.state === State.BEGAN) {
      lastGestureY.current = (translateY as any)._value;
    }

    if (event.nativeEvent.state === State.END) {
      const { velocityY, translationY } = event.nativeEvent;
      const currentY = lastGestureY.current + translationY;

      const { targetY, position } = getTargetPosition(
        currentY,
        velocityY,
        translationY,
        lastGestureY.current
      );

      onPositionChange?.(position);
      lastGestureY.current = targetY;

      Animated.spring(translateY, {
        toValue: targetY,
        ...ANIMATION_CONFIG,
      }).start();
    }
  };

  return {
    translateY,
    onGestureEvent,
    onHandlerStateChange,
  };
};
