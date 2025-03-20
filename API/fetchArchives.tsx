import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Assuming you have a supabase client setup

// Type definitions for our data
export interface Response {
    id: string;
    user_id: string;
    prompt_id: string;
    content_type: 'text' | 'image' | 'video' | 'audio' | 'gif';
    file_url?: string;
    text_content?: string;
    created_at: string;
}

export interface ArchiveData {
    [date: string]: Response[];
}

// Function to fetch user's archives (responses)
export const useFetchArchives = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [archives, setArchives] = useState<ArchiveData>({});
    const [userId, setUserId] = useState<string | null>(null);

    // Get current authenticated user
    const fetchCurrentUser = async () => {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();

            if (error) {
                throw error;
            }

            if (user) {
                setUserId(user.id);
                return user.id;
            }
            return null;
        } catch (err) {
            console.error('Error fetching current user:', err);
            setError('Could not authenticate user');
            setLoading(false);
            return null;
        }
    };

    // Fetch responses for the authenticated user
    const fetchUserResponses = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('responses')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            return data as Response[];
        } catch (err) {
            console.error('Error fetching user responses:', err);
            setError('Failed to load memories');
            return [];
        }
    };

    // Organize responses by date
    const organizeResponsesByDate = (responses: Response[]) => {
        const organized: ArchiveData = {};

        responses.forEach(response => {
            // Format date as YYYY-MM-DD
            const date = new Date(response.created_at);
            const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

            if (!organized[dateKey]) {
                organized[dateKey] = [];
            }
            organized[dateKey].push(response);
        });

        return organized;
    };

    // Use effect to fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const currentUserId = await fetchCurrentUser();

                if (!currentUserId) {
                    setLoading(false);
                    setError('User not authenticated');
                    return;
                }

                const responses = await fetchUserResponses(currentUserId);
                const organizedData = organizeResponsesByDate(responses);

                setArchives(organizedData);
                setLoading(false);
            } catch (err) {
                console.error('Error in fetchData:', err);
                setError('Failed to load archives');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Function to check if a specific date has memories
    const hasMemoriesForDate = (date: Date): boolean => {
        if (!date) return false;

        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        return !!archives[dateKey] && archives[dateKey].length > 0;
    };

    // Get memories for a specific date
    const getMemoriesForDate = (date: Date): Response[] => {
        if (!date) return [];

        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        return archives[dateKey] || [];
    };

    // NEW FUNCTION: Get "On This Day" memories from previous years
    const getOnThisDayMemories = (date: Date = new Date()): Response[] => {
        if (!date) return [];

        const currentYear = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        // Format month and day with leading zeros
        const monthStr = String(month).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');

        // Collect all memories from the same day in previous years
        const onThisDayMemories: Response[] = [];

        Object.keys(archives).forEach(dateKey => {
            // Only look at dates that match the same month and day, but from different years
            if (dateKey.slice(5) === `${monthStr}-${dayStr}` && dateKey.slice(0, 4) !== String(currentYear)) {
                onThisDayMemories.push(...archives[dateKey]);
            }
        });

        // Sort memories by year (newest to oldest)
        onThisDayMemories.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        return onThisDayMemories;
    };

    return {
        loading,
        error,
        archives,
        userId,
        hasMemoriesForDate,
        getMemoriesForDate,
        getOnThisDayMemories, // Expose the new function
    };
};