import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// Type for raw reaction data from database
type RawReactionNotification = {
    id: string;
    response_id: string;
    reaction_type: string;
    created_at: string;
    user_id: string;
    users: {
        full_name: string;
        avatar_url: string | null;
    };
    responses: {
        prompt_id: string;
        prompts?: {  // Make prompts optional in the type definition
            text: string;
        } | null;
    };
};

// Processed notification with count
export type ReactionNotification = {
    id: string;
    user_id: string;
    full_name: string;
    avatar_url: string | null;
    response_id: string;
    reaction_type: string;
    reaction_count: number;
    prompt_text: string;
    created_at: string;
};

export const useReactionNotifications = () => {
    const [reactionNotifications, setReactionNotifications] = useState<ReactionNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Function to fetch reaction notifications
    const fetchReactionNotifications = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // 1. Get the current user
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            if (!user) throw new Error('Not authenticated');

            // 2. Fetch reactions on user's responses
            const { data, error: reactionsError } = await supabase
                .from('reactions')
                .select(`
                    id,
                    response_id,
                    reaction_type,
                    created_at,
                    user_id,
                    users (
                        full_name,
                        avatar_url
                    ),
                    responses (
                        prompt_id,
                        prompts (
                            text
                        )
                    )
                `)
                .eq('responses.user_id', user.id) // Only reactions on the user's responses
                // Filter out the user's own reactions - no need to notify about your own reactions
                .not('user_id', 'eq', user.id)
                .order('created_at', { ascending: false })
                .limit(50); // Limit to recent notifications

            if (reactionsError) throw reactionsError;

            // 3. Process and group notifications by user, response, and date
            const processedNotifications = processReactions(data as RawReactionNotification[]);
            setReactionNotifications(processedNotifications);
        } catch (err) {
            console.error('Error fetching reaction notifications:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch reaction notifications');
        } finally {
            setLoading(false);
        }
    }, []);

    // Process and group reactions
    const processReactions = (reactions: RawReactionNotification[]): ReactionNotification[] => {
        // Filter out invalid reactions where prompts is null
        const validReactions = reactions.filter(reaction =>
            reaction &&
            reaction.responses &&
            reaction.responses.prompts !== null &&
            reaction.responses.prompts !== undefined
        );

        if (validReactions.length === 0) {
            return [];
        }

        // Group reactions by user_id + response_id + date combination
        const groupedReactions = validReactions.reduce((groups, reaction) => {
            // Extract the date portion of the timestamp (YYYY-MM-DD)
            const reactionDate = new Date(reaction.created_at).toISOString().split('T')[0];

            // Create a unique key that includes the date
            const key = `${reaction.user_id}-${reaction.response_id}-${reactionDate}`;

            if (!groups[key]) {
                groups[key] = {
                    reactions: [],
                    latest: reaction.created_at
                };
            }

            // Track the latest reaction timestamp
            if (new Date(reaction.created_at) > new Date(groups[key].latest)) {
                groups[key].latest = reaction.created_at;
            }

            groups[key].reactions.push(reaction);
            return groups;
        }, {} as Record<string, { reactions: RawReactionNotification[], latest: string }>);

        // Convert grouped reactions to notification objects
        return Object.values(groupedReactions).map(group => {
            const latestReaction = group.reactions[0];
            const reactionTypes = [...new Set(group.reactions.map(r => r.reaction_type))]; // Unique reaction types

            // Get the most recent reaction type if there are multiple
            const primaryReactionType = reactionTypes.length === 1
                ? reactionTypes[0]
                : group.reactions.sort((a, b) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                )[0].reaction_type;

            // Safely access prompt text with fallback
            const promptText = latestReaction.responses?.prompts?.text || 'Unknown prompt';

            // Truncate prompt text to avoid very long notifications
            const truncatedPromptText = promptText.length > 30
                ? promptText.substring(0, 30) + '...'
                : promptText;

            // Generate a more specific ID that includes date info
            const reactionDate = new Date(group.latest).toISOString().split('T')[0];

            return {
                id: `reaction-${latestReaction.user_id}-${latestReaction.response_id}-${reactionDate}`,
                user_id: latestReaction.user_id,
                full_name: latestReaction.users.full_name,
                avatar_url: latestReaction.users.avatar_url,
                response_id: latestReaction.response_id,
                reaction_type: primaryReactionType,
                reaction_count: group.reactions.length,
                prompt_text: truncatedPromptText,
                created_at: group.latest // Use latest reaction timestamp
            };
        }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    };

    // Initial fetch
    useEffect(() => {
        fetchReactionNotifications();
    }, [fetchReactionNotifications]);

    return {
        reactionNotifications,
        loading,
        error,
        refreshReactionNotifications: fetchReactionNotifications
    };
};