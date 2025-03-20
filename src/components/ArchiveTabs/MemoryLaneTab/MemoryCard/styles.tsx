import { Dimensions, StyleSheet } from "react-native";

export const { width } = Dimensions.get('window');
// Full width for each item
const ITEM_WIDTH = width;
// Left padding for item content
const CONTENT_LEFT_PADDING = 10; // Adjust this value to control left alignment
export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    dateContainer: {
        flex: 1,
    },
    dateText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#fff',
    },
    iconContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    contentContainer: {
        flex: 1,
    },
    flatListContent: {
        // This ensures the content won't have extra padding
    },
    carouselItem: {
        width: width, // Full width of the screen
        height: '100%',
        justifyContent: 'center',
        alignItems: 'flex-start', // Align to the left instead of center
        paddingLeft: CONTENT_LEFT_PADDING, // Add left padding to shift content
    },
    carouselItemContent: {
        // This container ensures the content itself is centered within its area
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        fontSize: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#fff',
        fontSize: 16,
    },
    controlsContainer: {
        marginVertical: 16,
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 8,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#555',
        marginHorizontal: 4,
    },
    paginationDotActive: {
        backgroundColor: '#fff',
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    navigationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20, // Reduced from 60 to place buttons further apart
    },
    navButton: {
        backgroundColor: '#333',
        width: 44, // Slightly increased width
        height: 44, // Slightly increased height
        borderRadius: 22, // Maintain circular shape
        justifyContent: 'center',
        alignItems: 'center',
    },
    navButtonDisabled: {
        backgroundColor: '#222',
        opacity: 0.5,
    },
    navButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    }
});