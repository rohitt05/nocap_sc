import { BOTTOM_SHEET_CONSTANTS, GESTURE_THRESHOLDS } from "./constants";

export type BottomSheetPosition = "closed" | "half" | "full" | "hidden";

export const getTargetPosition = (
  currentY: number,
  velocityY: number,
  translationY: number,
  lastGestureY: number
): { targetY: number; position: BottomSheetPosition } => {
  const { CLOSED_HEIGHT, HALF_HEIGHT, FULL_HEIGHT } = BOTTOM_SHEET_CONSTANTS;
  const { FAST_VELOCITY } = GESTURE_THRESHOLDS;

  const actualCurrentY = lastGestureY + translationY;

  let targetY = CLOSED_HEIGHT;
  let position: BottomSheetPosition = "closed";

  // Determine target based on velocity and position
  if (velocityY > FAST_VELOCITY) {
    // Fast downward swipe
    targetY = CLOSED_HEIGHT;
    position = "closed";
  } else if (velocityY < -FAST_VELOCITY) {
    // Fast upward swipe
    if (actualCurrentY < HALF_HEIGHT) {
      targetY = FULL_HEIGHT;
      position = "full";
    } else {
      targetY = HALF_HEIGHT;
      position = "half";
    }
  } else {
    // Snap to nearest position based on current position
    const distanceToFull = Math.abs(actualCurrentY - FULL_HEIGHT);
    const distanceToHalf = Math.abs(actualCurrentY - HALF_HEIGHT);
    const distanceToClosed = Math.abs(actualCurrentY - CLOSED_HEIGHT);

    if (distanceToFull < distanceToHalf && distanceToFull < distanceToClosed) {
      targetY = FULL_HEIGHT;
      position = "full";
    } else if (distanceToHalf < distanceToClosed) {
      targetY = HALF_HEIGHT;
      position = "half";
    } else {
      targetY = CLOSED_HEIGHT;
      position = "closed";
    }
  }

  return { targetY, position };
};

export const getTargetYFromPosition = (
  position: BottomSheetPosition
): number => {
  const { CLOSED_HEIGHT, HALF_HEIGHT, FULL_HEIGHT, HIDDEN_HEIGHT } =
    BOTTOM_SHEET_CONSTANTS;

  switch (position) {
    case "hidden":
      return HIDDEN_HEIGHT;
    case "closed":
      return CLOSED_HEIGHT;
    case "half":
      return HALF_HEIGHT;
    case "full":
      return FULL_HEIGHT;
    default:
      return CLOSED_HEIGHT;
  }
};

export const constrainY = (y: number): number => {
  const { CLOSED_HEIGHT, FULL_HEIGHT } = BOTTOM_SHEET_CONSTANTS;
  return Math.max(FULL_HEIGHT, Math.min(CLOSED_HEIGHT, y));
};
