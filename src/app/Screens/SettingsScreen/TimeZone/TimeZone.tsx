import { View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Define timezone regions with their data
const TIMEZONE_REGIONS = [
    {
        id: 'india',
        name: 'India',
        code: 'IST',
        timezone: 'Asia/Kolkata',
        emoji: '🇮🇳',
        refreshHour: 12
    },
    {
        id: 'usa',
        name: 'United States',
        code: 'EST',
        timezone: 'America/New_York',
        emoji: '🇺🇸',
        refreshHour: 12
    },
    {
        id: 'japan',
        name: 'Japan',
        code: 'JST',
        timezone: 'Asia/Tokyo',
        emoji: '🇯🇵',
        refreshHour: 12
    },
    {
        id: 'uk',
        name: 'United Kingdom',
        code: 'GMT',
        timezone: 'Europe/London',
        emoji: '🇬🇧',
        refreshHour: 12
    },
    {
        id: 'australia',
        name: 'Australia',
        code: 'AEST',
        timezone: 'Australia/Sydney',
        emoji: '🇦🇺',
        refreshHour: 12
    },
    {
        id: 'germany',
        name: 'Germany',
        code: 'CET',
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
            const regionData = TIMEZONE_REGIONS.find(r => r.id === tempSelection);
            if (!regionData) return;

            await AsyncStorage.setItem(
                REGION_PREFERENCES_KEY,
                JSON.stringify({
                    region: regionData.id,
                    timezone: regionData.timezone,
                    refreshHour: regionData.refreshHour
                })
            );

            setSelectedRegion(tempSelection);
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
    const renderTimezoneItem = ({ item }) => {
        const isSelected = tempSelection === item.id;

        return (
            <TouchableOpacity
                style={[
                    styles.timezoneItem,
                    isSelected && styles.selectedItem
                ]}
                onPress={() => selectTimezone(item.id)}
                activeOpacity={0.7}
            >
                <View style={styles.itemContent}>
                    <View style={styles.leftContent}>
                        <Text style={styles.emoji}>{item.emoji}</Text>
                        <View style={styles.textContainer}>
                            <Text style={styles.regionName}>{item.name}</Text>
                            <Text style={styles.regionCode}>{item.code}</Text>
                        </View>
                    </View>
                    
                    <View style={[
                        styles.radioButton,
                        isSelected && styles.radioButtonSelected
                    ]}>
                        {isSelected && <View style={styles.radioButtonInner} />}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={22} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Time Zone</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Info Section */}
                <View style={styles.infoSection}>
                    <Text style={styles.title}>Select Your Region</Text>
                    <Text style={styles.subtitle}>
                        Daily prompts will be delivered at 12:00 PM in your selected timezone
                    </Text>
                </View>

                {/* Timezone List */}
                <FlatList
                    data={TIMEZONE_REGIONS}
                    renderItem={renderTimezoneItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            </View>

            {/* Bottom Button */}
            {tempSelection && (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={savePreference}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>Set Timezone</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        letterSpacing: 0.3,
    },
    placeholder: {
        width: 32,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    infoSection: {
        paddingVertical: 24,
        paddingBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 8,
        letterSpacing: 0.2,
    },
    subtitle: {
        fontSize: 14,
        color: '#888',
        lineHeight: 20,
        fontWeight: '400',
    },
    listContainer: {
        paddingBottom: 100,
    },
    timezoneItem: {
        backgroundColor: '#0a0a0a',
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#1a1a1a',
    },
    selectedItem: {
        borderColor: '#333',
        backgroundColor: '#111',
    },
    itemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    emoji: {
        fontSize: 20,
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    regionName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#fff',
        marginBottom: 2,
    },
    regionCode: {
        fontSize: 12,
        color: '#666',
        fontWeight: '400',
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonSelected: {
        borderColor: '#fff',
    },
    radioButtonInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#fff',
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: '#000',
        borderTopWidth: 1,
        borderTopColor: '#1a1a1a',
    },
    saveButton: {
        backgroundColor: '#fff',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
});

export default TimeZone;