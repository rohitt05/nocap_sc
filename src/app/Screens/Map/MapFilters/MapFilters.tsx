import React, { useState, useRef } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

interface MapFiltersProps {
    onFilterSelect?: (filter: string) => void;
    onDiscoverOptionSelect?: (option: string) => void;
}

const MapFilters: React.FC<MapFiltersProps> = ({
    onFilterSelect,
    onDiscoverOptionSelect
}) => {
    const [selectedFilter, setSelectedFilter] = useState<string>('discover');
    const [isDiscoverOpen, setIsDiscoverOpen] = useState<boolean>(false);
    const dropdownAnimation = useRef(new Animated.Value(0)).current;
    const buttonScales = useRef(new Map()).current;

    const filters = [
        { id: 'discover', label: 'Add a hidden gem', icon: 'storefront-outline' },
        { id: 'friends', label: 'Friends', icon: 'people-outline' },
        { id: 'trending', label: 'Trending', icon: 'trending-up-outline' },
        { id: 'eat', label: 'Eat', icon: 'restaurant-outline' },
        { id: 'cafe', label: 'Cafes', icon: 'cafe-outline' },
        { id: 'shopping', label: 'Shopping', icon: 'bag-outline' },
        { id: 'bar', label: 'Bar', icon: 'wine-outline' },
        { id: 'theater', label: 'Theater & Art', icon: 'film-outline' },
    ];

    // Initialize scale animations for each filter
    const getButtonScale = (filterId: string) => {
        if (!buttonScales.has(filterId)) {
            buttonScales.set(filterId, new Animated.Value(1));
        }
        return buttonScales.get(filterId);
    };

    const animateButtonPress = (filterId: string) => {
        const scale = getButtonScale(filterId);
        Animated.sequence([
            Animated.timing(scale, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scale, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handleFilterPress = (filterId: string) => {
        animateButtonPress(filterId);
        setSelectedFilter(filterId);
        onFilterSelect?.(filterId);
    };

    const toggleDiscoverDropdown = () => {
        const toValue = isDiscoverOpen ? 0 : 1;
        setIsDiscoverOpen(!isDiscoverOpen);

        Animated.timing(dropdownAnimation, {
            toValue,
            duration: 250,
            useNativeDriver: true,
        }).start();
    };

    const handleDiscoverOptionPress = (optionId: string) => {
        onDiscoverOptionSelect?.(optionId);
        setIsDiscoverOpen(false);
        Animated.timing(dropdownAnimation, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
        }).start();
    };

    const dropdownTranslateY = dropdownAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [-100, 0],
    });

    const dropdownOpacity = dropdownAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    const renderFilterButton = (filter: any) => {
        const isSelected = selectedFilter === filter.id;
        const isAddPlace = filter.id === 'discover';
        const scale = getButtonScale(filter.id);

        if (filter.id === 'discover') {
            return (
                <Link href="/Screens/Map/addAplace" asChild key={filter.id}>
                    <Animated.View style={{ transform: [{ scale }] }}>
                        <TouchableOpacity
                            style={[
                                styles.addPlaceButton,
                                isSelected && styles.selectedAddPlaceButton,
                            ]}
                            onPress={() => handleFilterPress(filter.id)}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={isSelected ? ['#FFFFFF', '#F0F0F0'] : ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
                                style={styles.addPlaceGradient}
                            >
                                <Ionicons
                                    name={filter.icon as any}
                                    size={16}
                                    color="#000000"
                                    style={styles.filterIcon}
                                />
                                <Text style={styles.addPlaceLabel}>
                                    {filter.label}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>
                </Link>
            );
        }

        return (
            <Animated.View key={filter.id} style={{ transform: [{ scale }] }}>
                <TouchableOpacity
                    style={[
                        styles.regularFilterButton,
                        isSelected && styles.selectedRegularFilterButton,
                    ]}
                    onPress={() => handleFilterPress(filter.id)}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name={filter.icon as any}
                        size={16}
                        color={isSelected ? '#000000' : 'rgba(255,255,255,0.8)'}
                        style={styles.filterIcon}
                    />
                    <Text
                        style={[
                            styles.filterLabel,
                            isSelected && styles.selectedFilterLabel,
                        ]}
                    >
                        {filter.label}
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Filters ScrollView */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                style={styles.scrollView}
                decelerationRate="fast"
                snapToInterval={100}
            >
                {filters.map(renderFilterButton)}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    scrollView: {
        flexGrow: 0,
    },
    scrollContent: {
        paddingHorizontal: 15,
        alignItems: 'center',
    },
    addPlaceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 24,
        marginHorizontal: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
        overflow: 'hidden',
    },
    addPlaceGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 24,
    },
    selectedAddPlaceButton: {
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 12,
    },
    regularFilterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginHorizontal: 6,
       
    },
    selectedRegularFilterButton: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderColor: 'rgba(255,255,255,0.3)',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    filterIcon: {
        marginRight: 8,
    },
    addPlaceLabel: {
        color: '#000000',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    filterLabel: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    selectedFilterLabel: {
        color: '#000000',
        fontWeight: '700',
        letterSpacing: 0.3,
    },
});

export default MapFilters;