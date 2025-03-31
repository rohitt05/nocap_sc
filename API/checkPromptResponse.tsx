import { supabase } from '../lib/supabase';
import { fetchPromptOfTheDay } from './fetchpromptoftheday';

// Check if user has responded to the current prompt
export const checkUserResponse = async (promptId) => {
    try {
        // Make sure we have a valid promptId before querying
        if (!promptId || promptId === "undefined") {
            console.log("Invalid promptId, skipping response check");
            return false;
        }

        const { data: userResponse, error: userError } = await supabase.auth.getUser();

        if (userError || !userResponse || !userResponse.user) {
            console.log("No authenticated user found");
            return false;
        }

        const userId = userResponse.user.id;

        if (!userId) {
            console.log("No user ID available");
            return false;
        }

        console.log(`Checking responses for user ${userId} and prompt ${promptId}`);

        const { data, error } = await supabase
            .from('responses')
            .select('id')
            .eq('user_id', userId)
            .eq('prompt_id', promptId)
            .limit(1);

        if (error) {
            console.error('Database query error:', error);
            throw error;
        }

        const hasResponse = data && data.length > 0;
        console.log(`User has responded: ${hasResponse}`);
        return hasResponse;
    } catch (error) {
        console.error('Error checking user response:', error);
        return false;
    }
};

// Load current prompt and check response status
export const loadPromptAndCheckResponse = async () => {
    try {
        const promptData = await fetchPromptOfTheDay();
        console.log("Prompt data received:", promptData ? "yes" : "no");

        if (!promptData || !promptData.prompt || !promptData.prompt.id) {
            console.log("No valid prompt data available");
            return {
                promptId: null,
                hasResponded: false
            };
        }

        const promptId = promptData.prompt.id;
        console.log("Current prompt ID:", promptId);

        // Only check for responses if we have a valid promptId
        let hasResponded = false;
        if (promptId && typeof promptId === 'string' && promptId.trim() !== '') {
            hasResponded = await checkUserResponse(promptId);
        }

        return {
            promptId,
            hasResponded
        };
    } catch (error) {
        console.error('Error loading prompt or checking response:', error);
        return {
            promptId: null,
            hasResponded: false
        };
    }
};