// ./navigation.js
import { useRouter } from 'expo-router';
import { BackHandler } from 'react-native';
import { useEffect } from 'react';

export const useBackNavigation = (destination) => {
    const router = useRouter();

    const goBack = () => {
        router.replace(destination);
        return true;
    };

    // Set up hardware back button handler
    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            goBack
        );

        return () => backHandler.remove();
    }, []);

    return goBack;
};