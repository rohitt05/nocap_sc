import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import timeZoneState from '../../../../utils/TimeUntils'; // Adjust path as needed

const TimeZone = () => {
    // Use the shared state
    const [globalTimeZone, setGlobalTimeZone] = timeZoneState.useTimeZone();
    // Local state for UI selection
    const [selectedZone, setSelectedZone] = useState(globalTimeZone);

    // Update local state when global state changes
    useEffect(() => {
        setSelectedZone(globalTimeZone);
    }, [globalTimeZone]);

    const timeZones = [
        { id: 'south_asia', name: 'South Asia', icon: 'public' },
        { id: 'america', name: 'Americas', icon: 'public' },
        { id: 'europe', name: 'Europe', icon: 'public' },
        { id: 'west_asia', name: 'West Asia', icon: 'public' },
        { id: 'east_asia', name: 'East Asia', icon: 'public' },
    ];

    const handleSelectZone = (zoneName) => {
        setSelectedZone(zoneName);
    };

    const handleSave = () => {
        // Update the global state with the selected timezone
        setGlobalTimeZone(selectedZone);
        console.log(`Saved timezone: ${selectedZone}`);
        // Navigate back happens via the Link component
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />

            {/* Header */}
            <View style={styles.header}>
                <Link href=".." asChild>
                    <TouchableOpacity style={styles.backButton}>
                        <MaterialIcons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                </Link>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Time Zone</Text>
                </View>
            </View>

            <ScrollView style={styles.content}>
                <Text style={styles.title}>Select your Time Zone</Text>

                <Text style={styles.description}>
                    To receive your NoCap notification during daytime, select your time zone.
                    When changing your time zone, all your current NoCap will be deleted.
                    You can only change time zones once a day.
                </Text>

                {/* Time Zone Options */}
                <View style={styles.optionsContainer}>
                    {timeZones.map((zone) => (
                        <TouchableOpacity
                            key={zone.id}
                            style={styles.optionItem}
                            onPress={() => handleSelectZone(zone.name)}
                        >
                            <View style={styles.optionContent}>
                                <View style={styles.iconAndTextContainer}>
                                    <MaterialIcons name={zone.icon} size={24} color="#fff" />
                                    <Text style={styles.optionText}>{zone.name}</Text>
                                </View>

                                {selectedZone === zone.name && (
                                    <MaterialIcons name="check-circle" size={24} color="#fff" />
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Save Button */}
            <View style={styles.bottomContainer}>
                <Link href=".." asChild>
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSave}
                    >
                        <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </SafeAreaView>
    );
};

// Styles remain unchanged
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        position: 'relative',
    },
    backButton: {
        padding: 4,
        position: 'absolute',
        left: 16,
        zIndex: 10,
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 10,
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 30,
        lineHeight: 22,
    },
    optionsContainer: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 20,
    },
    optionItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: '#222',
    },
    iconAndTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionText: {
        color: '#fff',
        fontSize: 16,
        marginLeft: 16,
    },
    bottomContainer: {
        padding: 20,
        paddingBottom: 30,
    },
    saveButton: {
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        color: '#444',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default TimeZone;