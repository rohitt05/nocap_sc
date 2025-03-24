import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    scrollContainer: {
        flex: 1,
        marginTop: 60, // Added to account for the fixed navbar
    },
    navbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 60,
        paddingHorizontal: 15,
        backgroundColor: 'transparent',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
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
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 25,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileImageContainer: {
        position: 'relative',
        height: 450,
        width: '100%',
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
        height: 120, // This controls how high the gradient extends
    },
    userInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    userTextContainer: {
        width: '80%', // As requested, give 80% width to text content
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
        width: '20%', // As requested, give 20% width to the edit button area
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
    }
});