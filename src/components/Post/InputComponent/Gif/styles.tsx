
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    gifContainer: {
        flex: 1,
        backgroundColor: '#000',
        borderRadius: 12,
        maxHeight: 700,
    },
    searchContainer: {
        padding: 10,
    },
    gifSearchInput: {
        backgroundColor: '#222',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        color: 'white',
        fontSize: 14,
    },
    gifGrid: {
        padding: 8,
    },
    gifItem: {
        flex: 1,
        margin: 4,
        height: 120,
        borderRadius: 8,
        overflow: 'hidden',
    },
    gifImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#333',
    },
    emptyState: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#444',
        margin: 10,
        borderRadius: 8,
        backgroundColor: '#222',
    },
    placeholderText: {
        color: '#666',
        textAlign: 'center',
    },
    errorText: {
        color: '#ff6b6b',
        textAlign: 'center',
        marginBottom: 10,
    },
    retryButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        backgroundColor: '#444',
        borderRadius: 4,
        marginTop: 10,
    },
    retryButtonText: {
        color: 'white',
    },
    // Styles for selected GIF view
    selectedGifContainer: {
        flex: 1,
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        position: 'relative',
    },
    selectedGifImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 16,
        padding: 2,
    }
});