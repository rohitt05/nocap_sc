import React from "react";
import { BottomSheetPosition } from "./utils";

export interface BottomSheetMapProps {
  children: React.ReactNode;
  onPositionChange?: (position: Exclude<BottomSheetPosition, "hidden">) => void;
  title?: string;
  forcePosition?: BottomSheetPosition;
}

export type { BottomSheetPosition };
