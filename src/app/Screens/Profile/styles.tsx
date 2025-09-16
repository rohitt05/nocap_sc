import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    // FIXED: Remove marginTop so image starts from top
    scrollContainerFixed: {
        flex: 1,
    },
    // FIXED: Profile image container that starts from very top
    profileImageContainerFixed: {
        position: 'relative',
        height: 600, // Fixed height for consistent layout
        width: '100%',
        marginTop: 0,
        overflow: 'hidden', // Prevents image overflow
        backgroundColor: '#111', // Background color while loading
    },
    profileImageHD: {
        width: '100%',
        height: '100%',
        borderRadius: 25,
        // These properties ensure crisp image rendering
    },

    // FIXED: Navbar with precise positioning - no extra spacing
    navbarPrecise: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        flexDirection: 'column',
        justifyContent: 'flex-end', // Align content to bottom of navbar container
    },
    // Navbar content wrapper
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
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 25
    },
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#111',
    },
    loadingText: {
        color: 'white',
        fontSize: 16,
    },
    mapSection: {
        // paddingHorizontal: 16,
        paddingBottom: 20,
    },
    scrollHelperTop: {
        height: 20,
        backgroundColor: 'transparent',
        width: '100%',
        zIndex: 10,
    },
    mapWrapper: {
        // Your existing map styles
    },
    scrollHelperBottom: {
        height: 20,
        backgroundColor: 'transparent',
        width: '100%',
        zIndex: 10,
    },
});
