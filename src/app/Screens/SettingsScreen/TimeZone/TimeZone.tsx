import { View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons from expo vector icons

// Define timezone regions with their data
const TIMEZONE_REGIONS = [
    {
        id: 'india',
        name: 'India (IST)',
        timezone: 'Asia/Kolkata',
        emoji: '🇮🇳',
        refreshHour: 12
    },
    {
        id: 'usa',
        name: 'USA (EST)',
        timezone: 'America/New_York',
        emoji: '🇺🇸',
        refreshHour: 12
    },
    {
        id: 'japan',
        name: 'Japan (JST)',
        timezone: 'Asia/Tokyo',
        emoji: '🇯🇵',
        refreshHour: 12
    },
    {
        id: 'uk',
        name: 'United Kingdom (GMT/BST)',
        timezone: 'Europe/London',
        emoji: '🇬🇧',
        refreshHour: 12
    },
    {
        id: 'australia',
        name: 'Australia (AEST)',
        timezone: 'Australia/Sydney',
        emoji: '🇦🇺',
        refreshHour: 12
    },
    {
        id: 'germany',
        name: 'Germany (CET)',
        timezone: 'Europe/Berlin',
        emoji: '🇩🇪',
        refreshHour: 12
    }
];

// Storage key for timezone preferences
export const REGION_PREFERENCES_KEY = "USER_REGION_PREFERENCE";

const TimeZone = () => {
    const navigation = useNavigation();
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [tempSelection, setTempSelection] = useState(null);
    const screenWidth = Dimensions.get('window').width;

    // Load saved preference on component mount
    useEffect(() => {
        const loadSavedPreference = async () => {
            try {
                const stored = await AsyncStorage.getItem(REGION_PREFERENCES_KEY);
                if (stored) {
                    const { region } = JSON.parse(stored);
                    setSelectedRegion(region);
                    setTempSelection(region);
                }
            } catch (error) {
                console.error("Error loading region preference:", error);
            }
        };

        loadSavedPreference();
    }, []);

    // Save preference and navigate back
    const savePreference = async () => {
        if (!tempSelection) return;

        try {
            // Find the region object
            const regionData = TIMEZONE_REGIONS.find(r => r.id === tempSelection);
            if (!regionData) return;

            // Save to AsyncStorage
            await AsyncStorage.setItem(
                REGION_PREFERENCES_KEY,
                JSON.stringify({
                    region: regionData.id,
                    timezone: regionData.timezone,
                    refreshHour: regionData.refreshHour
                })
            );

            // Update state
            setSelectedRegion(tempSelection);

            // Go back to previous screen
            navigation.goBack();
        } catch (error) {
            console.error("Error saving region preference:", error);
        }
    };

    // Select timezone (temporary selection)
    const selectTimezone = (regionId) => {
        setTempSelection(regionId);
    };

    // Render a timezone option
    const renderTimezoneItem = ({ item, index }) => {
        const isSelected = tempSelection === item.id;
        const isFirstItem = index === 0;
        const isLastItem = index === TIMEZONE_REGIONS.length - 1;

        return (
            <TouchableOpacity
                style={[
                    styles.timezoneItem,
                    isFirstItem && styles.firstItem,
                    isLastItem && styles.lastItem,
                    isSelected && styles.selectedItem
                ]}
                onPress={() => selectTimezone(item.id)}
            >
                <Text style={styles.emoji}>{item.emoji}</Text>
                <View style={styles.textContainer}>
                    <Text style={styles.regionName}>{item.name}</Text>
                </View>
                {isSelected && (
                    <View style={styles.checkmark}>
                        <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />

            {/* Header Bar with Back Button */}
            <View style={styles.headerBar}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Time Zone</Text>
                <View style={styles.placeholder}></View>
            </View>

            <View style={styles.header}>
                <Text style={styles.title}>Select Your Timezone</Text>
                <Text style={styles.subtitle}>
                    Choose your region to get daily prompts at noon in your local time
                </Text>
            </View>

            <FlatList
                data={TIMEZONE_REGIONS}
                renderItem={renderTimezoneItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
            />

            {/* Set Button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.setButton,
                        !tempSelection && styles.disabledButton
                    ]}
                    onPress={savePreference}
                    disabled={!tempSelection}
                >
                    <Text style={styles.buttonText}>Set Timezone</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000', // Pure black background
    },
    headerBar: {
        height: 60,
        backgroundColor: '#000',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    placeholder: {
        width: 40, // Same width as back button for proper centering
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333', // Darker border color for dark theme
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#fff', // White text for dark theme
    },
    subtitle: {
        fontSize: 16,
        color: '#aaa', // Light gray text for dark theme
        lineHeight: 22,
    },
    list: {
        padding: 10,
        width: '100%',
        paddingBottom: 90, // Extra padding for button at bottom
    },
    timezoneItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12, // Shorter card height
        paddingHorizontal: 15,
        backgroundColor: '#222', // Dark gray cards
        borderRadius: 0, // No border radius by default
        marginBottom: 1, // Minimal gap between items
        width: '100%', // Full screen width cards
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0, // Removed elevation
    },
    firstItem: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    lastItem: {
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    selectedItem: {
        backgroundColor: '#333', // Darker gray for selected item
        borderColor: '#444',
        borderWidth: 1,
    },
    emoji: {
        fontSize: 24, // Slightly smaller emoji
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    regionName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff', // White text for dark theme
    },
    checkmark: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#444', // Dark gray checkmark
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmarkText: {
        color: 'white',
        fontWeight: 'bold',
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: '#000',
        borderTopWidth: 1,
        borderTopColor: '#222',
    },
    setButton: {
        backgroundColor: '#333',
        paddingVertical: 16,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabledButton: {
        backgroundColor: '#222',
        opacity: 0.5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default TimeZone;