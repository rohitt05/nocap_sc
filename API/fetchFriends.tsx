import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Adjust the path based on your project structure

// Define the friend type
export type Friend = {
    id: string;
    username: string;
    avatar_url: string | null;
    full_name: string;
};

export const useFetchFriends = () => {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFriends = async () => {
        try {
            setLoading(true);

            // Get the current user's ID
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError) {
                throw userError;
            }

            if (!user) {
                throw new Error('No user logged in');
            }

            // Fetch all accepted friendships where the current user is either user_id or friend_id
            const { data: friendships, error: friendshipsError } = await supabase
                .from('friendships')
                .select(`
          id,
          user_id,
          friend_id
        `)
                .eq('status', 'accepted')
                .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

            if (friendshipsError) {
                throw friendshipsError;
            }

            if (!friendships || friendships.length === 0) {
                setFriends([]);
                setLoading(false);
                return;
            }

            // Extract the IDs of friends (the other user in each friendship)
            const friendIds = friendships.map(friendship =>
                friendship.user_id === user.id ? friendship.friend_id : friendship.user_id
            );

            // Fetch the user details for all friends
            const { data: friendDetails, error: friendDetailsError } = await supabase
                .from('users')
                .select('id, username, avatar_url, full_name')
                .in('id', friendIds);

            if (friendDetailsError) {
                throw friendDetailsError;
            }

            // Map the friend details to our Friend type
            const mappedFriends: Friend[] = friendDetails.map(friend => ({
                id: friend.id,
                username: friend.username,
                avatar_url: friend.avatar_url,
                full_name: friend.full_name
            }));

            setFriends(mappedFriends);
        } catch (err) {
            console.error('Error fetching friends:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFriends();
    }, []);

    // Function to refresh friends list
    const refreshFriends = () => {
        fetchFriends();
    };

    // Function to remove a friend
    const removeFriend = async (friendId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('No user logged in');
            }

            // Delete the friendship in both directions
            await supabase
                .from('friendships')
                .delete()
                .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`);

            // Refresh the friends list
            refreshFriends();
        } catch (err) {
            console.error('Error removing friend:', err);
            setError(err instanceof Error ? err.message : 'Failed to remove friend');
        }
    };

    return { friends, loading, error, refreshFriends, removeFriend };
};