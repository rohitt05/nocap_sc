import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    // Main container
    container: {
        flex: 1,
        backgroundColor: '#000',
    },

    // Navbar styles
    navbarPrecise: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        flexDirection: 'column',
        justifyContent: 'flex-end',
    },

    navbarContent: {
        height: 60,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
    },

    backButton: {
        padding: 8,
    },

    navbarTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },

    menuButton: {
        padding: 8,
    },

    menuButtonContainer: {
        borderRadius: 25,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // ScrollView styles
    scrollContainerFixed: {
        flex: 1,
    },

    userScrollContent: {
        paddingBottom: 30,
    },

    // Profile image container styles
    profileImageContainerFixed: {
        position: 'relative',
        height: 600,
        width: '100%',
        marginTop: 0,
        overflow: 'hidden',
        backgroundColor: '#111',
    },

    profileImageHD: {
        width: '100%',
        height: '100%',
        borderRadius: 25,
    },

    // Username and bio container
    usernameContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingVertical: 20,
        paddingHorizontal: 15,
        justifyContent: 'flex-end',
        height: 120,
    },

    userInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    userTextContainer: {
        width: '80%',
    },

    username: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
    },

    userBio: {
        color: 'white',
        fontSize: 14,
        fontWeight: '400',
    },

    // Edit button (for owner)
    editButton: {
        width: '20%',
        alignItems: 'center',
    },

    editButtonContainer: {
        borderRadius: 25,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        left: 10,
    },

    // Loading states
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },

    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },

    errorText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
    },

    goBackButton: {
        marginTop: 20,
        padding: 10,
    },

    goBackButtonText: {
        color: '#3498db',
        fontSize: 16,
    },

    // Friend action buttons
    friendButtonContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
        marginHorizontal: 16,
        width: '90%',
        alignSelf: 'center',
        flexDirection: 'row',
    },

    friendButtonPending: {
        backgroundColor: '#cccccc',
        padding: 15,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
        marginHorizontal: 16,
        width: '90%',
        alignSelf: 'center',
        flexDirection: 'row',
    },

    friendButtonAccept: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
        marginHorizontal: 16,
        width: '90%',
        alignSelf: 'center',
        flexDirection: 'row',
    },

    unblockButton: {
        backgroundColor: 'transparent',
        padding: 15,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
        marginHorizontal: 16,
        width: '90%',
        alignSelf: 'center',
        flexDirection: 'row',
        borderWidth: 0.5,
        borderColor: 'white',
    },

    // Button text styles
    friendButtonText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 16,
    },

    friendButtonTextPending: {
        color: '#666666',
        fontWeight: 'bold',
        fontSize: 16,
    },

    friendButtonTextAccept: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 16,
    },

    unblockButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },

    // Icon styles
    friendButtonIcon: {
        marginLeft: 10,
    },

    // Responses container
    responsesContainer: {
        marginTop: -10,
    },

    // Utility styles
    zIndexHigh: {
        zIndex: 10,
    },

    fullWidth: {
        width: '100%',
    },

    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },


});
