// types.ts
export type BaseNotification = {
  id: string;
  user_id?: string;
  full_name: string;
  username?: string;
  avatar_url: string | null;
  created_at: string;
};

export type FriendRequest = BaseNotification & {
  type: "friend_request";
};

export type ReactionNotification = BaseNotification & {
  response_id: string;
  reaction_type: string;
  reaction_count: number;
  prompt_text: string;
  type: "reaction";
};

export type FriendResponseNotification = BaseNotification & {
  response_id: string;
  prompt_id?: string;
  prompt_text: string;
  content_type: string;
  type: "friend_response";
};

export type CurseNotification = BaseNotification & {
  curse_count: number;
  type: "curse";
};

export type Notification =
  | FriendRequest
  | ReactionNotification
  | FriendResponseNotification
  | CurseNotification;
