import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    previewContainer: {
        flex: 1,
        position: 'relative',
        backgroundColor: 'black',
        borderRadius: 25,
        overflow: 'hidden',
    },
    mediaPreview: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    mirroredMedia: {
        transform: [{ scaleX: -1 }]
    },
    // For the buttonContainer - This will be positioned at the top of the preview
    buttonContainer: {
        position: 'absolute',
        top: 15,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
    },

    // For the action buttons
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});