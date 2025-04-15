import { StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
        backgroundColor: '#000000',
    },
    scrollContentContainer: {
        padding: 16,
        paddingBottom: 40,
    },
    notificationItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
    },
    reactionTextImage: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#fff'
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    rightSection: {
        alignItems: 'flex-end',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#333333',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    fullName: {
        fontSize: 16,
        color: '#FFFFFF',
        marginBottom: 2,
    },
    notificationText: {
        fontSize: 14,
        color: '#BBBBBB',
    },
    timestamp: {
        fontSize: 12,
        color: '#666666',
        marginBottom: 8,
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    acceptButton: {
        backgroundColor: '#132fba',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 25,
        marginLeft: 12,
    },
    acceptButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    declineButtonText: {
        color: '#FF3B30',
        fontSize: 14,
    },
    processingIndicator: {
        marginRight: 12,
    },
    reactionEmoji: {
        fontSize: 20,
        marginRight: 8,
    },
    separator: {
        height: 1,
        backgroundColor: '#222222',
        width: '100%',
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    errorContainer: {
        padding: 20,
        alignItems: 'center',
        marginBottom: 20,
    },
    errorText: {
        color: '#FF3B30',
        marginBottom: 16,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#222222',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    emptyContainer: {
        padding: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyTextPrimary: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptyTextSecondary: {
        color: '#666666',
        fontSize: 14,
        textAlign: 'center',
    },
    curseNotificationText: {
        color: '#FF4500', // Bright red-orange for curse notifications
    },
    curseEmoji: {
        fontSize: 24, // Slightly larger emoji
        color: '#FF4500', // Match text color
    },
});