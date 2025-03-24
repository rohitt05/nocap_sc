import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { fetchUserById, isCurrentUser, UserData } from '../../../../../API/fetchusers';


export function useUserProfile(userId: string | null) {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        // Make sure we have an ID to work with
        if (!userId || typeof userId !== 'string') {
            console.error("No valid user ID provided");
            router.back();
            return;
        }

        const loadUserData = async () => {
            setLoading(true);

            // Check if this is the current user's profile
            const currentUserCheck = await isCurrentUser(userId);
            setIsOwner(currentUserCheck);

            // Fetch the user data
            const user = await fetchUserById(userId);
            setUserData(user);

            setLoading(false);
        };

        loadUserData();
    }, [userId]);

    return {
        userData,
        loading,
        isOwner
    };
}