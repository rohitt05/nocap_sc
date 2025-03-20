import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Adjust path based on project structure

// Define the user type
export type User = {
    id: string;
    username: string;
    avatar_url: string | null;
    full_name: string;
};

export const useSearchUsers = () => {
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [friendStatus, setFriendStatus] = useState<Record<string, string>>({});

    // Search users by username or full_name
    const searchUsers = async (query: string) => {
        if (!query || query.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            setLoading(true);

            // Get current user
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            if (!user) throw new Error('No user logged in');

            // Search for users where username or full_name contains the query
            const { data: users, error: searchError } = await supabase
                .from('users')
                .select('id, username, avatar_url, full_name')
                .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
                .neq('id', user.id) // Exclude current user
                .limit(20);

            if (searchError) throw searchError;

            setSearchResults(users || []);

            // Check friendship status for each user
            if (users && users.length > 0) {
                await checkFriendshipStatus(users.map(u => u.id), user.id);
            }
        } catch (err) {
            console.error('Error searching users:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Check friendship status for multiple users at once
    const checkFriendshipStatus = async (userIds: string[], currentUserId: string) => {
        try {
            const { data: friendships, error: friendshipError } = await supabase
                .from('friendships')
                .select('user_id, friend_id, status')
                .or(`and(user_id.eq.${currentUserId},friend_id.in.(${userIds.join(',')})),and(friend_id.eq.${currentUserId},user_id.in.(${userIds.join(',')}))`);

            if (friendshipError) throw friendshipError;

            const statusMap: Record<string, string> = {};

            if (friendships) {
                friendships.forEach(friendship => {
                    const otherUserId = friendship.user_id === currentUserId ? friendship.friend_id : friendship.user_id;
                    statusMap[otherUserId] = friendship.status;
                });
            }

            setFriendStatus(statusMap);
        } catch (err) {
            console.error('Error checking friendship status:', err);
            // Don't set error state here to avoid disrupting the search results display
        }
    };

    // Send friend request
    const sendFriendRequest = async (friendId: string) => {
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            if (!user) throw new Error('No user logged in');

            // Check if a friendship already exists in either direction
            const { data: existingFriendship, error: checkError } = await supabase
                .from('friendships')
                .select('id, status')
                .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`)
                .maybeSingle();

            if (checkError) throw checkError;

            // If friendship exists but rejected, update it
            if (existingFriendship && existingFriendship.status === 'rejected') {
                const { error: updateError } = await supabase
                    .from('friendships')
                    .update({ status: 'pending', updated_at: new Date().toISOString() })
                    .eq('id', existingFriendship.id);

                if (updateError) throw updateError;
            }
            // If no friendship exists, create a new one
            else if (!existingFriendship) {
                const { error: insertError } = await supabase
                    .from('friendships')
                    .insert([
                        { user_id: user.id, friend_id: friendId, status: 'pending' }
                    ]);

                if (insertError) throw insertError;
            }

            // Update local state
            setFriendStatus(prev => ({
                ...prev,
                [friendId]: 'pending'
            }));
        } catch (err) {
            console.error('Error sending friend request:', err);
            setError(err instanceof Error ? err.message : 'Failed to send friend request');
        }
    };

    // Reset search state
    const resetSearch = () => {
        setSearchResults([]);
        setLoading(false);
        setError(null);
    };

    return {
        searchResults,
        loading,
        error,
        friendStatus,
        searchUsers,
        sendFriendRequest,
        resetSearch
    };
};