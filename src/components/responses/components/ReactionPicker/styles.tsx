import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 45,
        left: 110,
        zIndex: 100,
    },
    pickerContainer: {
        flexDirection: 'row',
        padding: 8,
        backgroundColor: 'transparent', // Ensure no background
    },
    reactionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 4,
        // Enhanced shadow to highlight emojis
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 5, // For Android shadow
    },
    emojiText: {
        fontSize: 20,
        // Optional: slight text shadow for extra depth
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    }
});