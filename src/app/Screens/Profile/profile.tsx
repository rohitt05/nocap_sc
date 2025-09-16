// Profile.tsx - COMPLETE WITH PULL-TO-REFRESH FUNCTIONALITY
import { View, Text, Image, StatusBar, TouchableOpacity, ScrollView, Alert, Animated, Platform, RefreshControl } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EditProfileModal } from './EditProfileModal';
import { Link, useNavigation } from 'expo-router';
import YourResponses from './YourResponses';
import ProfileActivityMap from './ProfileActivityMap';
import { styles } from './styles';
import { supabase } from '../../../../lib/supabase';

interface UserData {
    id: string;
    username: string;
    full_name: string;
    bio: string;
    avatar_url: string;
    email: string;
}

const Profile: React.FC = () => {
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [userData, setUserData] = useState<UserData>({
        id: '',
        username: '',
        full_name: '',
        bio: '',
        avatar_url: '',
        email: ''
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [scrollEnabled, setScrollEnabled] = useState<boolean>(true);
    const [isMapInteracting, setIsMapInteracting] = useState<boolean>(false);

    // ✅ PULL-TO-REFRESH: Add refreshing state
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [refreshTrigger, setRefreshTrigger] = useState<number>(0); // Trigger for child components

    const scrollViewRef = useRef<ScrollView>(null);
    const mapTouchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Add animated scroll tracking
    const scrollY = useRef(new Animated.Value(0)).current;

    // Get safe area insets for precise control
    const insets = useSafeAreaInsets();

    const navigation = useNavigation();

    // Create animated background color
    const animatedBackgroundColor = scrollY.interpolate({
        inputRange: [0, 400, 500],
        outputRange: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.95)'],
        extrapolate: 'clamp',
    });

    // Optional: Animate navbar title opacity
    const navbarTitleOpacity = scrollY.interpolate({
        inputRange: [0, 450, 500],
        outputRange: [0.8, 0.9, 1],
        extrapolate: 'clamp',
    });

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async (): Promise<void> => {
        try {
            setLoading(true);
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !session) {
                console.error("Error fetching session:", sessionError);
                Alert.alert("Error", "Unable to fetch your profile. Please try logging in again.");
                return;
            }

            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (error) {
                console.error("Error fetching user data:", error);
                Alert.alert("Error", "Unable to fetch your profile data.");
            } else if (data) {
                setUserData({
                    id: data.id,
                    username: data.username || '',
                    full_name: data.full_name || '',
                    bio: data.bio || '',
                    avatar_url: data.avatar_url || 'https://via.placeholder.com/150',
                    email: data.email || ''
                });
            }
        } catch (error) {
            console.error("Unexpected error:", error);
            Alert.alert("Error", "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    // ✅ PULL-TO-REFRESH: Main refresh function
    const onRefresh = async (): Promise<void> => {
        console.log('🔄 Pull-to-refresh triggered');
        setRefreshing(true);

        try {
            // 1. Refresh user profile data
            await fetchUserProfile();

            // 2. Trigger refresh for child components
            setRefreshTrigger(prev => prev + 1);

            console.log('✅ All components refreshed successfully');
        } catch (error) {
            console.error('❌ Error during refresh:', error);
            Alert.alert("Refresh Error", "Some content couldn't be refreshed. Please try again.");
        } finally {
            // Add slight delay for better UX
            setTimeout(() => {
                setRefreshing(false);
            }, 500);
        }
    };

    const handleEditPress = (): void => {
        setModalVisible(true);
    };

    const handleCloseModal = (): void => {
        setModalVisible(false);
    };

    const handleBackButton = (): void => {
        navigation.goBack();
    };

    // Enhanced map interaction handlers with better timing
    const handleMapTouchStart = (): void => {
        console.log('🗺️ Map touch started');
        setIsMapInteracting(true);
        if (mapTouchTimeoutRef.current) {
            clearTimeout(mapTouchTimeoutRef.current);
        }
        mapTouchTimeoutRef.current = setTimeout(() => {
            if (isMapInteracting) {
                setScrollEnabled(false);
                console.log('🗺️ ScrollView disabled after delay');
            }
        }, 100);
    };

    const handleMapTouchEnd = (): void => {
        console.log('🗺️ Map touch ended');
        setIsMapInteracting(false);
        if (mapTouchTimeoutRef.current) {
            clearTimeout(mapTouchTimeoutRef.current);
        }
        setScrollEnabled(true);
        console.log('🗺️ ScrollView re-enabled');
    };

    const handleMapAreaTouch = (event: any): boolean => {
        const { locationY } = event.nativeEvent;
        if (Math.abs(locationY) > 20) {
            setScrollEnabled(true);
            return false;
        }
        return true;
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent={true} backgroundColor="transparent" />

            {/* Loading indicator */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading profile...</Text>
                </View>
            ) : (
                <>
                    {/* ✅ PULL-TO-REFRESH: ScrollView with RefreshControl */}
                    <Animated.ScrollView
                        ref={scrollViewRef}
                        style={styles.scrollContainerFixed}
                        showsVerticalScrollIndicator={false}
                        scrollEnabled={scrollEnabled}
                        nestedScrollEnabled={false}
                        scrollEventThrottle={16}
                        decelerationRate="normal"
                        keyboardShouldPersistTaps="handled"
                        contentInsetAdjustmentBehavior="automatic"
                        bounces={true}
                        alwaysBounceVertical={true}
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                            {
                                useNativeDriver: false,
                            }
                        )}
                        // ✅ PULL-TO-REFRESH: Add RefreshControl
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor="#ffffff" // iOS: White spinner
                                colors={['#ffffff']} // Android: White spinner
                                progressBackgroundColor="rgba(0,0,0,0.1)" // Android: Subtle background
                                title="Pull to refresh" // iOS: Title text
                                titleColor="#ffffff" // iOS: Title color
                            />
                        }
                    >
                        {/* Profile Image Container with Quality Preservation */}
                        <View style={styles.profileImageContainerFixed}>
                            <Image
                                source={{
                                    uri: userData.avatar_url,
                                    cache: 'force-cache',
                                }}
                                style={styles.profileImageHD}
                                resizeMode="cover"
                                resizeMethod="scale"
                                fadeDuration={300}
                            />
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

                        {/* ✅ PULL-TO-REFRESH: Your Responses Component with refresh trigger */}
                        <YourResponses
                            userId={userData.id}
                            refreshTrigger={refreshTrigger} // Pass refresh trigger
                        />

                        {/* Map Section */}
                        <View style={styles.mapSection}>
                            <View style={styles.scrollHelperTop} />
                            <View
                                style={styles.mapWrapper}
                                onStartShouldSetResponder={handleMapAreaTouch}
                                onMoveShouldSetResponder={() => !scrollEnabled}
                                onTouchStart={handleMapTouchStart}
                                onTouchEnd={handleMapTouchEnd}
                                onTouchCancel={handleMapTouchEnd}
                            >
                                {/* ✅ PULL-TO-REFRESH: ProfileActivityMap with refresh trigger */}
                                <ProfileActivityMap
                                    userId={userData.id}
                                    isOwnProfile={true}
                                    isVisible={true}
                                    refreshTrigger={refreshTrigger} // Pass refresh trigger
                                />
                            </View>
                            <View style={styles.scrollHelperBottom} />
                        </View>
                    </Animated.ScrollView>

                    {/* FIXED: Navbar with precise safe area control - no unnecessary spacing */}
                    <Animated.View style={[
                        styles.navbarPrecise,
                        {
                            backgroundColor: animatedBackgroundColor,
                            paddingTop: insets.top,
                            height: 60 + insets.top,
                        }
                    ]}>
                        <View style={styles.navbarContent}>
                            <TouchableOpacity style={styles.backButton} onPress={handleBackButton}>
                                <Ionicons name="arrow-back" size={24} color="white" />
                            </TouchableOpacity>
                            <Animated.Text style={[styles.navbarTitle, { opacity: navbarTitleOpacity }]}>
                                {userData.username}
                            </Animated.Text>
                            <Link href="Screens/SettingsScreen/SettingsScreen" style={{ zIndex: 10 }}>
                                <TouchableOpacity style={styles.menuButton}>
                                    <View style={styles.menuButtonContainer}>
                                        <Ionicons name="menu" size={24} color="white" />
                                    </View>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </Animated.View>
                </>
            )}

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
