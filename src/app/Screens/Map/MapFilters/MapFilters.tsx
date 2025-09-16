import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
} from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import friendsDataJson from './friends.json';

const { width: screenWidth } = Dimensions.get('window');
const friendsData = friendsDataJson;
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface MapFiltersProps {
    onFilterSelect?: (filter: string) => void;
    onDiscoverOptionSelect?: (option: string) => void;
    onFriendsDataUpdate?: (friends: any[]) => void;
}

const MapFilters: React.FC<MapFiltersProps> = ({
    onFilterSelect,
    onDiscoverOptionSelect,
    onFriendsDataUpdate,
}) => {
    const [selectedFilter, setSelectedFilter] = useState<string>('host');
    const [friendsDataLoaded, setFriendsDataLoaded] = useState<boolean>(false);
    const dropdownAnimation = useRef(new Animated.Value(0)).current;
    const buttonScales = useRef(new Map()).current;

    // Load friends data only once when component mounts
    useEffect(() => {
        if (!friendsDataLoaded && onFriendsDataUpdate && friendsData.friends) {
            console.log('MapFilters: Loading friends data on mount...');
            const activeFriends = friendsData.friends.filter(
                f => f.location_sharing_enabled && f.status === 'accepted'
            );
            onFriendsDataUpdate(activeFriends);
            setFriendsDataLoaded(true);
            console.log('MapFilters: Friends data loaded:', activeFriends.length, 'active friends');
        }
    }, [friendsDataLoaded, onFriendsDataUpdate]);

    // Streamlined filter options
    const filters = [
        { id: 'host', label: 'Host Event', icon: 'add' },
        { id: 'friends', label: 'Friends', icon: 'people-outline' },
        { id: 'friends-events', label: 'Friends Events', icon: 'calendar-outline' },
        { id: 'nearby', label: 'Nearby', icon: 'location-outline' },
        { id: 'trending', label: 'Trending', icon: 'trending-up-outline' },
    ];

    const getButtonScale = (id: string) => {
        if (!buttonScales.has(id)) {
            buttonScales.set(id, new Animated.Value(1));
        }
        return buttonScales.get(id);
    };

    const animateButtonPress = (id: string) => {
        const scale = getButtonScale(id);
        Animated.sequence([
            Animated.timing(scale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
            Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();
    };

    const handleFilterPress = (id: string) => {
        animateButtonPress(id);
        setSelectedFilter(id);
        onFilterSelect?.(id);

        // Handle different filter types
        if (id === 'friends') {
            const activeFriends = friendsData.friends.filter(
                f => f.location_sharing_enabled && f.status === 'accepted'
            );
            onFriendsDataUpdate?.(activeFriends);
            console.log('MapFilters: Friends filter selected, updating with', activeFriends.length, 'friends');
        } else if (id === 'friends-events') {
            // Load friends of friends events data
            console.log('MapFilters: Friends events filter selected');
            onFriendsDataUpdate?.([]);
        } else {
            // Clear friends data for other filters
            onFriendsDataUpdate?.([]);
            console.log('MapFilters: Other filter selected, clearing friends data');
        }
    };

    const renderFilterButton = (filter: any) => {
        const isSelected = selectedFilter === filter.id;
        const scale = getButtonScale(filter.id);

        // Special styling for "Host Event" button
        if (filter.id === 'host') {
            return (
                <Link href="/Screens/Map/hostAEvent" asChild key={filter.id}>
                    <AnimatedTouchableOpacity
                        style={[
                            styles.hostButton,
                            isSelected ? styles.selectedHostButton : null,
                            { transform: [{ scale }] },
                        ]}
                        onPress={() => handleFilterPress(filter.id)}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={
                                isSelected
                                    ? ['#4CAF50', '#45A049']
                                    : ['#FF6B6B', '#FF5722']
                            }
                            style={styles.hostGradient}
                        >
                            <Ionicons name={filter.icon as any} size={18} color="#FFF" style={styles.hostIcon} />
                            <Text style={styles.hostLabel}>{filter.label}</Text>
                        </LinearGradient>
                    </AnimatedTouchableOpacity>
                </Link>
            );
        }

        return (
            <Animated.View key={filter.id} style={{ transform: [{ scale }] }}>
                <TouchableOpacity
                    style={[
                        styles.regularButton,
                        isSelected ? styles.selectedRegularButton : null,
                    ]}
                    onPress={() => handleFilterPress(filter.id)}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name={filter.icon as any}
                        size={16}
                        color={isSelected ? '#000' : 'rgba(255,255,255,0.8)'}
                        style={styles.icon}
                    />
                    <Text
                        style={[styles.filterLabel, isSelected ? styles.selectedFilterLabel : null]}
                    >
                        {filter.label}
                    </Text>
                    
                    {/* Show count for friends filter */}
                    {filter.id === 'friends' && isSelected && (
                        <View style={styles.friendsBadge}>
                            <Text style={styles.friendsText}>
                                {
                                    friendsData.friends.filter(
                                        f => f.location_sharing_enabled && f.status === 'accepted',
                                    ).length
                                }
                            </Text>
                        </View>
                    )}
                    
                    {/* Show event count for friends events filter */}
                    {filter.id === 'friends-events' && isSelected && (
                        <View style={styles.eventsBadge}>
                            <Text style={styles.eventsText}>3</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                snapToInterval={100}
                decelerationRate="fast"
            >
                {filters.map(renderFilterButton)}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { position: 'relative' },
    scrollContent: { paddingHorizontal: 15, alignItems: 'center' },
    
    // Host Event Button Styles
    hostButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 24,
        marginHorizontal: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
        overflow: 'hidden',
    },
    hostGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 24,
        justifyContent: 'center',
        minWidth: 130,
    },
    hostIcon: { marginRight: 8 },
    hostLabel: { 
        color: '#FFF', 
        fontSize: 14, 
        fontWeight: '700', 
        letterSpacing: 0.3 
    },
    selectedHostButton: { 
        shadowOpacity: 0.35, 
        shadowRadius: 12, 
        elevation: 12 
    },
    
    // Regular Button Styles
    regularButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginHorizontal: 6,
    },
    selectedRegularButton: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderColor: 'rgba(255,255,255,0.3)',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    icon: { marginRight: 8 },
    filterLabel: { 
        color: 'rgba(255,255,255,0.9)', 
        fontSize: 14, 
        fontWeight: '600' 
    },
    selectedFilterLabel: { 
        color: '#000', 
        fontWeight: '700' 
    },
    
    // Badge Styles
    friendsBadge: {
        backgroundColor: '#4CAF50',
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginLeft: 8,
        minWidth: 20,
        alignItems: 'center',
    },
    friendsText: { 
        color: '#FFF', 
        fontSize: 12, 
        fontWeight: '700' 
    },
    eventsBadge: {
        backgroundColor: '#FF9800',
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginLeft: 8,
        minWidth: 20,
        alignItems: 'center',
    },
    eventsText: { 
        color: '#FFF', 
        fontSize: 12, 
        fontWeight: '700' 
    },
});

export default MapFilters;
