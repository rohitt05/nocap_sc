import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    FlatList
} from 'react-native';
import { Entypo } from '@expo/vector-icons'; // Import Entypo icons
import { Response } from '../../../../../API/fetchArchives';
import { renderMemoryContent } from './utils/memoryContentUtils'; // Update path as needed
import { styles } from './styles';

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
    const flatListRef = useRef<FlatList>(null);

    // Format date components in the new format: "Mar 17, 2025 : timestamp"
    const formatDateWithTime = (date: Date, timestamp: string) => {
        const options = { month: 'short' as const };
        const month = date.toLocaleString('en-US', options);
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month} ${day}, ${year} : ${timestamp}`;
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

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <View style={styles.dateContainer}>
                    <Text style={styles.dateText}>
                        {formatDateWithTime(selectedDate, getCurrentTimestamp())}
                    </Text>
                </View>
                <View style={styles.iconContainer}>
                    <Entypo name="pin" size={24} color="white" />
                </View>
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