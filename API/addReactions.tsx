import { supabase } from '../lib/supabase';

// Interface for reaction data
export interface ReactionData {
    response_id: string;
    reaction_type: string;
    user_id?: string; // Optional for backward compatibility
}

/**
 * Adds a reaction to a response
 * @param reaction_data Object containing response_id and reaction_type
 * @returns Promise with the result of the operation
 */
export const addReaction = async (reaction_data: ReactionData) => {
    try {
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                error: 'User not authenticated'
            };
        }

        // Add the user_id to the reaction data
        const completeReactionData = {
            ...reaction_data,
            user_id: user.id
        };

        // First check if the user already has a reaction on this response
        const { data: existingReaction, error: fetchError } = await supabase
            .from('reactions')
            .select('*')
            .eq('response_id', reaction_data.response_id)
            .eq('user_id', user.id) // Filter by the current user
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            // PGRST116 means no rows returned, which is fine
            throw fetchError;
        }

        // If user already reacted with the same reaction, remove it (toggle behavior)
        if (existingReaction && existingReaction.reaction_type === reaction_data.reaction_type) {
            const { error: deleteError } = await supabase
                .from('reactions')
                .delete()
                .eq('id', existingReaction.id);

            if (deleteError) throw deleteError;
            return { success: true, action: 'removed', data: null };
        }
        // If user already reacted but with a different reaction, update it
        else if (existingReaction) {
            const { data, error: updateError } = await supabase
                .from('reactions')
                .update({ reaction_type: reaction_data.reaction_type })
                .eq('id', existingReaction.id)
                .select();

            if (updateError) throw updateError;
            return { success: true, action: 'updated', data };
        }
        // If no existing reaction, create a new one
        else {
            const { data, error: insertError } = await supabase
                .from('reactions')
                .insert([completeReactionData])
                .select();

            if (insertError) throw insertError;
            return { success: true, action: 'added', data };
        }
    } catch (error) {
        console.error('Error managing reaction:', error);
        return {
            success: false,
            error: error.message || 'Failed to manage reaction'
        };
    }
};

/**
 * Gets all reactions for a specific response
 * @param response_id The ID of the response
 * @returns Promise with the reactions data
 */
export const getReactions = async (response_id: string) => {
    try {
        const { data, error } = await supabase
            .from('reactions')
            .select(`
                id,
                reaction_type,
                user_id,
                users (
                    username,
                    avatar_url
                )
            `)
            .eq('response_id', response_id);

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching reactions:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch reactions'
        };
    }
};