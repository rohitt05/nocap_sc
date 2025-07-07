import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';

interface User {
    id: string;
    full_name: string;
    username: string;
    email: string;
    avatar_url: string | null;
    bio: string | null;
    created_at: string;
}

interface FriendshipStatus {
    [userId: string]: 'pending' | 'accepted' | 'rejected' | null;
}

export const useFetchAllUsers = () => {
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus>({});

    // Fetch all users from the system
    const fetchAllUsers = async (): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, full_name, username, email, avatar_url, bio, created_at')
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            setAllUsers(data || []);

            // Also fetch friendship statuses for these users
            await fetchFriendshipStatuses(data || []);
        } catch (error: any) {
            console.error('Error fetching all users:', error);
            setError(error.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    // Fetch friendship statuses for the users
    const fetchFriendshipStatuses = async (users: User[]): Promise<void> => {
        try {
            const { data: currentUser } = await supabase.auth.getUser();
            if (!currentUser.user) return;

            const userIds = users.map(user => user.id);

            const { data: friendships, error } = await supabase
                .from('friendships')
                .select('friend_id, status')
                .eq('user_id', currentUser.user.id)
                .in('friend_id', userIds);

            if (error) {
                console.error('Error fetching friendship statuses:', error);
                return;
            }

            const statusMap: FriendshipStatus = {};
            friendships?.forEach(friendship => {
                statusMap[friendship.friend_id] = friendship.status as 'pending' | 'accepted' | 'rejected';
            });

            setFriendshipStatus(statusMap);
        } catch (error: any) {
            console.error('Error fetching friendship statuses:', error);
        }
    };

    // Send friend request to a user
    const sendFriendRequestToUser = async (userId: string): Promise<void> => {
        try {
            const { data: currentUser } = await supabase.auth.getUser();
            if (!currentUser.user) {
                throw new Error('User not authenticated');
            }

            // Check if friendship already exists
            const { data: existingFriendship, error: checkError } = await supabase
                .from('friendships')
                .select('id, status')
                .eq('user_id', currentUser.user.id)
                .eq('friend_id', userId)
                .single();

            if (checkError && checkError.code !== 'PGRST116') {
                throw checkError;
            }

            if (existingFriendship) {
                Alert.alert(
                    "Request Already Sent",
                    "You have already sent a friend request to this user.",
                    [{ text: "OK", style: "default" }]
                );
                return;
            }

            // Send the friend request
            const { error: insertError } = await supabase
                .from('friendships')
                .insert([
                    {
                        user_id: currentUser.user.id,
                        friend_id: userId,
                        status: 'pending'
                    }
                ]);

            if (insertError) {
                throw insertError;
            }

            // Update local friendship status
            setFriendshipStatus(prev => ({
                ...prev,
                [userId]: 'pending'
            }));

            // Show success message
            Alert.alert(
                "Friend Request Sent",
                "Your friend request has been sent successfully!",
                [{ text: "OK", style: "default" }]
            );

        } catch (error: any) {
            console.error('Error sending friend request:', error);
            Alert.alert(
                "Error",
                "Failed to send friend request. Please try again.",
                [{ text: "OK", style: "default" }]
            );
        }
    };

    // Check if user is already a friend
    const isFriend = (userId: string): boolean => {
        return friendshipStatus[userId] === 'accepted';
    };

    // Check if friend request is pending
    const isPending = (userId: string): boolean => {
        return friendshipStatus[userId] === 'pending';
    };

    // Get current user ID
    const getCurrentUserId = async (): Promise<string | null> => {
        const { data: currentUser } = await supabase.auth.getUser();
        return currentUser.user?.id || null;
    };

    // Refresh all users
    const refreshAllUsers = async (): Promise<void> => {
        await fetchAllUsers();
    };

    // Fetch users on component mount
    useEffect(() => {
        fetchAllUsers();
    }, []);

    return {
        allUsers,
        loading,
        error,
        friendshipStatus,
        refreshAllUsers,
        sendFriendRequestToUser,
        isFriend,
        isPending,
        getCurrentUserId,
    };
};