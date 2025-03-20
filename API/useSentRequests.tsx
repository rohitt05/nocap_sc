import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Adjust path as needed

export type SentRequest = {
    id: string;
    friend_id: string;
    created_at: string;
    status: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
};

export const useSentRequests = () => {
    const [sentRequests, setSentRequests] = useState<SentRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch pending friend requests sent by the current user
    const fetchSentRequests = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get current user
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            if (!user) throw new Error('No user logged in');

            // Get pending friend requests where the current user is the user_id
            const { data, error: requestError } = await supabase
                .from('friendships')
                .select(`
                    id,
                    friend_id,
                    status,
                    created_at,
                    users:friend_id (
                        username,
                        full_name,
                        avatar_url
                    )
                `)
                .eq('user_id', user.id)
                .eq('status', 'pending');

            if (requestError) throw requestError;

            // Format the data for easier consumption
            const formattedRequests = data?.map(item => ({
                id: item.id,
                friend_id: item.friend_id,
                created_at: item.created_at,
                status: item.status,
                username: item.users.username,
                full_name: item.users.full_name,
                avatar_url: item.users.avatar_url
            })) || [];

            setSentRequests(formattedRequests);
        } catch (err) {
            console.error('Error fetching sent requests:', err);
            setError(err instanceof Error ? err.message : 'Failed to load sent requests');
        } finally {
            setLoading(false);
        }
    };

    // Handle canceling a friend request
    const cancelFriendRequest = async (requestId: string) => {
        try {
            // Delete the friendship record
            const { error: deleteError } = await supabase
                .from('friendships')
                .delete()
                .eq('id', requestId);

            if (deleteError) throw deleteError;

            // Update local state
            setSentRequests(sentRequests.filter(request => request.id !== requestId));

            return true;
        } catch (err) {
            console.error('Error canceling friend request:', err);
            setError(err instanceof Error ? err.message : 'Failed to cancel request');
            return false;
        }
    };

    // Load sent requests on component mount
    useEffect(() => {
        fetchSentRequests();
    }, []);

    return {
        sentRequests,
        loading,
        error,
        refreshSentRequests: fetchSentRequests,
        cancelFriendRequest
    };
};