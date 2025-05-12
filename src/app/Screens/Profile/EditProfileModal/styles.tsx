
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    keyboardAvoidingContainer: {
        width: '100%',
        height: '90%',
    },
    modalView: {
        backgroundColor: '#111',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        height: '100%',
        padding: 0,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -3,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    swipeIndicator: {
        width: 40,
        height: 5,
        backgroundColor: '#666',
        borderRadius: 3,
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 5,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 30,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 18,
        borderBottomWidth: 0.5,
        borderBottomColor: '#222',
    },
    modalTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
        paddingLeft: 5,
    },
    saveButtonContainer: {
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    saveButton: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        color: '#666',
    },
    profileImageSection: {
        alignItems: 'center',
        marginVertical: 25,
        position: 'relative',
    },
    profileImageContainer: {
        position: 'relative',
        marginBottom: 10,
    },
    profileImage: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 2,
        borderColor: '#000',
    },
    editImageButton: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: '#fff',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#000',
    },
    changePhotoText: {
        color: '#fff',
        fontSize: 14,
        marginTop: 8,
        fontWeight: '500',
    },
    formSection: {
        paddingHorizontal: 20,
        marginTop: 10,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        color: '#999',
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '500',
    },
    textInput: {
        backgroundColor: '#111',
        color: 'white',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#222',
    },
    bioInput: {
        height: 120,
        textAlignVertical: 'top',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        zIndex: 10,
        borderRadius: 55,
        width: 110,
        height: 110,
    }
});