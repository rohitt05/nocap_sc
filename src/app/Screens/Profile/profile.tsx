import { View, Text, Image, StatusBar, TouchableOpacity, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { EditProfileModal } from './EditProfileModal';
import { Link } from 'expo-router';
import YourResponses from './YourResponses';
import { styles } from './styles';
import { supabase } from '../../../../lib/supabase'; // Adjust this import path as needed

const Profile = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [userData, setUserData] = useState({
        username: '',
        full_name: '',
        bio: '',
        avatar_url: '',
        email: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);

            // First get the current user's session
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !session) {
                console.error("Error fetching session:", sessionError);
                return;
            }

            // Now fetch the user profile data
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (error) {
                console.error("Error fetching user data:", error);
            } else if (data) {
                setUserData({
                    username: data.username,
                    full_name: data.full_name,
                    bio: data.bio || '',
                    avatar_url: data.avatar_url || 'https://via.placeholder.com/150',
                    email: data.email
                });
            }
        } catch (error) {
            console.error("Unexpected error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditPress = () => {
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        // Refresh user data after edit
        fetchUserProfile();
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Navbar */}
            <View style={styles.navbar}>
                <TouchableOpacity style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>

                <Text style={styles.navbarTitle}>{userData.username}</Text>
                <Link href="Screens/SettingsScreen/SettingsScreen" style={{ zIndex: 10 }}>
                    <TouchableOpacity style={styles.menuButton}>
                        <View style={styles.menuButtonContainer}>
                            <Ionicons name="ellipsis-vertical" size={24} color="white" />
                        </View>
                    </TouchableOpacity>
                </Link>
            </View>

            {/* ScrollView for main content */}
            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Image Container */}
                <View style={styles.profileImageContainer}>
                    <Image
                        source={{ uri: userData.avatar_url }}
                        style={styles.profileImage}
                        resizeMode="cover"
                    />

                    {/* Username container with gradient overlay at the bottom */}
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.9)']}
                        style={styles.usernameContainer}>
                        <View style={styles.userInfoContainer}>
                            <View style={styles.userTextContainer}>
                                <Text style={styles.username}>{userData.full_name}</Text>
                                <Text style={styles.userBio}>{userData.bio}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={handleEditPress}
                            >
                                <View style={styles.editButtonContainer}>
                                    <Feather name="edit-3" size={24} color="white" />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </View>

                {/* Your Responses Component */}
                <YourResponses userId={userData.id} />
            </ScrollView>

            {/* Edit Profile Modal */}
            <EditProfileModal
                visible={modalVisible}
                onClose={handleCloseModal}
                userData={userData}
                refreshUserData={fetchUserProfile}
            />
        </View>
    );
};

export default Profile;