// components/responses/types.ts

export interface Reaction {
    profile_picture_url: string;
    emoji: string;
}

export interface ResponseItemData {
    id: string;
    type: 'text' | 'image' | 'video' | 'audio' | 'gif';
    content?: string; // Make this optional
    timestamp: string;
    profile_picture_url: string;
    // Optional fields for different content types
    text?: string;
    media_url?: string;
    thumbnail_url?: string;
    caption?: string;
    duration?: string;
    // User can be either an object or a string based on your data
    user: string | {
        id: string;
        name: string;
        username: string;
        avatar: string | null;
    };
    // Reactions can be either an array or an object based on your data
    reactions: Reaction[] | {
        count: number;
        hasUserReacted: boolean;
    };
}

export interface ResponsesData {
    responses_received: ResponseItemData[];
}

export interface ResponseItemProps {
    item: ResponseItemData;
}