import React, { useState, useEffect } from 'react';
import { ResponseItemProps } from '../types';
import TextResponse from './Text/TextResponse';
import AudioResponse from './Audio';
import MediaResponse from './Media';
import { supabase } from '../../../../lib/supabase'; // Adjust import path as needed

const ResponseItem: React.FC<ResponseItemProps> = ({ item }) => {
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Fetch authenticated user ID when component mounts
    useEffect(() => {
        const fetchCurrentUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                console.log('Authenticated user ID:', user.id);
                setCurrentUserId(user.id);
            } else {
                console.log('No authenticated user found');
                setCurrentUserId(null);
            }
        };

        fetchCurrentUser();
    }, []);

    console.log(`Rendering response item of type: ${item.type}, id: ${item.id}, currentUserId: ${currentUserId}`);

    // Render based on content type
    switch (item.type) {
        case 'text':
            return <TextResponse item={item} currentUserId={currentUserId || ''} />;
        case 'audio':
            return <AudioResponse item={item} currentUserId={currentUserId || ''} />; // Pass currentUserId explicitly
        case 'image':
        case 'video':
        case 'gif':
            return <MediaResponse item={item} currentUserId={currentUserId || ''} />; // Also update MediaResponse prop
        default:
            console.warn(`Unknown response type: ${item.type}`);
            return null;
    }
};

export default ResponseItem;