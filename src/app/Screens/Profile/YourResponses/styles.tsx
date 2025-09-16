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
    rowScrollView: {
        height: 230,
        marginBottom: 15,
        overflow: 'visible',
    },
    responseContainer: {
        marginRight: 15,
        overflow: 'visible',
    },
    pinItem: {
        width: 150, // All cards will be 150px wide
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#1E1E1E',
    },
    // FIXED: Remove width override for text items - keep same width as other cards
    textPinItem: {
        // width: 380, // REMOVED this line
        height: 180,
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
        overflow: 'visible',
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
        width: 150, // Same size as regular pinned response cards
        height: 180,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#888',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        marginRight: 15,
    },
    addPinText: {
        color: '#888',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 10,
    },
    loadingContainer: {
        height: 250,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        width: 250,
        height: 250,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#888',
        fontSize: 16,
    },

});
