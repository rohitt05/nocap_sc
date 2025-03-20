import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, Image, ScrollView } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BackHandler } from 'react-native';
import { useEffect } from 'react';

// Sample contact data
const contactsData = [
    {
        id: '1',
        username: 'shweta',
        displayName: 'shweta',
        profileImage: 'https://randomuser.me/api/portraits/women/32.jpg'
    }
];

const NewChatScreen = () => {
    const [selectedContacts, setSelectedContacts] = useState([]);
    const router = useRouter();

    // Custom back navigation function
    const goBack = () => {
        router.replace('/(tabs)/chats');
        return true;
    };

    // Set up hardware back button handler
    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            goBack
        );

        return () => backHandler.remove();
    }, []);

    const toggleContactSelection = (contact) => {
        if (selectedContacts.some(c => c.id === contact.id)) {
            setSelectedContacts(selectedContacts.filter(c => c.id !== contact.id));
        } else {
            setSelectedContacts([...selectedContacts, contact]);
        }
    };

    const isContactSelected = (contactId) => {
        return selectedContacts.some(c => c.id === contactId);
    };

    const startButtonStyle = selectedContacts.length === 0 ? [styles.startButtonText, styles.startButtonTextDisabled] : styles.startButtonText;

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" />
            <View style={styles.container}>
                {/* Top Navbar */}
                <View style={styles.navbar}>
                    <TouchableOpacity style={styles.backButton} onPress={goBack}>
                        <FontAwesome6 name="arrow-left" size={20} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.navbarTitle}>New Chat</Text>
                    <TouchableOpacity
                        style={styles.startButton}
                        onPress={() => {
                            if (selectedContacts.length > 0) {
                                router.replace('/Screens/ChatDetail');
                            }
                        }}
                        disabled={selectedContacts.length === 0}
                    >
                        <Text style={startButtonStyle}>
                            Start
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* To: Field */}
                <View style={styles.toFieldContainer}>
                    <Text style={styles.toLabel}>To:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectedContactsScroll}>
                        {selectedContacts.map((contact) => (
                            <View key={contact.id} style={styles.selectedContactChip}>
                                <Text style={styles.selectedContactText}>{contact.username}</Text>
                                <TouchableOpacity
                                    onPress={() => toggleContactSelection(contact)}
                                    style={styles.removeContactButton}
                                >
                                    <FontAwesome6 name="times" size={12} color="white" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Contact List */}
                <ScrollView style={styles.contactsList}>
                    {contactsData.map(contact => (
                        <TouchableOpacity
                            key={contact.id}
                            style={styles.contactItem}
                            onPress={() => toggleContactSelection(contact)}
                        >
                            <Image
                                source={{ uri: contact.profileImage }}
                                style={styles.contactImage}
                            />
                            <View style={styles.contactInfo}>
                                <Text style={styles.contactName}>{contact.username}</Text>
                                <Text style={styles.contactUsername}>{contact.displayName}</Text>
                            </View>
                            {isContactSelected(contact.id) ? (
                                <View style={styles.checkMark}>
                                    <FontAwesome6 name="check" size={14} color="white" />
                                </View>
                            ) : (
                                <View style={styles.emptyCheckMark} />
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'black',
    },
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    navbar: {
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: '#333',
    },
    backButton: {
        position: 'absolute',
        left: 15,
        zIndex: 10,
    },
    navbarTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '500',
    },
    startButton: {
        position: 'absolute',
        right: 15,
        zIndex: 10,
    },
    startButtonText: {
        color: 'white',
        fontSize: 16,
    },
    startButtonTextDisabled: {
        color: '#999',
    },
    toFieldContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: '#333',
    },
    toLabel: {
        color: 'white',
        fontSize: 18,
        marginRight: 10,
    },
    selectedContactsScroll: {
        flex: 1,
    },
    selectedContactChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#333',
        borderRadius: 15,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginRight: 8,
    },
    selectedContactText: {
        color: 'white',
        fontSize: 14,
        marginRight: 5,
    },
    removeContactButton: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#666',
        alignItems: 'center',
        justifyContent: 'center',
    },
    contactsList: {
        flex: 1,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    contactImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    contactInfo: {
        marginLeft: 15,
        flex: 1,
    },
    contactName: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    contactUsername: {
        color: '#999',
        fontSize: 14,
    },
    checkMark: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#007AFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyCheckMark: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#555',
    },
});

export default NewChatScreen;