import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        flex: 1,
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginRight: 40, // To offset the back button and keep the title centered
    },
    body: {
        flex: 1,
        backgroundColor: '#000',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: 'white',
        marginTop: 15,
        fontSize: 16,
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    noContactsText: {
        color: 'white',
        fontSize: 18,
        marginTop: 15,
        textAlign: 'center',
    },
    syncDescription: {
        color: '#aaa',
        fontSize: 16,
        marginTop: 10,
        textAlign: 'center',
        marginHorizontal: 20,
    },
    retryButton: {
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#0088cc',
        borderRadius: 20,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    enableSyncButton: {
        marginTop: 20,
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: '#0088cc',
        borderRadius: 20,
    },
    enableSyncButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    privacySettingsButton: {
        marginTop: 15,
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: 'transparent',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#444',
    },
    privacySettingsButtonText: {
        color: '#0088cc',
        fontSize: 16,
        fontWeight: '500',
    },
    headerSection: {
        padding: 15,
    },
    sectionTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    sectionSubtitle: {
        color: '#aaa',
        fontSize: 14,
        lineHeight: 20,
    },
    contactsList: {
        flex: 1,
    },
    listContentContainer: {
        paddingBottom: 20,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    contactInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    avatarText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    contactName: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    phoneNumber: {
        color: '#aaa',
        fontSize: 14,
        marginTop: 2,
    },
    inviteButton: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        backgroundColor: '#0088cc',
        borderRadius: 15,
    },
    inviteButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
});