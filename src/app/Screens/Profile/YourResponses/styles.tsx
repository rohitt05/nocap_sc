import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        backgroundColor: '#000',
        paddingHorizontal: 5,
        paddingVertical: 25,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    headerText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    visibilityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    visibilityText: {
        color: '#888',
        fontSize: 14,
        marginLeft: 8,
    },
    scrollContent: {
        paddingRight: 15,
        paddingLeft: 10,
    },
    responseContainer: {
        marginRight: 15,
    },
    pinItem: {
        width: 150,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#1E1E1E',
    },
    // Special style for text items to make them wider
    textPinItem: {
        width: 380, // Wider to accommodate more text
        height: 180, // Matching the height in TextResponse
    },
    mediaPreviewContainer: {
        aspectRatio: 1,
        backgroundColor: '#2A2A2A',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    dateContainer: {
        padding: 10,
        width: '100%',
    },
    promptHint: {
        color: '#AAA',
        fontSize: 10,
        marginBottom: 4,
    },
    dateText: {
        color: 'white',
        fontSize: 12,
    },
    addNewPin: {
        width: 150,
        height: 180,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#888',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        marginRight: 20,
    },
    addPinText: {
        color: '#888',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 10,
    },
    loadingContainer: {
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        width: 250,
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#888',
        fontSize: 16,
    },
});