// app/utils/fetchusers.ts
import { supabase } from '../lib/supabase'; // Adjust this path to your supabase client

// Interface for user data
export interface UserData {
    id: string;
    username: string;
    full_name: string;
    bio: string;
    avatar_url: string;
    email: string;
}

// Function to fetch a specific user by ID
export const fetchUserById = async (userId: string): Promise<UserData | null> => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error("Error fetching user data:", error);
            return null;
        }

        if (!data) {
            console.log("No user found with ID:", userId);
            return null;
        }

        return {
            id: data.id,
            username: data.username,
            full_name: data.full_name,
            bio: data.bio || '',
            avatar_url: data.avatar_url || 'https://via.placeholder.com/150',
            email: data.email
        };
    } catch (error) {
        console.error("Unexpected error fetching user:", error);
        return null;
    }
};

// Function to check if a user ID is the current user
export const isCurrentUser = async (userId: string): Promise<boolean> => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.user?.id === userId;
    } catch (error) {
        console.error("Error checking current user:", error);
        return false;
    }
};