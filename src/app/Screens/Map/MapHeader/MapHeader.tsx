import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import MapCompass from '../MapCompass';

interface MapHeaderProps {
    isVisible?: boolean;
    onClose?: () => void;
    style?: any;
}

const MapHeader: React.FC<MapHeaderProps> = ({
    isVisible = true,
    onClose,
    style
}) => {
    if (!isVisible) return null;

    return (
        <View style={[styles.container, style]}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {/* Beautiful gradient background that fades from dark to transparent */}
            <LinearGradient
                colors={[
                    'rgba(0, 0, 0, 0.95)', // Very dark at top
                    'rgba(0, 0, 0, 0.85)', // Dark
                    'rgba(0, 0, 0, 0.6)',  // Medium
                    'rgba(0, 0, 0, 0.3)',  // Light
                    'transparent'          // Transparent at bottom
                ]}
                locations={[0, 0.25, 0.5, 0.75, 1]}
                style={styles.gradientBackground}
            >
                {/* Header section */}
                <View style={styles.headerContainer}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                        activeOpacity={0.7}
                    >
                        <Feather name="minimize-2" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Map</Text>
                    <View style={styles.headerSpacer} />
                </View>

                {/* Compass section - integrated seamlessly */}
                <View style={styles.compassSection}>
                    <MapCompass
                        isVisible={isVisible}
                    />
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        height: 220, // Enough height for gradient fade effect
    },

    gradientBackground: {
        flex: 1,
        paddingTop: 20, // Space for status bar
    },

    // Header styling
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        height: 60,
    },

    headerSpacer: {
        width: 48, // Balance the close button width
    },

    headerTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1,
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
        letterSpacing: 0.5,
    },

    closeButton: {
        padding: 12,
        borderRadius: 25,
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Compass section
    compassSection: {
        marginTop: 10,
        paddingHorizontal: 20,
    },
});

export default MapHeader;
