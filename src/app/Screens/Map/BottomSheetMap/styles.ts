import { StyleSheet } from "react-native";
import { BOTTOM_SHEET_CONSTANTS } from "./constants";

export const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    zIndex: 1000,
    pointerEvents: "box-none", // Allow touches to pass through the transparent overlay
  },
  bottomSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: BOTTOM_SHEET_CONSTANTS.SCREEN_HEIGHT,
    backgroundColor: "#000",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    pointerEvents: "auto", // Capture touches on the bottom sheet itself
  },
  header: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    pointerEvents: "auto", // Ensure header captures touches
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#555",
    borderRadius: 2,
    marginBottom: 10,
  },
  content: {
    flex: 1,
    padding: 20,
    pointerEvents: "auto", // Ensure content captures touches
  },
});
