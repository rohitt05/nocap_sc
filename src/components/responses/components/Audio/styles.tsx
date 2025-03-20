import { StyleSheet } from "react-native";
import { fonts } from '../../../../utils/Fonts/fonts';

export const styles = StyleSheet.create({
    responseItem: {
        marginBottom: 15,
    },
    contentContainer: {
        borderRadius: 12,
        padding: 15,
        position: 'relative',
        height: 200, // Increased height of container
        justifyContent: 'space-between', // This helps position elements at top and bottom
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    profilePic: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    headerInfo: {
        flex: 1,
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
    timestamp: {
        color: '#aaa',
        fontSize: 12,
        fontFamily: fonts.regular,
        marginRight: 8,
    },
    menuDotsContainer: {
        padding: 5,
    },
    menuDots: {
        opacity: 0.7,
    },
    messageContent: {
        flex: 1, // This will take up available space, pushing other elements to top/bottom
    },
    audioControls: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        bottom: 15,
        left: 15,
    },
    playButton: {
        // No background color
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    audioDuration: {
        color: '#aaa',
        fontSize: 12,
        fontFamily: fonts.regular,
    },
    reactionsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        position: 'absolute',
        bottom: 15,
        right: 15,
    },
    sendButton: {
        marginRight: 15,
        justifyContent: 'center',
        alignItems: 'center',
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
    errorText: {
        color: '#ff4d4d',
        fontSize: 12,
        textAlign: 'center',
        marginVertical: 5,
    }
});