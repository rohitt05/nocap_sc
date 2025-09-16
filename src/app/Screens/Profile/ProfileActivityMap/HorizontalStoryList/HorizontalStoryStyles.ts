// HorizontalStoryStyles.ts - BEAUTIFUL "View on Map" BUTTON

import { StyleSheet } from "react-native";

export const horizontalStoryStyles = StyleSheet.create({
  // Main stories section
  storiesSection: {
    marginTop: 28,
  },

  storiesTitle: {
    color: "gray",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 24,
    paddingHorizontal: 6,
  },

  horizontalScroll: {
    minHeight: 480,
  },

  horizontalScrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 20,
    paddingRight: 25,
  },

  albumStackContainer: {
    position: "relative",
    width: 350,
    height: 460,
    marginRight: 25,
    marginBottom: 20,
  },

  stackBackgroundCard: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  stackCardImage: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    overflow: "hidden",
  },

  stackCardImageStyle: {
    borderRadius: 20,
    backgroundColor: "#333",
  },

  mainStackCard: {
    position: "relative",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },

  singleItemCard: {
    position: "relative",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },

  storyItem: {
    width: 350,
    height: 460,
    borderRadius: 20,
  },

  expandedItemContainer: {
    width: 350,
    marginRight: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  fullMediaContainer: {
    position: "relative",
    width: "100%",
    height: 460,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 12,
  },

  fullSizeVideo: {
    width: "100%",
    height: "100%",
  },

  fullSizeImage: {
    width: "100%",
    height: "100%",
  },

  fullImageStyle: {
    borderRadius: 20,
  },

  closeButtonOverlay: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 8,
    borderRadius: 20,
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 8,
  },

  detailsSectionBelow: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  detailsTextSection: {
    flex: 1,
    marginRight: 12,
  },

  detailsTitle: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 18,
    marginBottom: 4,
  },

  detailsDate: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },

  detailsCaption: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 11,
    fontWeight: "400",
    lineHeight: 14,
  },

  menuButtonBelow: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 8,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  storyImageBackground: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    overflow: "hidden",
  },

  storyImageStyle: {
    borderRadius: 20,
    backgroundColor: "#222",
  },

  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-start",
    alignItems: "stretch",
    zIndex: 5,
  },

  stackedAlbumInfo: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    zIndex: 8,
  },

  stackedAlbumName: {
    color: "white",
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 26,
    textShadowColor: "rgba(0, 0, 0, 1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },

  viewOnMapButton: {
    position: "absolute",
    bottom: 100, // You can adjust this, but keep lower for less intrusion
    left: 16,
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: "transparent",
    borderWidth: 0,
    borderRadius: 0,
    shadowOpacity: 0,
    elevation: 0,
    zIndex: 15,
  },

  viewOnMapText: {
    color: "#fff", // standard blue, but you can use 'black' or 'gray' for even more minimal
    fontSize: 15,
    fontWeight: "400",
    textAlign: "left",
    letterSpacing: 0,
    textShadowRadius: 0,
    textShadowOffset: { width: 0, height: 0 },
    textShadowColor: "transparent",
  },

  tapHint: {
    position: "absolute",
    bottom: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 15,
  },

  tapHintText: {
    color: "rgba(255, 255, 255, 0.95)",
    fontSize: 11,
    fontWeight: "500",
    marginLeft: 4,
  },

  // DELETE FUNCTIONALITY: Modal styles
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  deleteModalContent: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    width: "90%",
    maxWidth: 300,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  deleteModalMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  deleteModalButtons: {
    flexDirection: "row",
    width: "100%",
    gap: 10,
  },
  deleteModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#d32f2f",
  },
  deleteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  emptyState: {
    paddingVertical: 60,
    alignItems: "center",
    paddingHorizontal: 6,
  },
  emptyStateText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 20,
    textAlign: "center",
    marginTop: 20,
    lineHeight: 26,
    fontWeight: "600",
  },
});
