import { StyleSheet } from "react-native";
import { fonts } from '../../../../utils/Fonts/fonts';

export const styles = StyleSheet.create({
    mediaResponseItem: {
        position: 'relative',
        marginBottom: 16,
        borderRadius: 24,
        overflow: 'hidden',
        height: 650,
    },
    mediaContainer: {
        width: '100%',
        height: '100%',
        borderRadius: 24,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#111',
    },
    mediaContent: {
        width: '100%',
        height: '100%',
        borderRadius: 24,
    },
    mediaPoster: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '100%',
        // backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 24,
    },
    overlayHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        zIndex: 20,
    },
    profilePic: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    headerInfo: {
        marginLeft: 10,
        flex: 1,
    },
    overlayUsername: {
        fontWeight: '600',
        fontSize: 16,
        color: '#fff',
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
        fontFamily: fonts.extraBold,
    },
    overlayTimestamp: {
        fontSize: 12,
        color: '#ddd',
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
        marginRight: 8,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end', // Changed to align children to the right
        zIndex: 20,
    },
    sendButton: {
        // color: 'white'
    },
    overlayCaption: {
        fontSize: 16,
        color: '#fff',
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
        flex: 1,
        marginRight: 10,
        fontFamily: fonts.regular, // Using Figtree Regular font
    },
    // Group for reaction buttons
    reactionsGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    // Standard action button (send icon)
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    // Dashed reaction buttons (emoji icons)
    reactionButton: {
        marginLeft: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 8,
        borderRadius: 25,
        borderWidth: 1, // Underline style
        // borderBottomColor: 'white', // Subtle underline
        justifyContent: 'center',
        alignItems: 'center',
        borderStyle: 'dashed',
        borderColor: 'white',
    },
    menuDotsContainer: {
        zIndex: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 25,
        padding: 8,
    },
    menuDots: {
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    errorOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 15,
        padding: 20,
    },
    errorText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#5A6CFF',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    retryText: {
        color: 'white',
        marginLeft: 5,
        fontWeight: '500',
    },
    // Updated debug button to be more circular and icon-focused
    debugButton: {
        position: 'absolute',
        bottom: 10, // Changed from 80 to match bottomBar position
        left: 20,
        padding: 12,
        borderRadius: 30,
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 30,
        // backgroundColor: 'rgba(0,0,0,0.5)',
    },
    reactionsContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
});