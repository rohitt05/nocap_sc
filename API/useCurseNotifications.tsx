import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

// Improved Type Definitions
interface User {
    id: string;
    full_name: string;
    username?: string;
    avatar_url: string | null;
}

interface CurseNotification {
    id: string;
    user_id: string;
    full_name: string;
    username?: string;
    avatar_url: string | null;
    curse_count: number;
    created_at: string;
    type: 'curse';
}

interface CurseRecord {
    id: string;
    sender: User;
    created_at: string;
}

export const useCurseNotifications = () => {
    const [curseNotifications, setCurseNotifications] = useState<CurseNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Use ref to track mounted state
    const isMounted = useRef(true);

    // Memoized fetch function with improved error handling
    const fetchCurseNotifications = useCallback(async () => {
        // Reset state before fetching
        if (isMounted.current) {
            setLoading(true);
            setError(null);
        }

        try {
            // Get authenticated user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('User not authenticated');
            }

            // Fetch curses with detailed sender information
            const { data, error } = await supabase
                .from('curses')
                .select(`
                    id,
                    sender:users!curses_sender_id_fkey(
                        id, 
                        full_name, 
                        username, 
                        avatar_url
                    ),
                    created_at
                `)
                .eq('receiver_id', user.id)
                .order('created_at', { ascending: false });

            // Handle potential errors
            if (error) throw error;

            // Group curses by sender and day
            const groupedCurses: CurseNotification[] = [];

            // Process raw curse data
            (data as CurseRecord[]).forEach(curse => {
                const senderId = curse.sender.id;
                const curseDate = new Date(curse.created_at);

                // Format date as YYYY-MM-DD to group by day
                const curseDay = curseDate.toISOString().split('T')[0];

                // Create a unique key combining sender ID and date
                const groupKey = `${senderId}_${curseDay}`;

                // Find if we already have a notification for this sender on this day
                const existingIndex = groupedCurses.findIndex(c =>
                    c.user_id === senderId &&
                    new Date(c.created_at).toISOString().split('T')[0] === curseDay
                );

                if (existingIndex !== -1) {
                    // Update existing curse notification for this day
                    groupedCurses[existingIndex] = {
                        ...groupedCurses[existingIndex],
                        curse_count: groupedCurses[existingIndex].curse_count + 1,
                        // Keep the most recent timestamp if this curse is newer
                        created_at: new Date(curse.created_at) > new Date(groupedCurses[existingIndex].created_at)
                            ? curse.created_at
                            : groupedCurses[existingIndex].created_at
                    };
                } else {
                    // Add new curse notification
                    groupedCurses.push({
                        id: curse.id,
                        user_id: senderId,
                        full_name: curse.sender.full_name,
                        username: curse.sender.username,
                        avatar_url: curse.sender.avatar_url,
                        curse_count: 1,
                        created_at: curse.created_at,
                        type: 'curse'
                    });
                }
            });

            // Sort by created_at to ensure most recent curses are first
            groupedCurses.sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            // Update state only if component is still mounted
            if (isMounted.current) {
                setCurseNotifications(groupedCurses);
                setLoading(false);
            }
        } catch (err) {
            // Improved error handling
            const errorMessage = err instanceof Error
                ? err.message
                : 'Failed to fetch curse notifications';

            if (isMounted.current) {
                setError(errorMessage);
                setLoading(false);
            }

            // Log error for debugging
            console.error('Curse Notifications Error:', err);
        }
    }, []);

    // Use effect with cleanup
    useEffect(() => {
        // Reset mounted state
        isMounted.current = true;

        // Fetch initial notifications
        fetchCurseNotifications();

        // Cleanup function
        return () => {
            isMounted.current = false;
        };
    }, [fetchCurseNotifications]);

    // Memoized refresh function
    const refreshCurseNotifications = useCallback(async () => {
        await fetchCurseNotifications();
    }, [fetchCurseNotifications]);

    return {
        curseNotifications,
        loading,
        error,
        refreshCurseNotifications
    };
};