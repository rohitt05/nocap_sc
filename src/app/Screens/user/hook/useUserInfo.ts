import { useState, useEffect } from 'react';
import { supabase } from '../../../../../lib/supabase';

export interface UserInfo {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string | null;
    bio: string | null;
    created_at: string;
    email: string;
}

export function useUserInfo(userId: string | null) {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchUserInfo() {
            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                const { data, error } = await supabase
                    .from('users')
                    .select('id, full_name, username, avatar_url, bio, created_at, email')
                    .eq('id', userId)
                    .single();

                if (error) throw error;

                setUserInfo(data);
            } catch (err) {
                console.error('Error fetching user info:', err);
                setError(err instanceof Error ? err : new Error('Failed to fetch user info'));
            } finally {
                setLoading(false);
            }
        }

        fetchUserInfo();
    }, [userId]);

    // Format the created_at date to a readable format
    const formatJoinDate = (dateString: string | undefined): string => {
        if (!dateString) return 'Unknown';

        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const joinDate = userInfo?.created_at ? formatJoinDate(userInfo.created_at) : null;

    return { userInfo, joinDate, loading, error };
}