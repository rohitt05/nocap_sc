import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Adjust path as needed

// Define the friend response notification type
export type FriendResponseNotification = {
    id: string;
    user_id: string;
    full_name: string;
    username: string;
    avatar_url: string | null;
    response_id: string;
    prompt_id: string;
    prompt_text: string;
    content_type: string;
    created_at: string;
    type: 'friend_response';
};

export const useFriendResponses = () => {
    const [friendResponses, setFriendResponses] = useState<FriendResponseNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFriendResponses = async () => {
        try {
            setLoading(true);

            // Get the current user
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError) {
                throw userError;
            }

            if (!user) {
                throw new Error('No user logged in');
            }

            // 1. Get all friends (similar to your useFetchFriends hook)
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
                setFriendResponses([]);
                setLoading(false);
                return;
            }

            // Extract friend IDs
            const friendIds = friendships.map(friendship =>
                friendship.user_id === user.id ? friendship.friend_id : friendship.user_id
            );

            // 2. Get recent responses from friends (last 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const { data: friendResponsesData, error: responsesError } = await supabase
                .from('responses')
                .select(`
                    id,
                    user_id,
                    prompt_id,
                    content_type,
                    created_at,
                    users:user_id (
                        full_name,
                        username,
                        avatar_url
                    ),
                    prompts:prompt_id (
                        text
                    )
                `)
                .in('user_id', friendIds)
                .gte('created_at', sevenDaysAgo.toISOString())
                .order('created_at', { ascending: false });

            if (responsesError) {
                throw responsesError;
            }

            // 3. Format the responses as notifications
            const formattedResponses: FriendResponseNotification[] = friendResponsesData.map(response => ({
                id: response.id,
                user_id: response.user_id,
                full_name: response.users.full_name,
                username: response.users.username,
                avatar_url: response.users.avatar_url,
                response_id: response.id,
                prompt_id: response.prompt_id,
                prompt_text: response.prompts?.text || "prompt",
                content_type: response.content_type,
                created_at: response.created_at,
                type: 'friend_response'
            }));

            setFriendResponses(formattedResponses);
        } catch (err) {
            console.error('Error fetching friend responses:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFriendResponses();

        // Optional: Set up real-time subscription for new friend responses
        const responsesSubscription = supabase
            .channel('friend-responses-changes')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'responses'
            }, (payload) => {
                // When a new response is created, refresh friend responses
                fetchFriendResponses();
            })
            .subscribe();

        return () => {
            // Clean up subscription
            supabase.removeChannel(responsesSubscription);
        };
    }, []);

    const refreshFriendResponses = () => {
        fetchFriendResponses();
    };

    return {
        friendResponses,
        loading,
        error,
        refreshFriendResponses
    };
};