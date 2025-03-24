import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    FlatList,
    Alert
} from 'react-native';
import { Entypo } from '@expo/vector-icons'; // Import Entypo icons
import { Response } from '../../../../../API/fetchArchives';
import { renderMemoryContent } from './utils/memoryContentUtils'; // Update path as needed
import { styles } from './styles';
import { supabase } from '../../../../../lib/supabase'; // Import supabase client

interface MemoryContainerProps {
    selectedDate: Date;
    formatDate: (date: Date) => string;
    memories: Response[];
    loading: boolean;
}

const { width } = Dimensions.get('window');
// Full width for each item
const ITEM_WIDTH = width;


const MemoryContainer: React.FC<MemoryContainerProps> = ({
    selectedDate,
    formatDate,
    memories,
    loading
}) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [pinnedStatus, setPinnedStatus] = useState<{ [key: string]: boolean }>({});
    const [isPinning, setIsPinning] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    // Format date components in the new format: "Mar 17, 2025 : timestamp"
    const formatDateWithTime = (date: Date, timestamp: string) => {
        const options = { month: 'short' as const };
        const month = date.toLocaleString('en-US', options);
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month} ${day}, ${year} : ${timestamp}`;
    };

    // Check if current memory is pinned when activeIndex changes
    useEffect(() => {
        if (memories.length > 0 && activeIndex >= 0 && activeIndex < memories.length) {
            checkIfPinned(memories[activeIndex].id);
        }
    }, [activeIndex, memories]);

    // Check if a response is already pinned by the current user
    const checkIfPinned = async (responseId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            const { data, error } = await supabase
                .from('pinned_responses')
                .select('*')
                .eq('user_id', user.id)
                .eq('response_id', responseId)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
                console.error('Error checking pinned status:', error);
                return;
            }

            // Update the pin status for this response
            setPinnedStatus(prev => ({
                ...prev,
                [responseId]: !!data
            }));
        } catch (err) {
            console.error('Error in checkIfPinned:', err);
        }
    };

    // Toggle pin/unpin for current memory
    const togglePin = async () => {
        if (memories.length === 0 || isPinning) return;

        const currentMemory = memories[activeIndex];
        setIsPinning(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                Alert.alert('Error', 'You must be logged in to pin memories');
                setIsPinning(false);
                return;
            }

            const isPinned = pinnedStatus[currentMemory.id];

            if (isPinned) {
                // Unpin the memory
                const { error } = await supabase
                    .from('pinned_responses')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('response_id', currentMemory.id);

                if (error) {
                    throw error;
                }

                Alert.alert('Success', 'Memory unpinned from your profile');
            } else {
                // Pin the memory
                const { error } = await supabase
                    .from('pinned_responses')
                    .insert({
                        user_id: user.id,
                        response_id: currentMemory.id
                    });

                if (error) {
                    throw error;
                }

                Alert.alert('Success', 'Memory pinned to your profile');
            }

            // Update state to reflect the new pin status
            setPinnedStatus(prev => ({
                ...prev,
                [currentMemory.id]: !isPinned
            }));
        } catch (err) {
            console.error('Error toggling pin status:', err);
            Alert.alert('Error', 'Failed to update pin status');
        } finally {
            setIsPinning(false);
        }
    };

    // Handle scroll end to ensure proper snap alignment
    const handleScrollEnd = (event: any) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const newIndex = Math.round(contentOffsetX / ITEM_WIDTH);
        setActiveIndex(newIndex);

        // Ensure proper alignment by scrolling to the exact position
        if (contentOffsetX % ITEM_WIDTH !== 0) {
            flatListRef.current?.scrollToIndex({
                index: newIndex,
                animated: true,
                viewPosition: 0, // Ensures alignment at the start of the view
            });
        }
    };

    // Render each memory item
    const renderItem = ({ item }: { item: Response; index: number }) => {
        return (
            <View style={styles.carouselItem}>
                <View style={styles.carouselItemContent}>
                    {renderMemoryContent(item)}
                </View>
            </View>
        );
    };

    // Render pagination dots - only if there's more than one memory
    const renderPagination = () => {
        if (memories.length <= 1) return null;

        return (
            <View style={styles.paginationContainer}>
                {memories.map((_, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.paginationDot,
                            index === activeIndex && styles.paginationDotActive
                        ]}
                        onPress={() => {
                            setActiveIndex(index);
                            flatListRef.current?.scrollToIndex({
                                index,
                                animated: true,
                                viewPosition: 0,
                            });
                        }}
                    />
                ))}
            </View>
        );
    };

    // Render navigation controls - only if there's more than one memory
    const renderNavigation = () => {
        if (memories.length <= 1) return null;

        return (
            <View style={styles.navigationContainer}>
                <TouchableOpacity
                    style={[styles.navButton, activeIndex === 0 && styles.navButtonDisabled]}
                    disabled={activeIndex === 0}
                    onPress={() => {
                        const newIndex = activeIndex - 1;
                        setActiveIndex(newIndex);
                        flatListRef.current?.scrollToIndex({
                            index: newIndex,
                            animated: true,
                            viewPosition: 0,
                        });
                    }}
                >
                    <Entypo name="chevron-left" size={24} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.navButton, activeIndex === memories.length - 1 && styles.navButtonDisabled]}
                    disabled={activeIndex === memories.length - 1}
                    onPress={() => {
                        const newIndex = activeIndex + 1;
                        setActiveIndex(newIndex);
                        flatListRef.current?.scrollToIndex({
                            index: newIndex,
                            animated: true,
                            viewPosition: 0,
                        });
                    }}
                >
                    <Entypo name="chevron-right" size={24} color="#fff" />
                </TouchableOpacity>
            </View>
        );
    };

    // Get timestamp for current memory
    const getCurrentTimestamp = () => {
        if (memories.length === 0) return "";
        return new Date(memories[activeIndex]?.created_at || Date.now()).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get the currently active memory
    const getCurrentMemory = () => {
        if (memories.length === 0) return null;
        return memories[activeIndex];
    };

    // Determine pin icon color based on pinned status
    const getPinIconColor = () => {
        const currentMemory = getCurrentMemory();
        if (!currentMemory) return "white";

        return pinnedStatus[currentMemory.id] ? "#0f48a3" : "white"; // Gold color when pinned
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <View style={styles.dateContainer}>
                    <Text style={styles.dateText}>
                        {formatDateWithTime(selectedDate, getCurrentTimestamp())}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.iconContainer}
                    onPress={togglePin}
                    disabled={memories.length === 0 || isPinning}
                >
                    <Entypo name="pin" size={24} color={getPinIconColor()} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading memories...</Text>
                </View>
            ) : memories.length > 0 ? (
                <View style={styles.contentContainer}>
                    <FlatList
                        ref={flatListRef}
                        data={memories}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        pagingEnabled={true}
                        snapToInterval={width} // Ensures each item snaps to exact width
                        snapToAlignment="start" // Aligns the snap points to the start
                        decelerationRate="fast" // Faster deceleration for better snapping
                        onMomentumScrollEnd={handleScrollEnd}
                        getItemLayout={(data, index) => ({
                            length: width,
                            offset: width * index,
                            index,
                        })}
                        contentContainerStyle={styles.flatListContent}
                        scrollEventThrottle={16}
                    />
                </View>
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No memories found for this date</Text>
                </View>
            )}

            {memories.length > 0 && (
                <View style={styles.controlsContainer}>
                    {renderPagination()}
                    {renderNavigation()}
                </View>
            )}
        </View>
    );
};

export default MemoryContainer;