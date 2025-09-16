// HorizontalStoryList.tsx - FINAL, WITH SUPPORT FOR final_longitude / final_latitude FIELDS

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, ImageBackground, Modal, Alert } from 'react-native';
import Video from 'react-native-video';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, AntDesign, Entypo } from '@expo/vector-icons';
import { formatDate } from '../utils';
import { ActivityLocation } from '../types';
import { horizontalStoryStyles as styles } from './HorizontalStoryStyles';
import { supabase } from '../../../../../../lib/supabase';

type ExtendedActivityLocation = ActivityLocation & {
  signedUrl?: string;
  mediaItems?: any[];
  longitude?: number | string;
  latitude?: number | string;
  final_longitude?: number | string;
  final_latitude?: number | string;
};

interface HorizontalStoryListProps {
  stories: ExtendedActivityLocation[];
  onViewOnMap: (coordinates: [number, number]) => void;
  onStoriesUpdate?: (updatedStories: ExtendedActivityLocation[]) => void;
  isOwnProfile?: boolean;
}

const VideoPlayer = React.memo<{
  item: any;
  isPlaying: boolean;
  onLoad: () => void;
  onError: (error: any) => void;
}>(({ item, isPlaying, onLoad, onError }) => {
  const videoRef = useRef<any>(null);
  return (
    <Video
      ref={videoRef}
      source={{ uri: item.signedUrl }}
      style={styles.fullSizeVideo}
      resizeMode="cover"
      paused={!isPlaying}
      repeat={true}
      muted={true}
      onLoad={onLoad}
      onError={onError}
      poster={item.signedUrl}
      posterResizeMode="cover"
    />
  );
});

const HorizontalStoryList: React.FC<HorizontalStoryListProps> = ({
  stories,
  onViewOnMap,
  onStoriesUpdate,
  isOwnProfile = false,
}) => {
  const [expandedAlbums, setExpandedAlbums] = useState<Set<string>>(new Set());
  const [viewedSingleAlbums, setViewedSingleAlbums] = useState<Set<string>>(new Set());
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  const [deleteMenuVisible, setDeleteMenuVisible] = useState<boolean>(false);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);

  const EXACT_REFERENCE_STACK_TRANSFORMS = [
    { rotate: '8deg', translateX: 12, translateY: -8 },
    { rotate: '-10deg', translateX: -14, translateY: -8 },
    { rotate: '6deg', translateX: 8, translateY: -5 },
    { rotate: '-6deg', translateX: -8, translateY: -5 },
    { rotate: '4deg', translateX: 5, translateY: -3 },
    { rotate: '-4deg', translateX: -5, translateY: -3 },
  ];

  const toggleAlbumExpansion = useCallback((albumId: string) => {
    setExpandedAlbums(prev => {
      const newSet = new Set(prev);
      if (newSet.has(albumId)) {
        newSet.delete(albumId);
        setCurrentlyPlaying(null);
      } else {
        newSet.add(albumId);
      }
      return newSet;
    });
  }, []);

  const toggleSingleAlbumView = useCallback((albumId: string) => {
    setViewedSingleAlbums(prev => {
      const newSet = new Set(prev);
      if (newSet.has(albumId)) {
        newSet.delete(albumId);
        setCurrentlyPlaying(null);
      } else {
        newSet.add(albumId);
      }
      return newSet;
    });
  }, []);

  const openDeleteMenu = useCallback((mediaId: string, albumId: string) => {
    setSelectedMediaId(mediaId);
    setSelectedAlbumId(albumId);
    setDeleteMenuVisible(true);
  }, []);

  const closeDeleteMenu = useCallback(() => {
    setDeleteMenuVisible(false);
    setSelectedMediaId(null);
    setSelectedAlbumId(null);
  }, []);

  const confirmDelete = useCallback(() => {
    Alert.alert(
      'Delete Media',
      'Are you sure you want to permanently delete this item from the album? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel', onPress: closeDeleteMenu },
        { text: 'Delete', style: 'destructive', onPress: deleteMediaItem }
      ],
      { cancelable: true }
    );
  }, [selectedMediaId]);

  const deleteMediaItem = useCallback(async () => {
    if (!selectedMediaId || !selectedAlbumId) return;
    try {
      const { error } = await supabase
        .from('album_media')
        .delete()
        .eq('id', selectedMediaId);

      if (error) {
        console.error('Delete error:', error);
        Alert.alert('Error', 'Failed to delete media item. Please try again.');
        return;
      }

      const updatedStories = stories.map(album => {
        if (album.id === selectedAlbumId) {
          const updatedMediaItems = (album.mediaItems || []).filter(
            media => media.id !== selectedMediaId
          );
          return { ...album, mediaItems: updatedMediaItems, photoCount: updatedMediaItems.length };
        }
        return album;
      }).filter(album => {
        return (album.mediaItems && album.mediaItems.length > 0) || !album.mediaItems;
      });

      if (onStoriesUpdate) {
        onStoriesUpdate(updatedStories);
      }

      if (currentlyPlaying && currentlyPlaying.includes(selectedMediaId)) {
        setCurrentlyPlaying(null);
      }

      setViewedSingleAlbums(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedAlbumId);
        return newSet;
      });

      Alert.alert('Success', 'Media item has been deleted from the album.');
    } catch (error) {
      console.error('Unexpected delete error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      closeDeleteMenu();
    }
  }, [selectedMediaId, selectedAlbumId, stories, onStoriesUpdate, currentlyPlaying]);

  // AUTO-PLAY: Track visible items and auto-play videos
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    const visibleVideoItem = viewableItems.find((viewableItem: any) => {
      const item = viewableItem.item;
      const isVideo = item.mediaData?.mediaType === 'video' || item.type === 'video';
      return isVideo && viewableItem.isViewable;
    });

    if (visibleVideoItem) {
      setCurrentlyPlaying(visibleVideoItem.item.id);
    } else {
      setCurrentlyPlaying(null);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
    minimumViewTime: 500,
  }).current;

  const flattenedData = useMemo(() => {
    const result: any[] = [];
    stories.forEach(album => {
      const isExpanded = expandedAlbums.has(album.id);
      const isViewed = viewedSingleAlbums.has(album.id);
      const mediaItems = album.mediaItems || [];
      const hasMultipleItems = mediaItems.length > 1;
      const hasSingleItem = mediaItems.length === 1;

      if (isExpanded && hasMultipleItems) {
        mediaItems.forEach((media, index) => {
          result.push({
            ...album,
            id: `${album.id}-${media.id}`,
            mediaUrl: media.mediaUrl,
            signedUrl: media.mediaUrl,
            isExpandedItem: true,
            originalAlbumId: album.id,
            mediaIndex: index,
            mediaData: media,
          });
        });
      } else if (isViewed && hasSingleItem) {
        const singleMedia = mediaItems[0];
        result.push({
          ...album,
          id: album.id,
          mediaUrl: singleMedia.mediaUrl,
          signedUrl: singleMedia.mediaUrl,
          isSingleItemView: true,
          mediaData: singleMedia,
        });
      } else {
        result.push({ ...album, isExpandedItem: false });
      }
    });
    return result;
  }, [stories, expandedAlbums, viewedSingleAlbums]);

  // Helper: get coordinate (try final first, then fallback)
  const parseCoord = (val: any): number => typeof val === "number" ? val : parseFloat(val);

  const renderItem = useCallback(({ item }: { item: any }) => {
    const isCurrentlyPlaying = currentlyPlaying === item.id;
    const isVideo = item.mediaData?.mediaType === 'video' || item.type === 'video';

    // Expanded or single-item view: Show "View on Map" for each media (parse/validate)
    if (item.isExpandedItem || item.isSingleItemView) {
      const longitude = parseCoord(
        item.mediaData?.final_longitude ?? item.mediaData?.longitude ?? item.final_longitude ?? item.longitude
      );
      const latitude = parseCoord(
        item.mediaData?.final_latitude ?? item.mediaData?.latitude ?? item.final_latitude ?? item.latitude
      );
      const hasCoords = !isNaN(longitude) && !isNaN(latitude);

      return (
        <View style={[styles.expandedItemContainer, { overflow: 'visible' }]}>
          <View style={styles.fullMediaContainer}>
            {isVideo ? (
              <VideoPlayer
                item={item}
                isPlaying={isCurrentlyPlaying}
                onLoad={() => console.log('Video loaded:', item.id)}
                onError={(error) => console.error('Video error:', error)}
              />
            ) : (
              <ImageBackground
                source={{ uri: item.signedUrl }}
                style={styles.fullSizeImage}
                resizeMode="cover"
                imageStyle={styles.fullImageStyle}
              />
            )}

            <TouchableOpacity
              style={styles.closeButtonOverlay}
              onPress={() => {
                if (item.isSingleItemView) {
                  toggleSingleAlbumView(item.id);
                } else {
                  toggleAlbumExpansion(item.originalAlbumId);
                }
              }}>
              <AntDesign name="closecircleo" size={20} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.detailsSectionBelow}>
            <View style={styles.detailsTextSection}>
              <Text style={styles.detailsTitle} numberOfLines={1}>
                {item.albumTitle || item.title || item.name}
              </Text>
              <Text style={styles.detailsDate}>
                {formatDate(new Date(item.mediaData.createdAt).getTime())}
              </Text>
              {item.mediaData.caption && (
                <Text style={styles.detailsCaption} numberOfLines={2}>
                  {item.mediaData.caption}
                </Text>
              )}
            </View>

            {hasCoords && (
              <TouchableOpacity
                style={styles.viewOnMapButton}
                onPress={e => {
                  e.stopPropagation();
                  onViewOnMap([longitude, latitude]);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.viewOnMapText}>View on Map</Text>
              </TouchableOpacity>
            )}

            {isOwnProfile && (
              <TouchableOpacity
                style={styles.menuButtonBelow}
                onPress={() => {
                  const albumId = item.isSingleItemView ? item.id : item.originalAlbumId;
                  openDeleteMenu(item.mediaData.id, albumId);
                }}
                activeOpacity={0.7}
              >
                <Entypo name="dots-three-vertical" size={18} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    }

    // Collapsed album stack (with coordinate checks)
    const mediaItems = item.mediaItems || [];
    const hasMultipleItems = mediaItems.length > 1;
    const hasSingleItem = mediaItems.length === 1;
    const stackCount = Math.min(mediaItems.length, 6);

    // Use final_longitude/final_latitude first (from view), else fallback to longitude/latitude
    const longitude = parseCoord(item.final_longitude ?? item.longitude);
    const latitude = parseCoord(item.final_latitude ?? item.latitude);
    const collapsedHasCoords = !isNaN(longitude) && !isNaN(latitude);

    return (
      <View style={[styles.albumStackContainer, { overflow: 'visible' }]}>
        {hasMultipleItems && Array.from({ length: stackCount - 1 }, (_, index) => {
          const stackIndex = stackCount - 2 - index;
          const mediaItem = mediaItems[stackIndex + 1];
          const transform = EXACT_REFERENCE_STACK_TRANSFORMS[index] ||
            EXACT_REFERENCE_STACK_TRANSFORMS[index % EXACT_REFERENCE_STACK_TRANSFORMS.length];
          return (
            <View
              key={`stack-${index}`}
              style={[
                styles.stackBackgroundCard,
                {
                  transform: [
                    { translateX: transform.translateX },
                    { translateY: transform.translateY },
                    { rotate: transform.rotate },
                    { scale: 1 - (index + 1) * 0.008 },
                  ],
                  zIndex: 100 - index,
                  elevation: 20 - index,
                  opacity: 1 - (index + 1) * 0.06,
                  overflow: 'visible',
                }
              ]}
            >
              <ImageBackground
                source={{ uri: mediaItem?.mediaUrl || item.mediaUrl }}
                style={styles.stackCardImage}
                imageStyle={styles.stackCardImageStyle}
                resizeMode="cover"
              />
            </View>
          );
        })}

        <TouchableOpacity
          style={[
            styles.storyItem,
            hasMultipleItems ?
              [styles.mainStackCard, { zIndex: 200, elevation: 25, overflow: 'visible' }] :
              [styles.singleItemCard, { zIndex: 150, elevation: 20, overflow: 'visible' }]
          ]}
          onPress={() => {
            if (hasMultipleItems) {
              toggleAlbumExpansion(item.id);
            } else if (hasSingleItem) {
              toggleSingleAlbumView(item.id);
            }
          }}
          activeOpacity={0.9}
        >
          {item.type === 'video' && !hasMultipleItems ? (
            <VideoPlayer
              item={item}
              isPlaying={isCurrentlyPlaying}
              onLoad={() => console.log('Album video loaded:', item.id)}
              onError={(error) => console.error('Album video error:', error)}
            />
          ) : (
            <ImageBackground
              source={{ uri: item.signedUrl || item.mediaUrl }}
              style={styles.storyImageBackground}
              resizeMode="cover"
              imageStyle={styles.storyImageStyle}
            />
          )}

          <LinearGradient
            colors={['rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.0)']}
            locations={[0, 0.25, 0.5, 1.0]}
            style={styles.gradientOverlay}
            pointerEvents="box-none"
          >
            <View style={styles.stackedAlbumInfo}>
              <Text style={styles.stackedAlbumName} numberOfLines={2}>
                {item.title || item.name}
              </Text>
            </View>

            {hasSingleItem && collapsedHasCoords && (
              <TouchableOpacity
                style={styles.viewOnMapButton}
                onPress={e => {
                  e.stopPropagation();
                  onViewOnMap([longitude, latitude]);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.viewOnMapText}>View on Map</Text>
              </TouchableOpacity>
            )}

            {hasMultipleItems && (
              <View style={styles.tapHint}>
                <MaterialIcons name="touch-app" size={16} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.tapHintText}>Tap to expand</Text>
              </View>
            )}

            {hasSingleItem && (
              <View style={styles.tapHint}>
                <MaterialIcons name="visibility" size={16} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.tapHintText}>Tap to view</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }, [currentlyPlaying, toggleAlbumExpansion, toggleSingleAlbumView, onViewOnMap, openDeleteMenu, isOwnProfile]);

  const keyExtractor = useCallback((item: any) => item.id, []);
  const getItemLayout = useCallback((data: any, index: number) => ({
    length: 375,
    offset: 375 * index,
    index,
  }), []);

  return (
    <View style={[styles.storiesSection, { overflow: 'visible', paddingTop: 20 }]}>
      <Text style={styles.storiesTitle}>
        {stories.length} Album{stories.length !== 1 ? 's' : ''}
      </Text>

      {flattenedData.length > 0 ? (
        <FlatList
          data={flattenedData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.horizontalScrollContent,
            {
              overflow: 'visible',
              paddingTop: 40,
              paddingBottom: 40,
              minHeight: 540,
            }
          ]}
          style={[
            styles.horizontalScroll,
            {
              overflow: 'visible',
              minHeight: 540,
              zIndex: 1,
            }
          ]}
          removeClippedSubviews={false}
          snapToInterval={375}
          snapToAlignment="start"
          decelerationRate="fast"
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          initialNumToRender={3}
          maxToRenderPerBatch={5}
          windowSize={10}
          updateCellsBatchingPeriod={50}
          onEndReachedThreshold={0.5}
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialIcons name="photo-library" size={64} color="rgba(255, 255, 255, 0.3)" />
          <Text style={styles.emptyStateText}>No albums found.</Text>
        </View>
      )}

      {isOwnProfile && (
        <Modal
          visible={deleteMenuVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={closeDeleteMenu}
        >
          <View style={styles.deleteModalOverlay}>
            <View style={styles.deleteModalContent}>
              <Text style={styles.deleteModalTitle}>Delete Media</Text>
              <Text style={styles.deleteModalMessage}>
                Are you sure you want to permanently delete this item from the album? This action cannot be undone.
              </Text>
              <View style={styles.deleteModalButtons}>
                <TouchableOpacity
                  style={[styles.deleteModalButton, styles.cancelButton]}
                  onPress={closeDeleteMenu}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.deleteModalButton, styles.deleteButton]}
                  onPress={confirmDelete}
                  activeOpacity={0.7}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default HorizontalStoryList;
