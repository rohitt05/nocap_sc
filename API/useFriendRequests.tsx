import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Adjust path as needed

export type FriendRequest = {
    id: string;
    user_id: string;
    created_at: string;
    status: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
};

export const useFriendRequests = () => {
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch pending friend requests for the current user
    const fetchFriendRequests = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get current user
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            if (!user) throw new Error('No user logged in');

            // Get pending friend requests where the current user is the friend_id
            const { data, error: requestError } = await supabase
                .from('friendships')
                .select(`
                    id,
                    user_id,
                    status,
                    created_at,
                    users:user_id (
                        username,
                        full_name,
                        avatar_url
                    )
                `)
                .eq('friend_id', user.id)
                .eq('status', 'pending');

            if (requestError) throw requestError;

            // Format the data for easier consumption
            const formattedRequests = data?.map(item => ({
                id: item.id,
                user_id: item.user_id,
                created_at: item.created_at,
                status: item.status,
                username: item.users.username,
                full_name: item.users.full_name,
                avatar_url: item.users.avatar_url
            })) || [];

            setFriendRequests(formattedRequests);
        } catch (err) {
            console.error('Error fetching friend requests:', err);
            setError(err instanceof Error ? err.message : 'Failed to load friend requests');
        } finally {
            setLoading(false);
        }
    };

    // Handle accepting a friend request
    const acceptFriendRequest = async (requestId: string) => {
        try {
            // Update the friendship status to 'accepted'
            const { error: updateError } = await supabase
                .from('friendships')
                .update({
                    status: 'accepted',
                    updated_at: new Date().toISOString()
                })
                .eq('id', requestId);

            if (updateError) throw updateError;

            // Update local state
            setFriendRequests(friendRequests.filter(request => request.id !== requestId));

            return true;
        } catch (err) {
            console.error('Error accepting friend request:', err);
            setError(err instanceof Error ? err.message : 'Failed to accept request');
            return false;
        }
    };

    // Handle declining a friend request
    const declineFriendRequest = async (requestId: string) => {
        try {
            // Update the friendship status to 'rejected'
            const { error: updateError } = await supabase
                .from('friendships')
                .update({
                    status: 'rejected',
                    updated_at: new Date().toISOString()
                })
                .eq('id', requestId);

            if (updateError) throw updateError;

            // Update local state
            setFriendRequests(friendRequests.filter(request => request.id !== requestId));

            return true;
        } catch (err) {
            console.error('Error declining friend request:', err);
            setError(err instanceof Error ? err.message : 'Failed to decline request');
            return false;
        }
    };

    // Load friend requests on component mount
    useEffect(() => {
        fetchFriendRequests();
    }, []);

    return {
        friendRequests,
        loading,
        error,
        refreshFriendRequests: fetchFriendRequests,
        acceptFriendRequest,
        declineFriendRequest
    };
};