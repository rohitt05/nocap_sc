import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Magnetometer } from 'expo-sensors';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolate,
    runOnJS,
    withTiming,
} from 'react-native-reanimated';

interface MapCompassProps {
    isVisible?: boolean;
    style?: any;
}

// Utility functions
const getCompassDirection = (degrees: number): string => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
};

const normalizeAngle = (angle: number): number => {
    let normalized = angle % 360;
    if (normalized < 0) normalized += 360;
    return normalized;
};

const MapCompass: React.FC<MapCompassProps> = ({
    isVisible = true,
    style
}) => {
    const [heading, setHeading] = useState<number>(0);

    // Simple shared values
    const compassRotation = useSharedValue(0);
    const containerOpacity = useSharedValue(isVisible ? 1 : 0);

    // Optimized strip markers for better visibility
    const compassMarkers = useMemo(() => {
        const markers = [];
        const centerDegree = Math.round(heading);
        const totalMarkers = 7; // Increased to show more letters
        const spacing = 15; // Tighter spacing for more visibility

        for (let i = -(totalMarkers - 1) / 2; i <= (totalMarkers - 1) / 2; i++) {
            const degree = normalizeAngle(centerDegree + (i * spacing));
            const direction = getCompassDirection(degree);
            const isCenter = i === 0;
            const isMainDirection = ['N', 'E', 'S', 'W'].includes(direction);

            markers.push({
                degree,
                direction,
                isCenter,
                isMainDirection,
                offset: i * 55, // Optimized spacing for visibility
                id: `marker-${degree}-${i}`,
            });
        }

        return markers;
    }, [heading]);

    // Lightweight compass sensor
    useEffect(() => {
        if (!isVisible) {
            containerOpacity.value = withTiming(0, { duration: 200 });
            return;
        }

        containerOpacity.value = withTiming(1, { duration: 200 });
        
        let magnetometerSubscription: any;
        let isMounted = true;

        const startCompass = async () => {
            try {
                const isAvailable = await Magnetometer.isAvailableAsync();
                if (!isAvailable) return;

                Magnetometer.setUpdateInterval(150);

                magnetometerSubscription = Magnetometer.addListener(({ x, y }) => {
                    if (!isMounted) return;

                    const angle = Math.atan2(y, x) * (180 / Math.PI);
                    const normalizedHeading = normalizeAngle(angle + 90);

                    runOnJS(setHeading)(normalizedHeading);

                    compassRotation.value = withSpring(normalizedHeading, {
                        damping: 15,
                        stiffness: 100,
                    });
                });

            } catch (error) {
                console.log('❌ Compass error:', error);
            }
        };

        startCompass();

        return () => {
            isMounted = false;
            if (magnetometerSubscription) magnetometerSubscription.remove();
        };
    }, [isVisible, compassRotation, containerOpacity]);

    // Clean animated styles
    const animatedContainerStyle = useAnimatedStyle(() => ({
        opacity: containerOpacity.value,
    }));

    const animatedCompassStyle = useAnimatedStyle(() => ({
        transform: [{
            translateX: interpolate(
                compassRotation.value,
                [0, 360],
                [0, -330], // Adjusted for new spacing
                'clamp'
            ),
        }],
    }));

    if (!isVisible) return null;

    return (
        <Animated.View style={[styles.container, style, animatedContainerStyle]}>
            <View style={styles.compassContainer}>
                <Animated.View style={[styles.compassStrip, animatedCompassStyle]}>
                    {compassMarkers.map((marker) => (
                        <View
                            key={marker.id}
                            style={[
                                styles.compassMarker,
                                { transform: [{ translateX: marker.offset }] },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.compassDirection,
                                    marker.isCenter && styles.compassDirectionCenter,
                                    marker.isMainDirection && styles.compassDirectionMain,
                                ]}
                            >
                                {marker.direction}
                            </Text>

                            {marker.isCenter && (
                                <Text style={styles.compassDegree}>
                                    {marker.degree}°
                                </Text>
                            )}
                        </View>
                    ))}
                </Animated.View>

                {/* Minimal center indicator */}
                <View style={styles.centerIndicator} />
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },

    compassContainer: {
        height: 40,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },

    compassStrip: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
        width: '120%', // Optimized strip width
    },

    compassMarker: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 50, // Slightly smaller for tighter fit
        height: 40,
        marginHorizontal: 2.5,
    },

    compassDirection: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 13,
        fontWeight: '500',
        letterSpacing: 0.5,
    },

    compassDirectionCenter: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 1,
    },

    compassDirectionMain: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '600',
    },

    compassDegree: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 10,
        fontWeight: '400',
        marginTop: 1,
    },

    centerIndicator: {
        position: 'absolute',
        top: 2,
        width: 1.5,
        height: 36,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 1,
    },
});

export default MapCompass;
