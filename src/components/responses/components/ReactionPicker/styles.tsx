import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        position: 'absolute',
        bottom: 65,
        left: 110,
        zIndex: 100,
        borderRadius: 20,
    },
    pickerContainer: {
        flexDirection: 'row',
        padding: 8,
        // backgroundColor: 'transparent', // Ensure no background
    },
    reactionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 4,
       
    },
    emojiText: {
        fontSize: 20,
        // Optional: slight text shadow for extra depth
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    }
});