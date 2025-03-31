import React, { useCallback, useState } from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase'; // Adjust path as needed

const CurseButton = ({
    receiverId,
    username,
    isFriend
}: {
    receiverId: string,
    username: string,
    isFriend: boolean
}) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleCurse = useCallback(async () => {
        // Prevent multiple simultaneous curse attempts
        if (isLoading) return;

        setIsLoading(true);

        try {
            // Get the current user
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user) {
                Alert.alert('Error', 'Could not authenticate user');
                setIsLoading(false);
                return;
            }

            // Insert the curse
            const { error } = await supabase
                .from('curses')
                .insert({
                    sender_id: user.id,
                    receiver_id: receiverId
                });

            if (error) {
                console.error('Error sending curse:', error);
                Alert.alert('Error', 'Could not send curse');
                return;
            }

            // Success feedback
            Alert.alert('Curse Sent', `You cursed ${username}`);
        } catch (err) {
            console.error('Unexpected error:', err);
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    }, [receiverId, username, isLoading]);

    // If not friends, don't show the curse button
    if (!isFriend) return null;

    return (
        <TouchableOpacity
            style={{
                backgroundColor: '#ff4500', // Intense red/orange for curse
                padding: 15,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                marginVertical: 10,
                marginHorizontal: 16,
                width: '90%',
                alignSelf: 'center',
                flexDirection: 'row',
                opacity: isLoading ? 0.5 : 1
            }}
            onPress={handleCurse}
            disabled={isLoading}
            accessibilityLabel="Curse this friend"
            accessibilityRole="button"
        >
            <Ionicons
                name="skull-outline"
                size={20}
                color="white"
                style={{ marginRight: 10 }}
            />
            <Text style={{
                color: 'white',
                fontWeight: 'bold',
                fontSize: 16
            }}>
                {isLoading ? 'Cursing...' : 'Curse Them'}
            </Text>
        </TouchableOpacity>
    );
};

export default CurseButton;