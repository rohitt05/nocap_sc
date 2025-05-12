import { supabase } from './supabase';

export type NotificationType = 'friend_request' | 'reaction' | 'friend_response' | 'curse';

interface NotificationData {
    type: NotificationType;
    title: string;
    body: string;
    data?: Record<string, any>;
}

export async function sendPushNotification(userId: string, notification: NotificationData) {
    try {
        // Get all push tokens for the user
        const { data: tokens, error: tokenError } = await supabase
            .from('user_push_tokens')
            .select('token')
            .eq('user_id', userId);

        if (tokenError) {
            console.error('Error fetching push tokens:', tokenError);
            return;
        }

        if (!tokens || tokens.length === 0) {
            console.log('No push tokens found for user:', userId);
            return;
        }

        // Send notification to each token
        const notificationPromises = tokens.map(async ({ token }) => {
            const message = {
                to: token,
                sound: 'default',
                title: notification.title,
                body: notification.body,
                data: {
                    type: notification.type,
                    ...notification.data
                }
            };

            try {
                const response = await fetch('https://exp.host/--/api/v2/push/send', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Accept-encoding': 'gzip, deflate',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(message),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                return response.json();
            } catch (error) {
                console.error('Error sending push notification:', error);
                return null;
            }
        });

        await Promise.all(notificationPromises);
    } catch (error) {
        console.error('Error in sendPushNotification:', error);
    }
}

// Helper functions for different notification types
export async function sendFriendRequestNotification(senderId: string, receiverId: string) {
    const { data: sender } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', senderId)
        .single();

    if (!sender) return;

    await sendPushNotification(receiverId, {
        type: 'friend_request',
        title: 'New Friend Request',
        body: `${sender.full_name} sent you a friend request`,
        data: { senderId }
    });
}

export async function sendReactionNotification(reactorId: string, responseOwnerId: string, reactionType: string) {
    const { data: reactor } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', reactorId)
        .single();

    if (!reactor) return;

    await sendPushNotification(responseOwnerId, {
        type: 'reaction',
        title: 'New Reaction',
        body: `${reactor.full_name} reacted to your response`,
        data: { reactorId, reactionType }
    });
}

export async function sendFriendResponseNotification(senderId: string, receiverId: string) {
    const { data: sender } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', senderId)
        .single();

    if (!sender) return;

    await sendPushNotification(receiverId, {
        type: 'friend_response',
        title: 'New Response',
        body: `${sender.full_name} posted a new response`,
        data: { senderId }
    });
}

export async function sendCurseNotification(senderId: string, receiverId: string) {
    const { data: sender } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', senderId)
        .single();

    if (!sender) return;

    await sendPushNotification(receiverId, {
        type: 'curse',
        title: 'New Curse',
        body: `${sender.full_name} cursed you`,
        data: { senderId }
    });
}
