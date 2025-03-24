import { useState, useEffect } from 'react';
import { supabase } from '../../../../../lib/supabase';

export function useFriendshipStatus(userId: string | null, friends: any[]) {
    const [isFriend, setIsFriend] = useState(false);
    const [requestPending, setRequestPending] = useState(false);
    const [receivedRequest, setReceivedRequest] = useState<string | null>(null);

    // Check if this user is in the friends list
    useEffect(() => {
        if (userId && friends.length > 0) {
            const friendCheck = friends.some(friend => friend.id === userId);
            setIsFriend(friendCheck);
        }
    }, [userId, friends]);

    // Check if a friend request is pending or received
    useEffect(() => {
        if (userId) {
            checkPendingRequest(userId);
        }
    }, [userId]);

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
        if (!userId) return;

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
                    friend_id: userId,
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

    return {
        isFriend,
        requestPending,
        receivedRequest,
        sendFriendRequest,
        acceptFriendRequest,
        checkPendingRequest
    };
}