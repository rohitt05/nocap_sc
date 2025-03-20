// app/users.tsx
import { View, Text, Image, StatusBar, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useLocalSearchParams, router } from 'expo-router';
import YourResponses from '../Profile/YourResponses'; // Adjust path as needed
import { styles } from '../Profile/styles'; // Adjust path as needed
import { fetchUserById, isCurrentUser, UserData } from '../../../../API/fetchusers';
import { useFetchFriends } from '../../../../API/fetchFriends'; // Adjust path as needed
import { useFriendRequests } from '../../../../API/useFriendRequests'; // Import the hook
import { supabase } from '../../../../lib/supabase'; // Import supabase client

export default function UserProfile() {
    const { id } = useLocalSearchParams();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const [isFriend, setIsFriend] = useState(false);
    const [requestPending, setRequestPending] = useState(false);
    const [receivedRequest, setReceivedRequest] = useState<string | null>(null);
    const { friends, loading: friendsLoading } = useFetchFriends();
    const { friendRequests, refreshFriendRequests } = useFriendRequests();

    useEffect(() => {
        // Make sure we have an ID to work with
        if (!id || typeof id !== 'string') {
            console.error("No valid user ID provided");
            router.back();
            return;
        }

        const loadUserData = async () => {
            setLoading(true);

            // Check if this is the current user's profile
            const currentUserCheck = await isCurrentUser(id as string);
            setIsOwner(currentUserCheck);

            // Fetch the user data
            const user = await fetchUserById(id as string);
            setUserData(user);

            // Check if there's a pending friend request
            await checkPendingRequest(id as string);

            setLoading(false);
        };

        loadUserData();
    }, [id]);

    // Check if this user is in the friends list
    useEffect(() => {
        if (userData && friends.length > 0) {
            const friendCheck = friends.some(friend => friend.id === userData.id);
            setIsFriend(friendCheck);
        }
    }, [userData, friends]);

    // Function to check if a friend request is pending or received
    const checkPendingRequest = async (userId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Check if there's a pending request FROM current user TO this profile
            const { data: sentData, error: sentError } = await supabase
                .from('friendships')
                .select('id, status')
                .eq('user_id', user.id)
                .eq('friend_id', userId)
                .eq('status', 'pending');

            if (sentError) {
                console.error("Error checking sent friend request:", sentError);
                return;
            }

            // Check if there's a pending request FROM this profile TO current user
            const { data: receivedData, error: receivedError } = await supabase
                .from('friendships')
                .select('id, status')
                .eq('user_id', userId)
                .eq('friend_id', user.id)
                .eq('status', 'pending');

            if (receivedError) {
                console.error("Error checking received friend request:", receivedError);
                return;
            }

            // If data is an array with at least one item, there's a pending request
            setRequestPending(sentData && sentData.length > 0);

            // If we've received a request, store the request ID
            if (receivedData && receivedData.length > 0) {
                setReceivedRequest(receivedData[0].id);
            } else {
                setReceivedRequest(null);
            }
        } catch (err) {
            console.error("Error checking pending request:", err);
        }
    };

    // Function to send friend request
    const sendFriendRequest = async () => {
        if (!userData || !id) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.error("No authenticated user found");
                return;
            }

            // Insert friend request into friendships table
            const { error } = await supabase
                .from('friendships')
                .insert({
                    user_id: user.id,
                    friend_id: id as string,
                    status: 'pending',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

            // Update UI to show pending state
            setRequestPending(true);
        } catch (err) {
            console.error("Error sending friend request:", err);
            // Could add a toast notification here
        }
    };

    // Function to accept a friend request
    const acceptFriendRequest = async () => {
        if (!receivedRequest) return;

        try {
            // Update the friendship status to 'accepted'
            const { error } = await supabase
                .from('friendships')
                .update({
                    status: 'accepted',
                    updated_at: new Date().toISOString()
                })
                .eq('id', receivedRequest);

            if (error) throw error;

            // Update the UI state
            setReceivedRequest(null);
            setIsFriend(true);

            // Refresh friends list (optional)
            // You could add a function to refresh the friends list here
        } catch (err) {
            console.error("Error accepting friend request:", err);
        }
    };

    // Show loading indicator while data is being fetched
    if (loading || friendsLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#ffffff" />
            </View>
        );
    }

    // Handle case where user data couldn't be loaded
    if (!userData) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: 'white' }}>User not found</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: '#3498db' }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Navbar */}
            <View style={styles.navbar}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>

                <Text style={styles.navbarTitle}>{userData.username}</Text>

                {isOwner ? (
                    <Link href="/settings" style={{ zIndex: 10 }}>
                        <TouchableOpacity style={styles.menuButton}>
                            <View style={styles.menuButtonContainer}>
                                <Ionicons name="ellipsis-vertical" size={24} color="white" />
                            </View>
                        </TouchableOpacity>
                    </Link>
                ) : (
                    // Empty view to maintain layout
                    <View style={{ width: 24 }} />
                )}
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

                            {isOwner && (
                                <Link href="/edit-profile" asChild>
                                    <TouchableOpacity style={styles.editButton}>
                                        <View style={styles.editButtonContainer}>
                                            <Feather name="edit-3" size={24} color="white" />
                                        </View>
                                    </TouchableOpacity>
                                </Link>
                            )}
                        </View>
                    </LinearGradient>
                </View>

                {/* Message Button - only display if not the profile owner AND is a friend */}
                {!isOwner && isFriend && (
                    <TouchableOpacity
                        style={{
                            backgroundColor: '#fff',
                            padding: 15,
                            borderRadius: 20,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginVertical: 20,
                            marginHorizontal: 16,
                            width: '90%',
                            alignSelf: 'center',
                        }}
                        onPress={() => {
                            router.push(`/messages/${userData.id}`);
                        }}
                    >
                        <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 16 }}>
                            Message
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Add/Accept Friend or Pending Button - only display if not the profile owner AND not a friend */}
                {!isOwner && !isFriend && (
                    <TouchableOpacity
                        style={{
                            backgroundColor: receivedRequest ? '#fff' : (requestPending ? '#cccccc' : '#fff'),
                            padding: 15,
                            borderRadius: 20,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginVertical: 20,
                            marginHorizontal: 16,
                            width: '90%',
                            alignSelf: 'center',
                            flexDirection: 'row',
                        }}
                        onPress={
                            receivedRequest
                                ? acceptFriendRequest
                                : (requestPending ? undefined : sendFriendRequest)
                        }
                        disabled={requestPending && !receivedRequest}
                    >
                        <Text style={{
                            color: receivedRequest ? 'black' : (requestPending ? '#666666' : 'black'),
                            fontWeight: 'bold',
                            fontSize: 16
                        }}>
                            {receivedRequest
                                ? 'Accept Request'
                                : (requestPending ? 'Pending' : 'Add Friend')
                            }
                        </Text>

                        {receivedRequest && (
                            <Ionicons
                                name="checkmark-circle-outline"
                                size={20}
                                color="white"
                                style={{ marginLeft: 10 }}
                            />
                        )}

                        {!requestPending && !receivedRequest && (
                            <Ionicons
                                name="person-add-outline"
                                size={20}
                                color="black"
                                style={{ marginLeft: 10 }}
                            />
                        )}
                    </TouchableOpacity>
                )}

                {/* User's Responses Component - only visible to profile owner or friends */}
                {(isOwner || isFriend) && (
                    <YourResponses userId={userData.id} />
                )}
            </ScrollView>
        </View>
    );
}