import { StyleSheet, Dimensions } from "react-native";
export const { width, height: SCREEN_HEIGHT } = Dimensions.get("window");
export const SHEET_HEIGHT = SCREEN_HEIGHT * 0.6;

export const HORIZONTAL_PADDING = 20;
export const CARD_MARGIN = 6;
export const CARD_WIDTH =
  (width - HORIZONTAL_PADDING * 2 - CARD_MARGIN * 4) / 3;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  singleStoryContainer: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 12,
    fontWeight: "500",
  },

  flatList: {
    flex: 1,
    marginHorizontal: -CARD_MARGIN,
  },
  flatListContent: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  leftAlignedRow: {
    justifyContent: "flex-start",
    marginBottom: 0,
    paddingHorizontal: CARD_MARGIN,
  },

  singleStoryCard: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#1A1A1A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    minHeight: 400,
  },
  multipleStoryCard: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#1A1A1A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  storyImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#333",
  },

  mediaPlayer: {
    width: "100%",
    height: "100%",
  },

  optionsButton: {
    position: "absolute",
    top: 6,
    right: 6,
    padding: 4,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 12,
    zIndex: 100,
    minWidth: 24,
    minHeight: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  twoStoryOptionsButton: {
    top: 8,
    right: 8,
    padding: 5,
    borderRadius: 14,
    minWidth: 26,
    minHeight: 26,
  },
  disabledButton: {
    opacity: 0.7,
  },

  singleGradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
  },

  storyOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    padding: 8,
    paddingTop: 24,
  },

  leftSection: {
    flex: 1,
    alignItems: "flex-start",
  },
  eyeContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
  },
  eyeIcon: {
    fontSize: 14,
  },
  twoStoryEyeIcon: {
    fontSize: 15,
  },
  viewCountText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "600",
    marginLeft: 2,
  },
  twoStoryViewCountText: {
    fontSize: 9,
    marginLeft: 3,
  },

  rightSection: {
    flex: 1,
    alignItems: "flex-end",
  },

  timeText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "600",
    textAlign: "right",
    marginBottom: 3,
    lineHeight: 10,
  },
  singleStoryTimeText: {
    fontSize: 14,
    lineHeight: 16,
  },
  twoStoryTimeText: {
    fontSize: 9,
    lineHeight: 11,
    marginBottom: 4,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    maxWidth: "100%",
  },
  locationText: {
    color: "#fff",
    fontSize: 7,
    fontWeight: "500",
    marginLeft: 2,
    textAlign: "right",
    lineHeight: 9,
  },
  singleStoryLocationText: {
    fontSize: 14,
    marginLeft: 6,
    fontWeight: "600",
    lineHeight: 16,
  },
  twoStoryLocationText: {
    fontSize: 8,
    lineHeight: 10,
    marginLeft: 3,
  },

  // All other styles remain exactly the same...
  expandedOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  expandedBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  expandedStoryContainer: {
    width: width * 0.9,
    height: SCREEN_HEIGHT * 0.8,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#1A1A1A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  expandedCloseButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1000,
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 20,
  },
  expandedStoryContent: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  expandedStoryImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#333",
  },
  expandedMediaPlayer: {
    width: "100%",
    height: "100%",
  },
  expandedGradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
  },
  expandedStoryOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    padding: 20,
    paddingTop: 40,
  },
  expandedLeftSection: {
    flex: 1,
    alignItems: "flex-start",
  },
  expandedEyeContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  expandedEyeIcon: {
    fontSize: 20,
  },
  expandedViewCountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },
  expandedRightSection: {
    flex: 1,
    alignItems: "flex-end",
  },
  expandedTimeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "right",
    marginBottom: 8,
  },
  expandedLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    maxWidth: "100%",
  },
  expandedLocationText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
    textAlign: "right",
  },

  // Viewers Bottom Sheet Styles (unchanged)
  sheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheetBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  viewersSheet: {
    height: SHEET_HEIGHT,
    backgroundColor: "#1A1A1A",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
  },
  sheetHeader: {
    alignItems: "center",
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    marginBottom: 20,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#666",
    borderRadius: 2,
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  sheetContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sheetLoadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sheetLoadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 12,
  },
  noViewersContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  noViewersIcon: {
    fontSize: 48,
    marginBottom: 20,
  },
  noViewersTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  noViewersSubtitle: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },
  viewersList: {
    flex: 1,
  },
  viewersListContent: {
    paddingBottom: 20,
  },
  viewerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  viewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#333",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  viewerAvatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  viewerInfo: {
    flex: 1,
  },
  viewerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 2,
  },
  viewerUsername: {
    fontSize: 12,
    fontWeight: "400",
    color: "#999",
    marginBottom: 2,
  },
  viewerTime: {
    fontSize: 12,
    color: "#999",
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "rgba(74, 144, 226, 0.15)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#4A90E2",
  },
  createButtonText: {
    fontSize: 14,
    color: "#4A90E2",
    fontWeight: "600",
    marginLeft: 6,
  },
});
