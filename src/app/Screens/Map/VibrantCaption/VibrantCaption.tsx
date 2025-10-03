import React, { useEffect, useState } from 'react';
import { Text, ActivityIndicator } from 'react-native';
import ImageColors from 'react-native-image-colors';

// Local type for Android swatches
type AndroidSwatches = {
  dominant?: string;
  vibrant?: string;
  darkVibrant?: string;
  lightVibrant?: string;
  muted?: string;
  darkMuted?: string;
  lightMuted?: string;
  average?: string;
  platform: 'android';
};

interface VibrantCaptionProps {
  uri: string;
  children: string;
  style?: any;
  mode?: keyof Omit<AndroidSwatches, 'platform'>;
  pick?: (all: AndroidSwatches) => string;
}

const VibrantCaption: React.FC<VibrantCaptionProps> = ({
  uri,
  children,
  style,
  mode = 'vibrant',
  pick,
}) => {
  const [color, setColor] = useState<string>('#fff');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    (async () => {
      try {
        const colors = await ImageColors.getColors(uri, { fallback: '#fff', cache: true });
        console.log('IMG COLORS RESULT:', colors);

        let useColor = '#fff';
        if (colors.platform === 'android') {
          const androidColors = colors as AndroidSwatches;
          if (pick) {
            useColor = pick(androidColors) || '#fff';
          } else {
            useColor =
              androidColors[mode] ||
              androidColors.vibrant ||
              androidColors.dominant ||
              androidColors.average ||
              androidColors.darkVibrant ||
              androidColors.lightVibrant ||
              androidColors.muted ||
              androidColors.darkMuted ||
              androidColors.lightMuted ||
              '#fff';
          }
        } else {
          useColor = '#fff';
        }
        if (isMounted) setColor(useColor);
      } catch {
        if (isMounted) setColor('#fff');
      }
      setLoading(false);
    })();

    return () => {
      isMounted = false;
    };
  }, [uri, mode, pick]);

  if (loading)
    return <ActivityIndicator size="small" color="#fff" style={{ marginTop: 10 }} />;
  return (
    <Text style={[style, { color }]}>{children}</Text>
  );
};

export default VibrantCaption;
