import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    navbar: {
        height: 50,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    navbarLeft: {
        width: 30,
    },
    navbarCenter: {
        flex: 1,
        alignItems: 'center',
    },
    navbarRight: {
        width: 30,
        alignItems: 'center',
    },
    navbarTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    notificationButton: {
        padding: 3,
    },
    scrollView: {
        flex: 1,
        padding: 16,
    },
    searchBarContainer: {
        marginBottom: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#222',
        borderRadius: 18,
        paddingHorizontal: 12,
        height: 50,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 50,
        color: '#fff',
    },
    inlineCancel: {
        paddingHorizontal: 8,
    },
    cancelText: {
        color: '#3897f0',
        fontSize: 16,
    },
    inviteBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#222',
        borderRadius: 18,
        padding: 10,
        marginBottom: 24,
    },
    logo: {
        backgroundColor: '#000',
        borderRadius: 25,
        padding: 10,
        width: 40,
        height: 40,
    },
    inviteLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    inviteTextContainer: {
        flexDirection: 'column',
        left: 10,
    },
    inviteText: {
        color: '#fff',
        fontWeight: '500',
    },
    inviteLinkText: {
        color: '#3897f0',
        marginTop: 4,
    },
    inviteButton: {
        borderRadius: 8,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    friendsHeader: {
        color: '#e0e0e0',
        fontSize: 18,
        marginBottom: 16,
    },
    friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 0.3,
        borderBottomColor: '#333',
    },
    friendInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    friendImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    friendUsername: {
        color: '#fff',
        fontSize: 16,
    },
    friendName: {
        color: '#999',
        fontSize: 14,
        marginTop: 2,
    },
    closeButton: {
        padding: 5,
    },
    addButton: {
        padding: 8,
    },
    pendingText: {
        color: '#777',
        fontSize: 14,
        padding: 5,
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    errorContainer: {
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#331111',
        borderRadius: 8,
    },
    errorText: {
        color: '#ff6666',
        marginBottom: 10,
    },
    retryButton: {
        backgroundColor: '#3897f0',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4,
    },
    retryText: {
        color: '#fff',
        fontWeight: '500',
    },
    emptyContainer: {
        padding: 30,
        alignItems: 'center',
    },
    emptyText: {
        color: '#fff',
        fontSize: 18,
        marginTop: 10,
    },
    emptySubtext: {
        color: '#999',
        textAlign: 'center',
        marginTop: 5,
    },
    noResultsText: {
        color: '#999',
        textAlign: 'center',
        padding: 20,
    },
    searchResultsContainer: {
        marginTop: 10,
    },
});