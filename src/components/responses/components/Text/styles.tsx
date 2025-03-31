import { StyleSheet } from "react-native";
import { fonts } from '../../../../utils/Fonts/fonts';

export const styles = StyleSheet.create({
    responseItem: {
        borderWidth: 0.3,
        borderColor: '#333',
        borderRadius: 24,
        marginBottom: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    // Different height states
    compactHeight: {
        minHeight: 140, // Minimal height for short content
    },
    defaultHeight: {
        minHeight: 200, // Current height for medium content
    },
    expanded: {
        // For expanded state, let content determine height
        minHeight: 200,
    },
    contentContainer: {
        padding: 12,
        flex: 1,
        position: 'relative',
        paddingBottom: 50, // Add padding at the bottom to make room for reactions
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
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
    },
    username: {
        fontWeight: '600',
        fontSize: 16,
        color: '#fff',
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
        fontFamily: fonts.extraBold,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        top: 12,
        right: 12,
    },
    timestamp: {
        fontSize: 12,
        color: '#999',
        marginRight: 10,
    },
    textContentContainer: {
        flexDirection: 'row',
        marginTop: 30,
        paddingHorizontal: 10,
        marginBottom: 15, // Add margin to separate content from footer
    },
    quoteIcon: {
        marginTop: -6,
        marginRight: 4,
    },
    textContent: {
        fontSize: 18,
        lineHeight: 22,
        color: '#e0e0e0',
        flex: 1,
        fontFamily: fonts.semiBold,
    },
    moreButton: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        paddingVertical: 4,
        paddingHorizontal: 8,
        zIndex: 10,
    },
    moreButtonText: {
        color: '#aaa',
        fontFamily: fonts.medium,
        fontSize: 14,
    },
    reactionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        bottom: 12,
        right: 12,
        zIndex: 10,
    },
    sendIcon: {
        marginRight: 5,
    },
    reactionButton: {
        marginLeft: 10,
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
        alignSelf: 'center',
    },
});
