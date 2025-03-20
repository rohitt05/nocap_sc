import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MemoryCard from './MemoryCard';
import { useFetchArchives } from '../../../../API/fetchArchives';

const { width } = Dimensions.get('window');

const LastYearTab = () => {
    // Get current date
    const today = new Date();

    // Format date for display (e.g., "March 1")
    const formatDate = (date) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    };

    // Get "On This Day" memories from last year using the custom hook
    const { getOnThisDayMemories, loading, error } = useFetchArchives();
    const [lastYearMemories, setLastYearMemories] = useState([]);

    useEffect(() => {
        // Get all "On This Day" memories
        const allOnThisDayMemories = getOnThisDayMemories(today);

        // Filter to only show memories from exactly one year ago
        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        const oneYearAgoStr = `${oneYearAgo.getFullYear()}-${String(oneYearAgo.getMonth() + 1).padStart(2, '0')}-${String(oneYearAgo.getDate()).padStart(2, '0')}`;

        // Find memories from exactly one year ago
        const memories = allOnThisDayMemories.filter(memory => {
            const memDate = new Date(memory.created_at);
            const memDateStr = `${memDate.getFullYear()}-${String(memDate.getMonth() + 1).padStart(2, '0')}-${String(memDate.getDate()).padStart(2, '0')}`;
            return memDateStr.startsWith(oneYearAgoStr.split('-')[0]); // Match the year
        });

        // Format memories for display
        const formattedMemories = memories.map((memory, index) => {
            const date = new Date(memory.created_at);
            return {
                id: memory.id,
                time: `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`,
                content_type: memory.content_type,
                file_url: memory.file_url,
                text_content: memory.text_content,
                created_at: memory.created_at
            };
        });

        setLastYearMemories(formattedMemories);
    }, []);

    // State for tracking current memory index
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);

    // Check if there are memories
    const hasMemories = lastYearMemories.length > 0;

    // Handle scroll event
    const handleScroll = (event) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const newIndex = Math.floor(contentOffsetX / width);
        if (newIndex !== currentIndex) {
            setCurrentIndex(newIndex);
        }
    };

    // Scroll to a specific index
    const scrollToIndex = (index) => {
        if (flatListRef.current) {
            flatListRef.current.scrollToIndex({
                index,
                animated: true
            });
            setCurrentIndex(index);
        }
    };

    // Get current memory time
    const getCurrentMemory = () => {
        return lastYearMemories[currentIndex] || { time: '' };
    };

    // Get item layout for optimized FlatList scrolling
    const getItemLayout = (_, index) => ({
        length: width,
        offset: width * index,
        index,
    });

    // Calculate the last year date
    const lastYearDate = new Date(today);
    lastYearDate.setFullYear(today.getFullYear() - 1);

    // Show loading state
    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text style={styles.loadingText}>Loading memories...</Text>
            </View>
        );
    }

    // Show error state
    if (error) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text style={styles.errorText}>Failed to load memories</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
        >
            <Text style={styles.title}>Last Year, This Day</Text>
            <Text style={styles.subtitle}>What happened on this day last year</Text>

            {hasMemories ? (
                <View style={styles.memoryContainer}>
                    <View style={styles.headerContainer}>
                        <Text style={styles.dateHeader}>{formatDate(lastYearDate)}</Text>
                        <Text style={styles.memoryTime}>{getCurrentMemory().time}</Text>
                    </View>

                    {/* Memory Carousel */}
                    <FlatList
                        ref={flatListRef}
                        data={lastYearMemories}
                        renderItem={({ item }) => <MemoryCard memory={item} />}
                        keyExtractor={item => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={handleScroll}
                        pagingEnabled
                        decelerationRate="fast"
                        snapToAlignment="start"
                        getItemLayout={getItemLayout}
                        initialScrollIndex={0}
                    />

                    {/* Pagination Dots */}
                    {lastYearMemories.length > 1 && (
                        <View style={styles.paginationContainer}>
                            {lastYearMemories.map((_, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.paginationDot,
                                        index === currentIndex && styles.paginationDotActive
                                    ]}
                                    onPress={() => scrollToIndex(index)}
                                />
                            ))}
                        </View>
                    )}

                    {/* Navigation Arrows */}
                    {lastYearMemories.length > 1 && (
                        <View style={styles.navigationContainer}>
                            <TouchableOpacity
                                style={[styles.navButton, { opacity: currentIndex === 0 ? 0.3 : 1 }]}
                                onPress={() => currentIndex > 0 && scrollToIndex(currentIndex - 1)}
                                disabled={currentIndex === 0}
                            >
                                <Ionicons name="chevron-back" size={24} color="#fff" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.navButton, { opacity: currentIndex === lastYearMemories.length - 1 ? 0.3 : 1 }]}
                                onPress={() => currentIndex < lastYearMemories.length - 1 && scrollToIndex(currentIndex + 1)}
                                disabled={currentIndex === lastYearMemories.length - 1}
                            >
                                <Ionicons name="chevron-forward" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            ) : (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No memories from this day last year</Text>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 32, // Add extra bottom padding for scroll
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#999',
        marginBottom: 24,
    },
    memoryContainer: {
        width: '100%',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 4,
        marginBottom: 26,
    },
    dateHeader: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    memoryTime: {
        fontSize: 14,
        color: '#999',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#555',
        marginHorizontal: 4,
    },
    paginationDotActive: {
        backgroundColor: '#fff',
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    navigationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginTop: 12,
    },
    navButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(50, 50, 50, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 300, // Add a minimum height for the empty state
    },
    emptyText: {
        color: '#666',
        fontSize: 16,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 300,
    },
    loadingText: {
        color: '#999',
        fontSize: 16,
    },
    errorText: {
        color: '#ff6b6b',
        fontSize: 16,
    }
});

export default LastYearTab;