// styles.ts - REMOVED UNNECESSARY PADDING/SPACING
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // MAIN CONTAINER - Removed marginBottom
  container: {
    // marginBottom: 20, // REMOVED
  },

  loadingText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },

  mainTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  // BIGGER MAP SECTION - Increased height
  mapSection: {
    position: "relative",
    height: 250, 
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
    // bottom: 10,
  },

  bigMap: {
    flex: 1,
    borderRadius: 10,
  },

  controlsOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "box-none",
  },

  topLeftControls: {
    position: "absolute",
    top: 5,
    left: 5,
    zIndex: 10,
  },

  timeframeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    gap: 8,
  },

  timeframeText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },

  dropdownOverlay: {
    position: "absolute",
    top: 50,
    left: 0,
    width: 140,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    overflow: "hidden",
  },

  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },

  dropdownOptionSelected: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },

  dropdownOptionText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    fontWeight: "500",
  },

  dropdownOptionTextSelected: {
    color: "white",
    fontWeight: "600",
  },

  topRightControls: {
    position: "absolute",
    top: 5,
    right: 5,
    flexDirection: "column",
    gap: 12,
    zIndex: 10,
  },

  mapControlButton: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },

  locationSharingActive: {
    backgroundColor: "rgba(76, 175, 80, 0.8)",
    borderColor: "rgba(76, 175, 80, 0.6)",
  },

  userMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  activityMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },

  photoMarker: {
    backgroundColor: "#666",
  },

  videoMarker: {
    backgroundColor: "#FF5722",
  },

  storiesSection: {
    marginTop: 12, // Reduced from 16 to 12
  },

  storiesTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    paddingHorizontal: 6,
  },

  horizontalScroll: {
    minHeight: 200,
  },

  horizontalScrollContent: {
    paddingHorizontal: 6,
  },

  storyCard: {
    width: 160,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 12,
    marginRight: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
  },

  storyCardLast: {
    marginRight: 6,
  },

  storyThumbnail: {
    position: "relative",
    width: "100%",
    height: 120,
    backgroundColor: "#333",
  },

  thumbnailImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#222",
  },

  mediaTypeOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 12,
    padding: 4,
  },

  storyInfo: {
    padding: 8,
  },

  storyName: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },

  storyDate: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    fontWeight: "400",
    marginBottom: 4,
  },

  storyDescription: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 11,
    fontWeight: "400",
    lineHeight: 14,
  },

  expandedMedia: {
    marginTop: 8,
    borderRadius: 8,
    overflow: "hidden",
  },

  emptyState: {
    paddingVertical: 20,
    alignItems: "center",
    paddingHorizontal: 6,
  },

  emptyStateText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 14,
    textAlign: "center",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },

  expandedImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    backgroundColor: "#222",
  },

  videoContainer: {
    width: "100%",
    height: 200,
    backgroundColor: "#333",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },

  videoPlaceholder: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },

  videoUrl: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 10,
    textAlign: "center",
  },

  containerWithTabs: {
    marginTop: 20,
    marginBottom: 20,
  },

  tabHeaderSection: {
    paddingHorizontal: 6,
    marginBottom: 16,
  },

  tabSwitchContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 4,
  },

  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },

  tabButtonActive: {
    backgroundColor: "rgba(33, 150, 243, 0.2)",
    borderWidth: 1,
    borderColor: "#2196F3",
  },

  tabButtonText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    fontWeight: "600",
  },

  tabButtonTextActive: {
    color: "#2196F3",
  },

  activityTabContent: {
    flex: 1,
  },

  responsesTabContent: {
    flex: 1,
    paddingHorizontal: 6,
  },

  activityToggleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  titleContainer: {
    flex: 1,
  },

  lastSeenText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 2,
  },

  friendMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF6B6B",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  // REMOVED EXCESSIVE PADDING - Header section
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 8, // Reduced from 20 to 8
    paddingVertical: 8, // Reduced from 15 to 8
    marginBottom: 8, // Added small margin
  },

  userLocationDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "white",
    borderWidth: 3,
    borderColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },

  userLocationInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4A90E2",
  },

  locationMarkerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
    zIndex: 9999,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  storyMarkerContainer: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    zIndex: 100,
    elevation: 5,
  },
});
