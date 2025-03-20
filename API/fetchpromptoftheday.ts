import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export interface Prompt {
    id: string;
    text: string;
    active: boolean;
    created_at: string;
}

interface StoredPromptData {
    prompt: Prompt;
    expiresAt: string;
    selectedAt: string;
}

const STORAGE_KEY = 'DAILY_PROMPT_DATA';

export async function fetchPromptOfTheDay() {
    try {
        // First, check if we have a stored prompt that hasn't expired yet
        const storedData = await getStoredPrompt();

        if (storedData) {
            // Calculate remaining time for the existing prompt
            const now = new Date();
            const expiryTime = new Date(storedData.expiresAt);

            // If the stored prompt hasn't expired yet, return it
            if (now < expiryTime) {
                const timeRemaining = calculateTimeRemaining(expiryTime);
                return {
                    prompt: storedData.prompt,
                    expiresAt: storedData.expiresAt,
                    timeRemaining: timeRemaining,
                    isNewPrompt: false
                };
            }
        }

        // If we reach here, we need a new prompt
        return await selectNewPrompt();
    } catch (error) {
        console.error('Error in fetchPromptOfTheDay:', error);
        throw error;
    }
}

async function getStoredPrompt(): Promise<StoredPromptData | null> {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
        console.error('Error reading stored prompt:', error);
        return null;
    }
}

async function storePromptData(data: StoredPromptData): Promise<void> {
    try {
        const jsonValue = JSON.stringify(data);
        await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (error) {
        console.error('Error storing prompt data:', error);
    }
}

async function selectNewPrompt() {
    // Get active prompts
    const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('active', true)
        .limit(50);

    if (error) throw error;

    if (!data || data.length === 0) {
        throw new Error('No active prompts found');
    }

    // Select a random prompt
    const randomIndex = Math.floor(Math.random() * data.length);
    const randomPrompt = data[randomIndex];

    // Set expiration to exactly 24 hours from now
    const now = new Date();
    const expiryTime = new Date(now);
    expiryTime.setHours(now.getHours() + 24);

    // Store the new prompt data
    const promptData = {
        prompt: randomPrompt,
        expiresAt: expiryTime.toISOString(),
        selectedAt: now.toISOString()
    };

    await storePromptData(promptData);

    const timeRemaining = calculateTimeRemaining(expiryTime);

    return {
        prompt: randomPrompt,
        expiresAt: expiryTime.toISOString(),
        timeRemaining: timeRemaining,
        isNewPrompt: true
    };
}

function calculateTimeRemaining(expiryTime: Date): string {
    const now = new Date();
    const diffMs = expiryTime.getTime() - now.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const hours = Math.floor(diffSecs / 3600);
    const minutes = Math.floor((diffSecs % 3600) / 60);
    const seconds = diffSecs % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}