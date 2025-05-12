import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NavigationHandler from './NavigationHandler'; // adjust path if needed

// Importing extracted utilities and styles
import { loadContactsData, inviteContact } from './utils';
import { styles } from './styles';

const CONTACT_SYNC_KEY = 'contactSyncEnabled';

const ContactInvites = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [contactSyncEnabled, setContactSyncEnabled] = useState(false);

    useEffect(() => {
        checkContactSyncStatus();
    }, []);

    const checkContactSyncStatus = async () => {
        try {
            setLoading(true);
            const value = await AsyncStorage.getItem(CONTACT_SYNC_KEY);
            const syncEnabled = value === 'true';
            setContactSyncEnabled(syncEnabled);

            if (syncEnabled) {
                // Only load contacts if sync is enabled
                loadContacts();
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error('Error checking contact sync status:', error);
            setLoading(false);
        }
    };

    const loadContacts = async () => {
        try {
            const contactsData = await loadContactsData();
            setContacts(contactsData);
        } catch (error) {
            console.error('Error loading contacts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = (contact) => {
        inviteContact(contact);
    };

    const handleEnableContactSync = async () => {
        try {
            await AsyncStorage.setItem(CONTACT_SYNC_KEY, 'true');
            setContactSyncEnabled(true);
            loadContacts();
        } catch (error) {
            console.error('Error enabling contact sync:', error);
        }
    };

    const renderContact = ({ item }) => {
        const name = item.name || `${item.firstName || ''} ${item.lastName || ''}`.trim() || "Unknown";
        const initial = name.charAt(0).toUpperCase();

        return (
            <View style={styles.contactItem}>
                <View style={styles.contactInfo}>
                    <View style={styles.avatar}>
                        {item.imageAvailable && item.image ? (
                            <Image source={{ uri: item.image.uri }} style={styles.avatarImage} />
                        ) : (
                            <Text style={styles.avatarText}>{initial}</Text>
                        )}
                    </View>
                    <View>
                        <Text style={styles.contactName}>{name}</Text>
                        {item.phoneNumbers && item.phoneNumbers.length > 0 && (
                            <Text style={styles.phoneNumber}>{item.phoneNumbers[0].number}</Text>
                        )}
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.inviteButton}
                    onPress={() => handleInvite(item)}
                >
                    <Text style={styles.inviteButtonText}>Invite</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* System back/gesture handling */}
            <NavigationHandler sourceTab="friends" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.replace('/(tabs)/friends')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Invite Friends</Text>
            </View>

            <View style={styles.body}>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#0088cc" />
                        <Text style={styles.loadingText}>Loading your contacts...</Text>
                    </View>
                ) : !contactSyncEnabled ? (
                    <View style={styles.emptyStateContainer}>
                        <Ionicons name="sync-outline" size={48} color="#666" />
                        <Text style={styles.noContactsText}>Contact sync is disabled</Text>
                        <Text style={styles.syncDescription}>
                            Enable contact sync in Privacy settings to invite your friends
                        </Text>
                        <TouchableOpacity
                            style={styles.enableSyncButton}
                            onPress={handleEnableContactSync}
                        >
                            <Text style={styles.enableSyncButtonText}>Enable Contact Sync</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.privacySettingsButton}
                            onPress={() => router.push('/Screens/SettingsScreen/Privacy')}
                        >
                            <Text style={styles.privacySettingsButtonText}>Go to Privacy Settings</Text>
                        </TouchableOpacity>
                    </View>
                ) : contacts.length === 0 ? (
                    <View style={styles.emptyStateContainer}>
                        <Ionicons name="people-outline" size={48} color="#666" />
                        <Text style={styles.noContactsText}>No contacts found or permission denied</Text>
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={loadContacts}
                        >
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <View style={styles.headerSection}>
                            <Text style={styles.sectionTitle}>Invite friends to nocap</Text>
                            <Text style={styles.sectionSubtitle}>
                                Help your friends join you on nocap to share your daily moments over a prompt and have peek into your friends life
                            </Text>
                        </View>
                        <FlatList
                            data={contacts}
                            renderItem={renderContact}
                            keyExtractor={(item) => item.id || item.contactId || Math.random().toString()}
                            style={styles.contactsList}
                            initialNumToRender={20}
                            maxToRenderPerBatch={20}
                            windowSize={10}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.listContentContainer}
                        />
                    </>
                )}
            </View>
        </View>
    );
};

export default ContactInvites;