// constants.ts
export const EMOJI_MAP: Record<string, string> = {
  fire: "🔥",
  skull: "💀",
  "holding-hands": "🫶🏻",
  crying: "😭",
  "dotted-face": "🫥",
  tongue: "👅",
};

export const CONTENT_TYPE_EMOJI: Record<string, string> = {
  text: "💬",
  image: "📸",
  video: "🎬",
  audio: "🎵",
  gif: "🎞️",
};

export const REACTION_IMAGE_MAP: Record<string, any> = {
  wtf: require("../../../../components/responses/components/ReactionText/images/wtf.png"),
  bruhh: require("../../../../components/responses/components/ReactionText/images/bruh.png"),
  spilled: require("../../../../components/responses/components/ReactionText/images/spilled.png"),
  delulu: require("../../../../components/responses/components/ReactionText/images/delulu.png"),
  sus: require("../../../../components/responses/components/ReactionText/images/sus.png"),
  "shit's real": require("../../../../components/responses/components/ReactionText/images/shit.png"),
};
