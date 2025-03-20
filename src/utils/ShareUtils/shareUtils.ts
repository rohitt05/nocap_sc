import { Share } from 'react-native';

export const handleShareNoCap = async () => {
    try {
        const result = await Share.share({
            message: 'Check out NoCap!',
            url: 'https://nocap-app.com', // Replace with your actual app URL
            title: 'Share NoCap'
        });

        if (result.action === Share.sharedAction) {
            if (result.activityType) {
                console.log(`Shared via ${result.activityType}`);
            } else {
                console.log('Shared successfully');
            }
        } else if (result.action === Share.dismissedAction) {
            console.log('Share dismissed');
        }
    } catch (error) {
        console.error('Error sharing:', error.message);
    }
};