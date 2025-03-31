import { supabase } from '../../../lib/supabase';

// Interface for Prompt Data
interface PromptData {
    prompt: {
        id: string;
        text: string;
    };
    timeRemaining: string;
    expiresAt: string;
}

export const postUtils = {
    // Updated function to fetch prompt of the day directly from Supabase
    fetchPromptOfTheDay: async (): Promise<PromptData> => {
        try {
            // Fetch the current active prompt from Supabase
            const { data, error } = await supabase
                .from('daily_prompts')
                .select('*')
                .eq('is_active', true)
                .single();

            if (error) throw error;

            // If no active prompt is found, use fallback
            if (!data) {
                return getFallbackPrompt();
            }

            // Calculate time remaining and expiration
            const currentTime = new Date();
            const expiresAt = new Date(data.created_at);
            expiresAt.setHours(expiresAt.getHours() + 24); // Assuming 24-hour expiry

            // Calculate remaining time
            const timeDiff = expiresAt.getTime() - currentTime.getTime();
            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

            const timeRemaining = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            return {
                prompt: {
                    id: data.id,
                    text: data.text
                },
                timeRemaining,
                expiresAt: expiresAt.toISOString()
            };
        } catch (error) {
            console.error('Error fetching prompt:', error);
            return getFallbackPrompt();
        }
    },

    // Upload Media Function
    uploadMedia: async ({ file, userId }) => {
        if (!file || !file.uri) {
            throw new Error('Invalid media file');
        }

        try {
            // Extract file extension
            const uriParts = file.uri.split('.');
            const fileExt = uriParts[uriParts.length - 1] ||
                (file.type.startsWith('image') ? 'jpg' : 'mp4');

            // Create a unique filename
            const filename = `${new Date().getTime()}.${fileExt}`;

            // Create file path with user ID
            const filePath = `user_${userId}/${filename}`;

            // Read file as base64
            const fileBase64 = await FileSystem.readAsStringAsync(file.uri, {
                encoding: FileSystem.EncodingType.Base64
            });

            // Upload the decoded base64 data
            const { data, error } = await supabase.storage
                .from('response_bucket')
                .upload(filePath, decode(fileBase64), {
                    contentType: file.type ||
                        (fileExt === 'jpg' ? 'image/jpeg' : 'video/mp4'),
                });

            if (error) {
                console.error('Supabase storage error:', error);
                throw error;
            }

            // Get the public URL
            const { data: urlData } = supabase.storage
                .from('response_bucket')
                .getPublicUrl(filePath);

            return urlData.publicUrl;
        } catch (error) {
            console.error('Media upload error:', error);
            throw error;
        }
    },

    // Upload Audio Function
    uploadAudio: async ({ recording, userId }) => {
        if (!recording || !recording.uri) {
            throw new Error('Invalid audio recording');
        }

        try {
            const filename = `${new Date().getTime()}.m4a`;
            const filePath = `user_${userId}/${filename}`;

            // Read file as base64
            const fileBase64 = await FileSystem.readAsStringAsync(recording.uri, {
                encoding: FileSystem.EncodingType.Base64
            });

            const { data, error } = await supabase.storage
                .from('response_bucket')
                .upload(filePath, decode(fileBase64), {
                    contentType: 'audio/m4a',
                });

            if (error) throw error;

            // Get the public URL
            const { data: urlData } = supabase.storage
                .from('response_bucket')
                .getPublicUrl(filePath);

            return urlData.publicUrl;
        } catch (error) {
            console.error('Audio upload error:', error);
            throw error;
        }
    },

    // Post Response Function
    postResponse: async ({ userId, promptId, contentType, fileUrl, textContent }) => {
        // Insert the response into the database
        const { data, error } = await supabase
            .from('responses')
            .insert({
                user_id: userId,
                prompt_id: promptId,
                content_type: contentType,
                file_url: fileUrl,
                text_content: textContent
            });

        if (error) throw error;

        return data;
    }
};

// Fallback prompt function
function getFallbackPrompt(): PromptData {
    return {
        prompt: {
            id: 'fallback-id',
            text: "What was your most memorable moment today?"
        },
        timeRemaining: "24:00:00",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
}

// Add missing imports
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';