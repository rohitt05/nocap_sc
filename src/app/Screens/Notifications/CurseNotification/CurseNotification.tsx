import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  withSpring,
} from 'react-native-reanimated';
import { CurseNotification as CurseNotificationType } from '../utils/types';
import { formatTimestamp, getCurseNotificationText } from '../utils/formatters';
import { Feather } from '@expo/vector-icons';

interface CurseNotificationProps {
  notification: CurseNotificationType;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const EMOJI_CONTAINER_WIDTH = SCREEN_WIDTH - 10;
const EMOJI_CONTAINER_HEIGHT = 80;

const getCurseMessage = (count: number): string => {
  if (count === 1) return "Seems they're missing you lately 💌";
  if (count <= 3) return "Someone's thinking about you constantly 💭";
  if (count <= 5) return "Wow, they really care about you! 💘";
  return "You're definitely on their mind! 🌟";
};

const BouncingEmoji = ({ emoji }: { emoji: string }) => {
  const translateX = useSharedValue(Math.random() * EMOJI_CONTAINER_WIDTH);
  const translateY = useSharedValue(Math.random() * EMOJI_CONTAINER_HEIGHT);
  const velocityX = useSharedValue((Math.random() - 0.5) * 4);
  const velocityY = useSharedValue((Math.random() - 0.5) * 4);

  const animatedStyle = useAnimatedStyle(() => {
    translateX.value += velocityX.value;
    translateY.value += velocityY.value;

    if (translateX.value <= 0 || translateX.value >= EMOJI_CONTAINER_WIDTH) {
      velocityX.value *= -1;
    }
    if (translateY.value <= 0 || translateY.value >= EMOJI_CONTAINER_HEIGHT) {
      velocityY.value *= -1;
    }

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });

  React.useEffect(() => {
    translateX.value = withRepeat(
      withTiming(translateX.value + velocityX.value * 100, {
        duration: 2000,
        easing: Easing.linear,
      }),
      -1,
      true
    );

    translateY.value = withRepeat(
      withTiming(translateY.value + velocityY.value * 100, {
        duration: 2200,
        easing: Easing.linear,
      }),
      -1,
      true
    );
  }, []);

  return (
    <Animated.Text style={[styles.emoji, animatedStyle]}>
      {emoji}
    </Animated.Text>
  );
};

const CurseNotification = ({ notification }: CurseNotificationProps) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const rotate = useSharedValue(0);
  const emojiScale = useSharedValue(1);

  const angryEmojiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emojiScale.value }],
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  const toggleExpand = () => {
    emojiScale.value = withSequence(
      withTiming(1.4, { duration: 100 }),
      withSpring(1, { damping: 3, stiffness: 200 })
    );

    rotate.value = withTiming(isExpanded ? 0 : 180, {
      duration: 300,
      easing: Easing.ease,
    });
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.notificationItem}
        activeOpacity={0.9}
        onPress={toggleExpand}
      >
        <View style={styles.leftSection}>
          <Image
            source={notification.avatar_url
              ? { uri: notification.avatar_url }
              : require('../../../../../assets/hattori.webp')}
            style={styles.avatar}
          />
          <View style={styles.textContainer}>
            <Text style={styles.fullName}>{notification.full_name}</Text>
            <Text style={styles.notificationText}>
              {getCurseNotificationText(notification)}
            </Text>
            {isExpanded && (
              <Text style={styles.sweetNote}>
                {getCurseMessage(notification.curse_count)}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.rightSection}>
          <Text style={styles.timestamp}>{formatTimestamp(notification.created_at)}</Text>
          <View style={styles.iconsContainer}>
            <Animated.Text style={[styles.angryEmoji, angryEmojiStyle]}>
              {notification.curse_count > 3 ? '👿' : '🤬'}
            </Animated.Text>
            <Animated.View style={chevronStyle}>
              <Feather name="chevron-down" size={18} color="#888" />
            </Animated.View>
          </View>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.emojiContainer}>
          {['🤬', '😡', '💢', '👿', '😤'].map((emoji, index) => (
            <BouncingEmoji key={index} emoji={emoji} />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 10,
    // marginHorizontal: ,
    marginBottom: 8,
    padding: 4,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  fullName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  notificationText: {
    color: '#ff4444',
    fontSize: 14,
  },
  sweetNote: {
    color: '#FFD700',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  rightSection: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  timestamp: {
    color: '#666',
    fontSize: 12,
    marginBottom: 4,
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  angryEmoji: {
    fontSize: 20,
  },
  emojiContainer: {
    height: EMOJI_CONTAINER_HEIGHT,
    width: EMOJI_CONTAINER_WIDTH,
    marginTop: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  emoji: {
    fontSize: 24,
    position: 'absolute',
  },
});

export default CurseNotification;