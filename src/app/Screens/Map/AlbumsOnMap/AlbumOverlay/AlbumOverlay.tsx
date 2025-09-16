// AlbumOverlay.tsx - Updated with replay functionality
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Video, AVPlaybackStatus, Audio } from 'expo-av';
import { getMediaUrl } from '../../utils';
import StripContent from './StripContent';

const { width: W, height: H } = Dimensions.get('window');

interface MediaItem {
  url: string;
  type: 'photo' | 'video';
  caption?: string;
}

interface AlbumData {
  name: string;
  location_name?: string;
  created_at: string;
  description?: string;
  album_media?: Array<{
    media_url: string;
    media_type: 'photo' | 'video';
    caption?: string;
  }>;
  preview_media?: MediaItem[];
}

interface AlbumOverlayProps {
  album: AlbumData | null;
  visible: boolean;
  onClose: () => void;
}

const AlbumOverlay: React.FC<AlbumOverlayProps> = ({ album, visible, onClose }) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [hasFinished, setHasFinished] = useState<boolean>(false); // ✅ Track if video finished
  const videoRef = useRef<Video | null>(null);

  // Audio setup
  useEffect(() => {
    if (!visible) return;

    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
        });
      } catch (error) {
        console.error('Audio setup error:', error);
      }
    };
    
    setupAudio();
  }, [visible]);

  // ✅ ENHANCED PLAY/PAUSE WITH REPLAY FUNCTIONALITY
  const togglePlayPause = useCallback(async () => {
    if (!videoRef.current) return;
    
    try {
      if (hasFinished) {
        // ✅ REPLAY: Reset to beginning and play
        await videoRef.current.replayAsync();
        setHasFinished(false);
        setCurrentTime(0);
      } else if (isPlaying) {
        // Pause
        await videoRef.current.pauseAsync();
      } else {
        // Play
        await videoRef.current.playAsync();
      }
    } catch (error) {
      console.error('Video control error:', error);
    }
  }, [isPlaying, hasFinished]);

  const toggleMute = useCallback(async () => {
    if (!videoRef.current) return;
    
    try {
      await videoRef.current.setIsMutedAsync(!isMuted);
      setIsMuted(!isMuted);
    } catch (error) {
      console.error('Mute toggle error:', error);
    }
  }, [isMuted]);

  // ✅ ENHANCED VIDEO STATUS HANDLER WITH FINISH DETECTION
  const handleVideoStatus = useCallback((status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying || false);
      setCurrentTime(status.positionMillis || 0);
      setDuration(status.durationMillis || 0);
      
      // ✅ CHECK IF VIDEO HAS FINISHED
      if (status.didJustFinish && !status.isLooping) {
        setHasFinished(true);
        setIsPlaying(false);
      }
    }
  }, []);

  // ✅ RESET FINISH STATE WHEN SWITCHING VIDEOS
  const handleSelection = useCallback((index: number) => {
    setSelectedIndex(index);
    setCurrentTime(0);
    setDuration(0);
    setHasFinished(false); // Reset finish state
    if (videoRef.current && isPlaying) {
      videoRef.current.pauseAsync();
    }
  }, [isPlaying]);

  // Format time helper
  const formatTime = useCallback((milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // ✅ GET PLAY BUTTON ICON
  const getPlayButtonIcon = (): string => {
    if (hasFinished) return 'replay';
    return isPlaying ? 'pause' : 'play-arrow';
  };

  if (!album) return null;

  const media: MediaItem[] = album.album_media?.length
    ? album.album_media.map((m) => ({
        url: m.media_url,
        type: m.media_type,
        caption: m.caption,
      }))
    : album.preview_media || [];

  const currentMedia = media[selectedIndex];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        <SafeAreaView style={styles.container}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <MaterialIcons name="collections" size={20} color="#fff" />
              <Text style={styles.title} numberOfLines={2}>{album.name}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Main Media */}
          <View style={styles.mainContainer}>
            {currentMedia?.type === 'video' ? (
              <View style={styles.videoContainer}>
                <Video
                  ref={videoRef}
                  source={{ uri: getMediaUrl(currentMedia.url) }}
                  style={styles.mainMedia}
                  useNativeControls={false}
                  resizeMode="cover"
                  shouldPlay={false}
                  isLooping={false}
                  isMuted={isMuted}
                  onPlaybackStatusUpdate={handleVideoStatus}
                />
                
                {/* Timeline - Top Right */}
                {duration > 0 && (
                  <View style={styles.timeline}>
                    <Text style={styles.timelineText}>
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </Text>
                  </View>
                )}

                {/* ✅ REPLAY INDICATOR WHEN FINISHED */}
                {hasFinished && (
                  <View style={styles.replayOverlay}>
                    <View style={styles.replayIndicator}>
                      <MaterialIcons name="replay" size={64} color="rgba(255,255,255,0.9)" />
                      <Text style={styles.replayText}>Tap to replay</Text>
                    </View>
                  </View>
                )}

                {/* Controls - Bottom */}
                <View style={styles.videoControls}>
                  <TouchableOpacity 
                    style={styles.playButton} 
                    onPress={togglePlayPause}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                  >
                    <MaterialIcons
                      name={getPlayButtonIcon()}
                      size={44}
                      color="#fff"
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.muteButton} 
                    onPress={toggleMute}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                  >
                    <MaterialIcons
                      name={isMuted ? 'volume-off' : 'volume-up'}
                      size={28}
                      color="#fff"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Image
                source={{ uri: getMediaUrl(currentMedia?.url || '') }}
                style={styles.mainMedia}
                resizeMode="cover"
              />
            )}
          </View>

          {/* Strip */}
          <StripContent
            media={media}
            selectedIndex={selectedIndex}
            onSelect={handleSelection}
          />

          {/* Description */}
          {album.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.description}>{album.description}</Text>
            </View>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.97)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    marginLeft: 8,
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  mainMedia: {
    width: W * 0.98,
    height: H * 0.68,
    borderRadius: 16,
  },
  videoContainer: {
    position: 'relative',
  },
  timeline: {
    position: 'absolute',
    top: 15,
    right: 15,
    // backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  timelineText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  // ✅ REPLAY OVERLAY
  replayOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 16,
  },
  replayIndicator: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  replayText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  videoControls: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  playButton: {
    marginLeft: -5,
  },
  muteButton: {
    marginRight: 0,
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  description: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default AlbumOverlay;
