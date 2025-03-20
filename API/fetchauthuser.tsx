import { supabase } from '../lib/supabase'; // Update this path to where your Supabase client is initialized

// Function to fetch authenticated user data
export const fetchAuthUser = async () => {
    try {
        // Get the current authenticated user's session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
            console.error('Error fetching session:', sessionError);
            return null;
        }

        if (!session) {
            console.log('No active session found');
            return null;
        }

        // Get the user's profile data from the users table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, full_name, username, avatar_url')
            .eq('id', session.user.id)
            .single();

        if (userError) {
            console.error('Error fetching user data:', userError);
            return null;
        }

        return userData;
    } catch (error) {
        console.error('Unexpected error in fetchAuthUser:', error);
        return null;
    }
};