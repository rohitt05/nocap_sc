// styles.ts
import { StyleSheet, Dimensions } from "react-native";

export const { height: screenHeight } = Dimensions.get("window");

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.98)",
    justifyContent: "flex-end",
  },
  topSection: {
    height: screenHeight * 0.5,
    width: "100%",
  },
  bottomSheet: {
    backgroundColor: "#000",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    alignItems: "center",
    paddingTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 15,
    overflow: "visible",
  },
  dragIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginBottom: 16,
  },

  // UNIFIED HEADER STYLE
  header: {
    width: "100%",
    height: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
    flexDirection: "row",
    zIndex: 10,
  },
  headerText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },

  locationInfoContainer: {
    width: "98%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
    zIndex: 10,
  },
  previewLocationInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
    marginRight: 10,
  },
  previewLocationText: {
    color: "white",
    fontSize: 12,
    marginLeft: 6,
    fontWeight: "600",
  },
  previewLocationTextDisabled: {
    color: "#666",
    fontSize: 12,
    marginLeft: 6,
    fontWeight: "600",
    fontStyle: "italic",
  },
  rightControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  switchContainer: {
    paddingHorizontal: 4,
  },
  locationSwitch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  dotsButton: {
    padding: 8,
  },
  dropdown: {
    position: "absolute",
    right: 20,
    top: 120,
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    paddingVertical: 8,
    minWidth: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 100,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  dropdownText: {
    color: "white",
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "500",
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: "#333",
    marginHorizontal: 15,
  },
  mediaContainer: {
    width: "100%",
    height: screenHeight * 0.7,
    borderRadius: 25,
    overflow: "hidden",
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 1,
  },
  previewMedia: {
    width: "100%",
    height: "100%",
  },

  // Custom Video Control Styles
  videoContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  centerControls: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  playPauseButton: {
    borderRadius: 50,
    padding: 15,
    backdropFilter: "blur(10px)",
  },
  bottomVideoControls: {
    position: "absolute",
    bottom: 15,
    left: 15,
    right: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  timeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  muteButton: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 20,
    padding: 8,
  },
  progressContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    zIndex: 10,
  },
  progressBar: {
    height: "100%",
    width: "100%",
    backgroundColor: "transparent",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 1,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 5,
  },

  captionContainer: {
    width: "98%",
    backgroundColor: "#000",
    paddingHorizontal: 15,
    paddingVertical: 12,
    zIndex: 1,
  },
  captionInput: {
    color: "white",
    fontSize: 14,
    minHeight: 40,
    textAlignVertical: "top",
  },

  // Action buttons container
  actionButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
    width: "90%",
    marginBottom: 20,
    zIndex: 1,
  },
  // Share button when with create album button
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    flex: 1, // Takes equal space when create album is present
  },
  // Share button when alone (30% width, centered)
  shareButtonSolo: {
    flex: 0, // Remove flex
    width: "30%", // Fixed 30% width
  },
  shareButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "700",
    marginRight: 8,
  },
  // Create Album Button (no background)
  createAlbumButtonNew: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 25,
    flex: 1, // Takes equal space with share button
  },
  createAlbumTextNew: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    marginRight: 8,
  },

  // Loading states
  buttonDisabled: {
    opacity: 0.6,
  },

  bottomEmpty: {
    flex: 1,
    width: "100%",
    minHeight: 10,
  },
});
