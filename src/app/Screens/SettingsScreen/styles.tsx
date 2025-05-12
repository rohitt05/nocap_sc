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
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#1c1c1c',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        minHeight: 300,
    },
    modalTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 20,
        textAlign: 'center',
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#2a2a2a',
        borderRadius: 10,
        marginBottom: 20,
    },
    dateText: {
        color: '#fff',
        marginLeft: 10,
        fontSize: 16,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    modalButton: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#444',
    },
    saveButton: {
        backgroundColor: '#4CAF50',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    addButton: {
        position: 'absolute',
        right: 16,
        alignSelf: 'center',
    },
    birthdayText: {
        color: '#888',
        fontSize: 14,
        marginTop: 4,
    },
});