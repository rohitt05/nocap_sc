import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
    ScrollView,
    StatusBar,
    SafeAreaView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import PhoneNumberInput from './PhoneNumber'; // Import our new component
import DeleteAccount from './DeleteAccount'; // Import the DeleteAccount component
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define types for props
interface PrivacyOptionProps {
    iconName: string;
    title: string;
    description?: string;
    isToggle?: boolean;
    toggleValue?: boolean;
    onToggleChange?: () => void;
    onPress?: () => void;
    href?: string;
    learnMoreLink?: boolean;
}

const CONTACT_SYNC_KEY = 'contactSyncEnabled';
const FIND_BY_PHONE_KEY = 'findByPhoneEnabled';
const PHONE_NUMBER_UPLOADED_KEY = 'phoneNumberUploaded';

const Privacy = () => {
    const [findByPhone, setFindByPhone] = useState(false);
    const [phoneNumberUploaded, setPhoneNumberUploaded] = useState(false);
    // Initialize contact sync to false as requested
    const [contactSync, setContactSync] = useState(false);

    // Load preferences when the component mounts
    useEffect(() => {
        const loadPreferences = async () => {
            try {
                // Load contact sync preference
                const syncValue = await AsyncStorage.getItem(CONTACT_SYNC_KEY);
                if (syncValue !== null) {
                    setContactSync(syncValue === 'true');
                }

                // Load find by phone preference
                const phoneValue = await AsyncStorage.getItem(FIND_BY_PHONE_KEY);
                if (phoneValue !== null) {
                    setFindByPhone(phoneValue === 'true');
                }

                // Check if phone number was ever uploaded
                const phoneUploaded = await AsyncStorage.getItem(PHONE_NUMBER_UPLOADED_KEY);
                if (phoneUploaded === 'true') {
                    setPhoneNumberUploaded(true);
                }
            } catch (error) {
                console.error('Error loading preferences:', error);
            }
        };

        loadPreferences();
    }, []);

    const navigateToBlockedUsers = () => {
        router.push('/Screens/SettingsScreen/BlockedUsers');
    };

    // Handle contact sync toggle with AsyncStorage persistence
    const handleContactSyncToggle = async () => {
        const newValue = !contactSync;
        setContactSync(newValue);

        try {
            await AsyncStorage.setItem(CONTACT_SYNC_KEY, newValue.toString());
        } catch (error) {
            console.error('Error saving contact sync preference:', error);
        }
    };

    // Handle find by phone toggle with special logic
    const handleFindByPhoneToggle = async () => {
        // If phone number was previously uploaded and setting is currently true,
        // allow toggling off
        if (findByPhone) {
            setFindByPhone(false);
            await AsyncStorage.setItem(FIND_BY_PHONE_KEY, 'false');
            return;
        }

        // Otherwise toggle it on
        setFindByPhone(true);
        await AsyncStorage.setItem(FIND_BY_PHONE_KEY, 'true');
    };

    // This function will be called when a phone number is successfully uploaded
    const onPhoneNumberUploaded = async () => {
        // Mark that a phone number has been uploaded
        setPhoneNumberUploaded(true);
        await AsyncStorage.setItem(PHONE_NUMBER_UPLOADED_KEY, 'true');
    };

    // Option item component
    const PrivacyOption = ({
        iconName,
        title,
        description,
        isToggle = false,
        toggleValue,
        onToggleChange,
        onPress,
        href,
        learnMoreLink
    }: PrivacyOptionProps) => {
        const content = (
            <View style={styles.optionContent}>
                <View style={styles.iconContainer}>
                    <MaterialIcons name={iconName as any} size={24} color="#fff" />
                </View>
                <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>{title}</Text>
                    {description && (
                        <Text style={styles.optionDescription}>
                            {description}
                            {learnMoreLink && (
                                <Text style={styles.learnMore}> Learn more here.</Text>
                            )}
                        </Text>
                    )}
                </View>
                {isToggle && toggleValue !== undefined && onToggleChange && (
                    <Switch
                        trackColor={{ false: '#3e3e3e', true: '#2196F3' }}
                        thumbColor={toggleValue ? '#fff' : '#f4f3f4'}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={onToggleChange}
                        value={toggleValue}
                    />
                )}
            </View>
        );

        if (href) {
            return (
                <Link href={href} asChild>
                    <TouchableOpacity style={styles.optionContainer} activeOpacity={0.7}>
                        {content}
                    </TouchableOpacity>
                </Link>
            );
        }

        return (
            <TouchableOpacity
                style={styles.optionContainer}
                onPress={onPress}
                activeOpacity={onPress ? 0.7 : 1}
            >
                {content}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />

            {/* Header */}
            <View style={styles.header}>
                <Link href=".." asChild>
                    <TouchableOpacity style={styles.backButton}>
                        <MaterialIcons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                </Link>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Privacy</Text>
                </View>
                <View style={styles.placeholderRight} />
            </View>

            <ScrollView style={styles.content}>
                {/* Blocked Users */}
                <PrivacyOption
                    iconName="block"
                    title="Blocked Users"
                    onPress={navigateToBlockedUsers}
                />

                {/* Find me by my phone number */}
                <PrivacyOption
                    iconName="phone"
                    title="Find me by my phone number"
                    description="Letting others find you by your phone number allows friends to find you using your phone number."
                    learnMoreLink
                    isToggle
                    toggleValue={findByPhone}
                    onToggleChange={handleFindByPhoneToggle}
                />

                {/* Conditionally render the PhoneNumberInput component */}
                {findByPhone && <PhoneNumberInput onPhoneNumberUploaded={onPhoneNumberUploaded} />}

                {/* Contact sync */}
                <PrivacyOption
                    iconName="sync"
                    title="Contact sync"
                    description="Contact syncing gives you friends suggestions from your phone's contacts."
                    learnMoreLink
                    isToggle
                    toggleValue={contactSync}
                    onToggleChange={handleContactSyncToggle}
                />

                {/* Delete Account */}
                <DeleteAccount />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
    },
    backButton: {
        padding: 4,
        width: 32,
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 19,
        fontWeight: 'bold',
        color: '#fff',
    },
    placeholderRight: {
        width: 32,
    },
    content: {
        flex: 1,
    },
    sectionContainer: {
        backgroundColor: '#1a1a1a',
        marginHorizontal: 16,
        marginVertical: 16,
        borderRadius: 12,
        overflow: 'hidden',
        padding: 16,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    optionContainer: {
        backgroundColor: '#1a1a1a',
        marginHorizontal: 16,
        marginVertical: 7,
        borderRadius: 12,
        overflow: 'hidden',
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
    },
    iconContainer: {
        width: 40,
        alignItems: 'center',
    },
    optionTextContainer: {
        flex: 1,
        marginLeft: 8,
    },
    optionTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    optionDescription: {
        color: '#aaa',
        fontSize: 14,
        marginTop: 4,
    },
    learnMore: {
        color: '#2196F3',
        textDecorationLine: 'underline',
    },
});

export default Privacy;