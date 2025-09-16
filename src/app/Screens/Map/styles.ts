// styles.ts - ENHANCED with Premium Design System
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  
  locationMarkerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  
  map: {
    flex: 1,
  },
  
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  
  loadingText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12, // ✅ IMPROVED: Slightly larger for better readability
    marginTop: 8,
    fontWeight: "500",
  },
  
  errorText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14, // ✅ IMPROVED: Larger for better readability
    textAlign: "center",
    fontWeight: "500",
  },

  // ✅ ENHANCED: Your location marker - cleaner design
  locationMarker: {
    width: 36, // ✅ Slightly larger for better visibility
    height: 36,
    borderRadius: 18,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 3,
    borderColor: "#007AFF",
  },
  
  youAreHereText: {
    color: "black",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,

   
    textAlign: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,

    letterSpacing: 0.3,
  },

  // ✅ ENHANCED: Weather info with better styling
  weatherInfo: {
    position: "absolute",
    top: 150,
    right: 16,
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  
    zIndex: 1000,
  },
  
  weatherTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  
  weatherIcon: {
    marginRight: 8,
  },
  
  weatherTemp: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  weatherDescription: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
    textTransform: "capitalize",
    letterSpacing: 0.2,
  },

  // ✅ ENHANCED: Map controls with better consistency
  mapControls: {
    position: "absolute",
    top: 250,
    right: 12,
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    zIndex: 1000,
  },
  
  gpsButton: {
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  locationSharingButton: {
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  locationSharingEnabled: {
    backgroundColor: "rgba(76, 175, 80, 0.8)",
    borderColor: "rgba(76, 175, 80, 0.6)",
    shadowColor: "#4CAF50",
  },

  // ✅ ENHANCED: Bottom button with modern glass effect
  bottomButtonContainer: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1000,
  },
  
  liquidGlassButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  
  liquidGlassText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  // ✅ ENHANCED: Friends markers with better styling
  friendMarker: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#4CAF50",
    backgroundColor: "white",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    position: "relative",
  },
  
  selectedFriendMarker: {
    borderColor: "#FFD700",
    borderWidth: 4,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 12,
    transform: [{ scale: 1.05 }],
  },
  
  friendProfilePic: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  
  storyIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
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
  
  photoStory: {
    backgroundColor: "#4CAF50",
  },
  
  videoStory: {
    backgroundColor: "#FF5722",
  },

  // ✅ NEW: Premium Album Styles (for your minimal stacked photos)
  minimalAlbumContainer: {
    alignItems: "center",
    justifyContent: "center",
  },

  selectedAlbum: {
    transform: [{ scale: 1.08 }],
  },

  photoStack: {
    width: 70,
    height: 75,
    position: "relative",
  },

  // Main photo (front)
  mainPhotoWrapper: {
    position: "absolute",
    top: 0,
    left: 12,
    zIndex: 3,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 10,
  },

  mainPhoto: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ffffff",
  },

  // Second photo (middle)
  secondPhotoWrapper: {
    position: "absolute",
    top: 6,
    left: 6,
    zIndex: 2,
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 8,
  },

  secondPhoto: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#ffffff",
    opacity: 0.9,
  },

  // Third photo (back)
  thirdPhotoWrapper: {
    position: "absolute",
    top: 12,
    left: 0,
    zIndex: 1,
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 6,
  },

  thirdPhoto: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ffffff",
    opacity: 0.8,
  },

  // Video indicator
  videoIcon: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 8,
    padding: 2,
  },

  // Extra count badge
  extraCount: {
    position: "absolute",
    top: -2,
    right: 8,
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 5,
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: "#ffffff",
  },

  extraCountText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  // Album label
  albumLabel: {
    marginTop: 8,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },

  albumName: {
    color: "white",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.3,
  },

  // ✅ ENHANCED: Loading and other states
  albumLoadingIndicator: {
    position: "absolute",
    top: 110,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  albumLoadingText: {
    color: "white",
    fontSize: 12,
    marginLeft: 8,
    fontWeight: "500",
  },

  albumsToggleButton: {
    marginHorizontal: 8,
    padding: 12,
    borderRadius: 28,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
