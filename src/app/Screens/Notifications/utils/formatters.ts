// formatters.ts
import { formatDistanceToNow } from "date-fns";
import { EMOJI_MAP, CONTENT_TYPE_EMOJI, REACTION_IMAGE_MAP } from "./constants";
import {
  ReactionNotification,
  CurseNotification,
  FriendResponseNotification,
} from "./types";

export const formatTimestamp = (timestamp: string): string => {
  try {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  } catch {
    return "recently";
  }
};

export const getEmoji = (type: string): string => EMOJI_MAP[type] || "👍";

export const getContentTypeEmoji = (contentType: string): string =>
  CONTENT_TYPE_EMOJI[contentType] || "💬";

export const getReactionImage = (type: string): any =>
  REACTION_IMAGE_MAP[type] || null;

export const getReactionText = (notification: ReactionNotification): string =>
  notification.reaction_count > 1
    ? `reacted ${notification.reaction_count} times on your response`
    : "reacted on your response";

export const getFriendResponseText = (
  notification: FriendResponseNotification
): string => {
  const promptText = notification.prompt_text || "unknown prompt";
  const truncatedPrompt =
    promptText.length > 30 ? `${promptText.substring(0, 30)}...` : promptText;
  return `posted a response to "${truncatedPrompt}"`;
};

export const getCurseNotificationText = (
  notification: CurseNotification
): string =>
  notification.curse_count > 1
    ? `cursed you ${notification.curse_count} times`
    : "cursed you";

    


