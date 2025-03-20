import { StyleSheet } from "react-native";
// Styles remain unchanged
export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
    },
    scrollView: {
        flex: 1,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#121212',
        marginHorizontal: 20,
        marginVertical: 10,
        padding: 15,
        borderRadius: 12,
    },
    profileIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#B8860B', // Dark goldenrod color as in image
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    profileIconText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    profileUsername: {
        color: 'white',
        fontSize: 14,
        opacity: 0.8,
    },
    section: {
        marginTop: 25,
    },
    sectionTitle: {
        color: 'white',
        fontSize: 14,
        marginLeft: 25,
        marginBottom: 10,
        opacity: 0.8,
    },
    menuContainer: {
        backgroundColor: '#121212',
        marginHorizontal: 20,
        borderRadius: 12,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    menuIcon: {
        marginRight: 15,
    },
    menuText: {
        color: 'white',
        fontSize: 16,
        flex: 1,
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rightText: {
        color: '#888',
        marginRight: 10,
    },
    rightIcon: {
        marginLeft: 5,
    },
    logoutButton: {
        backgroundColor: '#121212',
        marginHorizontal: 20,
        marginTop: 25,
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    // Add this to your styles.js file
    logoutButtonDisabled: {
        opacity: 0.5,
    },
    logoutText: {
        color: '#FF3B30', // Red color for logout
        fontSize: 16,
        fontWeight: '500',
    },
    versionText: {
        color: '#666',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 15,
    },
    bottomSpacer: {
        height: 50,
    },
});