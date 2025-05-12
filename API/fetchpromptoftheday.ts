import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";

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

interface UsedPromptsData {
  usedPromptIds: string[];
}

interface RegionPreference {
  region: string;
  timezone: string;
  refreshHour: number;
}

const STORAGE_KEY = "DAILY_PROMPT_DATA";
const USED_PROMPTS_KEY = "PERMANENTLY_USED_PROMPT_IDS";
const REGION_PREFERENCES_KEY = "USER_REGION_PREFERENCE";

// Default region settings
const DEFAULT_REGION = "india";
const DEFAULT_TIMEZONE = "Asia/Kolkata";
const DEFAULT_REFRESH_HOUR = 12;

// Get the user's region preference
async function getUserRegionPreference(): Promise<RegionPreference> {
  try {
    const stored = await AsyncStorage.getItem(REGION_PREFERENCES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      region: DEFAULT_REGION,
      timezone: DEFAULT_TIMEZONE,
      refreshHour: DEFAULT_REFRESH_HOUR,
    };
  } catch (error) {
    console.error("Error getting region preference:", error);
    return {
      region: DEFAULT_REGION,
      timezone: DEFAULT_TIMEZONE,
      refreshHour: DEFAULT_REFRESH_HOUR,
    };
  }
}

// Calculate the next refresh time based on timezone and refresh hour
function calculateNextRefreshTime(timezone: string, refreshHour: number): Date {
  try {
    const now = new Date();

    // Get current date string in the user's timezone
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    });

    // Parse the timezone date string
    const dateString = formatter.format(now);
    const [datePart, timePart] = dateString.split(", ");
    const [month, day, year] = datePart.split("/");
    const [hour] = timePart.split(":");

    // Create a date object for today's refresh time in the timezone
    const todayRefresh = new Date();
    todayRefresh.setFullYear(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day)
    );
    todayRefresh.setHours(refreshHour, 0, 0, 0);

    // Determine if we need to use today or tomorrow
    const useDate =
      parseInt(hour) >= refreshHour
        ? new Date(todayRefresh.getTime() + 24 * 60 * 60 * 1000) // tomorrow
        : todayRefresh; // today

    return useDate;
  } catch (error) {
    console.error("Error calculating refresh time:", error);
    // Fallback: 24 hours from now
    const fallback = new Date();
    fallback.setHours(fallback.getHours() + 24);
    return fallback;
  }
}

export async function fetchPromptOfTheDay(forceRefresh: boolean = false) {
  try {
    // If forceRefresh is true, skip checking local storage and get a new prompt
    if (forceRefresh) {
      console.log("Force refresh enabled. Fetching a new prompt.");
      return await selectNewPrompt();
    }

    // Otherwise, check if a prompt is already stored and not expired
    const storedData = await getStoredPrompt();

    if (storedData) {
      const now = new Date();
      const expiryTime = new Date(storedData.expiresAt);

      if (now < expiryTime) {
        const timeRemaining = calculateTimeRemaining(expiryTime);
        return {
          prompt: storedData.prompt,
          expiresAt: storedData.expiresAt,
          selectedAt: storedData.selectedAt, // Include selectedAt
          timeRemaining: timeRemaining,
          isNewPrompt: false,
        };
      }
    }

    // Fetch a new one if expired or not available
    return await selectNewPrompt();
  } catch (error) {
    console.error("Error in fetchPromptOfTheDay:", error);
    throw error;
  }
}

async function getStoredPrompt(): Promise<StoredPromptData | null> {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error("Error reading stored prompt:", error);
    return null;
  }
}

async function storePromptData(data: StoredPromptData): Promise<void> {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error("Error storing prompt data:", error);
  }
}

async function getPermanentlyUsedPromptIds(): Promise<string[]> {
  try {
    const jsonValue = await AsyncStorage.getItem(USED_PROMPTS_KEY);
    const usedPrompts: UsedPromptsData = jsonValue
      ? JSON.parse(jsonValue)
      : { usedPromptIds: [] };
    return usedPrompts.usedPromptIds;
  } catch (error) {
    console.error("Error reading used prompt IDs:", error);
    return [];
  }
}

async function storePermanentlyUsedPromptId(promptId: string): Promise<void> {
  try {
    const usedPromptIds = await getPermanentlyUsedPromptIds();

    // Add new ID, ensuring no duplicates
    const updatedUsedPromptIds = [...new Set([...usedPromptIds, promptId])];

    const jsonValue = JSON.stringify({ usedPromptIds: updatedUsedPromptIds });
    await AsyncStorage.setItem(USED_PROMPTS_KEY, jsonValue);
  } catch (error) {
    console.error("Error storing used prompt ID:", error);
  }
}

async function selectNewPrompt() {
  try {
    // Get user's region preference for timezone-based expiry
    const { timezone, refreshHour } = await getUserRegionPreference();

    // Calculate next refresh time based on user's timezone preference
    const expiryTime = calculateNextRefreshTime(timezone, refreshHour);

    // Store current time as selection time
    const selectedAt = new Date().toISOString();

    // Get permanently used prompt IDs
    const usedPromptIds = await getPermanentlyUsedPromptIds();

    // Get active prompts, excluding permanently used ones
    let query = supabase.from("prompts").select("*").eq("active", true);

    // Only add the 'not in' clause if we have used prompts
    if (usedPromptIds.length > 0) {
      query = query.not("id", "in", `(${usedPromptIds.join(",")})`);
    }

    const { data, error } = await query.limit(50);

    if (error) throw error;

    if (!data || data.length === 0) {
      // Return placeholder message instead of throwing error
      return {
        prompt: {
          id: "placeholder",
          text: "Please wait, we're working on fresh new prompts for you!",
          active: true,
          created_at: new Date().toISOString(),
        },
        expiresAt: expiryTime.toISOString(),
        selectedAt: selectedAt, // Include selection time
        timeRemaining: calculateTimeRemaining(expiryTime),
        isNewPrompt: false,
        isPlaceholder: true,
      };
    }

    // Select a random prompt
    const randomIndex = Math.floor(Math.random() * data.length);
    const randomPrompt = data[randomIndex];

    // Store the new prompt data with timezone-based expiration
    const promptData = {
      prompt: randomPrompt,
      expiresAt: expiryTime.toISOString(),
      selectedAt: selectedAt, // Use current time as selection time
    };

    // Store the prompt and mark it as permanently used
    await Promise.all([
      storePromptData(promptData),
      storePermanentlyUsedPromptId(randomPrompt.id),
    ]);

    const timeRemaining = calculateTimeRemaining(expiryTime);

    return {
      prompt: randomPrompt,
      expiresAt: expiryTime.toISOString(),
      selectedAt: selectedAt, // Include selection time
      timeRemaining: timeRemaining,
      isNewPrompt: true,
    };
  } catch (error) {
    console.error("Error in selectNewPrompt:", error);
    throw error;
  }
}

function calculateTimeRemaining(expiryTime: Date): string {
  const now = new Date();
  const diffMs = expiryTime.getTime() - now.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const hours = Math.floor(diffSecs / 3600);
  const minutes = Math.floor((diffSecs % 3600) / 60);
  const seconds = diffSecs % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}
