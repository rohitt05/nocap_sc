import { View, Text, TouchableOpacity, StatusBar, SafeAreaView, ScrollView, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons, MaterialIcons, Feather, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import userData from '../../../../assets/userProfile/userData.json';
import { Link, useRouter } from 'expo-router';
import { handleShareNoCap } from '../../../utils/ShareUtils';
import timeZoneState from '../../../utils/TimeUntils'; // Adjust path as needed
import { styles } from './styles';
import { supabase } from '../../../../lib/supabase'; // Adjust path as needed

const SettingsScreen = () => {
    // Use the shared state
    const [currentTimeZone] = timeZoneState.useTimeZone();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Sign out function
    const handleSignOut = async () => {
        try {
            setLoading(true);

            // Show confirmation dialog
            Alert.alert(
                "Log Out",
                "Are you sure you want to log out?",
                [
                    {
                        text: "Cancel",
                        style: "cancel",
                        onPress: () => setLoading(false)
                    },
                    {
                        text: "Log Out",
                        style: "destructive",
                        onPress: async () => {
                            // Sign out from Supabase
                            const { error } = await supabase.auth.signOut();

                            if (error) {
                                console.error("Error signing out:", error);
                                Alert.alert("Error", "Failed to sign out. Please try again.");
                            } else {
                                // Navigate to login screen
                                router.replace('/auth/login');
                            }
                            setLoading(false);
                        }
                    }
                ]
            );
        } catch (error) {
            console.error("Sign out error:", error);
            Alert.alert("Error", "Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <ScrollView style={styles.scrollView}>
                {/* Profile Section */}
                <TouchableOpacity style={styles.profileCard}>
                    <View style={styles.profileIconContainer}>
                        <Text style={styles.profileIconText}>
                            {userData.name ? userData.name.charAt(0).toUpperCase() : 'M'}
                        </Text>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{userData.name || 'Rohit'}</Text>
                        <Text style={styles.profileUsername}>{userData.username || 'mainninjahathori'}</Text>
                    </View>
                </TouchableOpacity>

                {/* Features Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>FEATURES</Text>

                    <View style={styles.menuContainer}>
                        <Link href='(tabs)/archives' asChild>
                            <TouchableOpacity style={styles.menuItem}>
                                <MaterialIcons name="event" size={24} color="white" style={styles.menuIcon} />
                                <Text style={styles.menuText}>Memories</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>

                {/* Settings Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>SETTINGS</Text>

                    <View style={styles.menuContainer}>
                        <Link href='/Screens/SettingsScreen/Notifications' asChild>
                            <TouchableOpacity style={styles.menuItem}>
                                <Ionicons name="notifications" size={24} color="white" style={styles.menuIcon} />
                                <Text style={styles.menuText}>Notifications</Text>
                            </TouchableOpacity>
                        </Link>
                        <Link href='/Screens/SettingsScreen/Privacy' asChild>
                            <TouchableOpacity style={styles.menuItem}>
                                <MaterialIcons name="privacy-tip" size={24} color="white" style={styles.menuIcon} />
                                <Text style={styles.menuText}>Privacy</Text>
                            </TouchableOpacity>
                        </Link>
                        <Link href='/Screens/SettingsScreen/TimeZone' asChild>
                            <TouchableOpacity style={styles.menuItem}>
                                <Ionicons name="time" size={24} color="white" style={styles.menuIcon} />
                                <Text style={styles.menuText}>Time Zone</Text>
                                <View style={styles.rightContainer}>
                                    <Text style={styles.rightText}>{currentTimeZone}</Text>
                                    <Feather name="globe" size={24} color="white" style={styles.rightIcon} />
                                </View>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>

                {/* About Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ABOUT</Text>

                    <View style={styles.menuContainer}>
                        {/* Using imported share function */}
                        <TouchableOpacity style={styles.menuItem} onPress={handleShareNoCap}>
                            <Feather name="share-2" size={24} color="white" style={styles.menuIcon} />
                            <Text style={styles.menuText}>Share NoCap.</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem}>
                            <FontAwesome name="star" size={24} color="white" style={styles.menuIcon} />
                            <Text style={styles.menuText}>Rate NoCap.</Text>
                        </TouchableOpacity>
                        <Link href='/Screens/SettingsScreen/Help' asChild>
                            <TouchableOpacity style={styles.menuItem}>
                                <MaterialCommunityIcons name="help-circle" size={24} color="white" style={styles.menuIcon} />
                                <Text style={styles.menuText}>Help</Text>
                            </TouchableOpacity>
                        </Link>
                        <Link href='/Screens/SettingsScreen/About' asChild>
                            <TouchableOpacity style={styles.menuItem}>
                                <Ionicons name="information-circle" size={24} color="white" style={styles.menuIcon} />
                                <Text style={styles.menuText}>About</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    style={[styles.logoutButton, loading && styles.logoutButtonDisabled]}
                    onPress={handleSignOut}
                    disabled={loading}
                >
                    <Text style={styles.logoutText}>
                        {loading ? 'Logging out...' : 'Log out'}
                    </Text>
                </TouchableOpacity>

                {/* Version */}
                <Text style={styles.versionText}>Version 0.0.1 (000)</Text>

                {/* Bottom Spacer */}
                <View style={styles.bottomSpacer} />
            </ScrollView>
        </SafeAreaView>
    );
};

export default SettingsScreen;