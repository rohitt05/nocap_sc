import React, { useRef } from 'react';
import { View, Text, Animated, TouchableOpacity, Alert } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import * as Location from 'expo-location';

// Local imports
import { useBottomSheetAnimation } from './hooks';
import { styles } from './styles';
import { BottomSheetMapProps } from './types';

interface BottomSheetMapContentProps extends Omit<BottomSheetMapProps, 'children'> {
    location: Location.LocationObject | null;
    selectedFilter: string;
    searchResults: any[];
    onLocationPress: () => Promise<void>;
    children?: React.ReactNode;
}

const BottomSheetMap: React.FC<BottomSheetMapContentProps> = ({
    children,
    onPositionChange,
    title = "Map Information",
    forcePosition,
    location,
    selectedFilter,
    searchResults,
    onLocationPress
}) => {
    const buttonScale = useRef(new Animated.Value(1)).current;

    const {
        translateY,
        onGestureEvent,
        onHandlerStateChange,
    } = useBottomSheetAnimation(onPositionChange, forcePosition);

    const handleLocationPress = async (): Promise<void> => {
        // Button press animation
        Animated.sequence([
            Animated.timing(buttonScale, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(buttonScale, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        await onLocationPress();
    };

    return (
        <View style={styles.overlay}>
            <Animated.View
                style={[
                    styles.bottomSheet,
                    {
                        transform: [{ translateY }],
                    },
                ]}
            >
                <PanGestureHandler
                    onGestureEvent={onGestureEvent}
                    onHandlerStateChange={onHandlerStateChange}
                >
                    <View style={styles.header}>
                        <View style={styles.handle} />
                        <Text style={styles.title}>{title}</Text>
                    </View>
                </PanGestureHandler>

                <View style={styles.content}>
                    {children || (
                        <View style={{ flex: 1, paddingHorizontal: 4 }}>
                            <Text style={{
                                color: '#FFFFFF',
                                fontSize: 18,
                                fontWeight: '700',
                                marginBottom: 20,
                                letterSpacing: 0.5,
                            }}>
                                Current Location
                            </Text>

                            {location ? (
                                <View style={{
                                    marginBottom: 25,
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    padding: 16,
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: 'rgba(255,255,255,0.1)',
                                }}>
                                    <Text style={{
                                        color: 'rgba(255,255,255,0.8)',
                                        fontSize: 14,
                                        marginBottom: 8,
                                        fontWeight: '500',
                                    }}>
                                        📍 {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
                                    </Text>
                                    <Text style={{
                                        color: 'rgba(255,255,255,0.6)',
                                        fontSize: 12,
                                        marginBottom: 4,
                                    }}>
                                        Accuracy: ±{location.coords.accuracy?.toFixed(0)}m
                                    </Text>
                                    <Text style={{
                                        color: 'rgba(255,255,255,0.6)',
                                        fontSize: 12,
                                    }}>
                                        Active Filter: {selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)}
                                    </Text>
                                </View>
                            ) : (
                                <Text style={{
                                    color: 'rgba(255,255,255,0.6)',
                                    fontSize: 14,
                                    marginBottom: 20,
                                    fontStyle: 'italic',
                                }}>
                                    Location not available
                                </Text>
                            )}

                            {searchResults.length > 0 && (
                                <View style={{ marginBottom: 20 }}>
                                    <Text style={{
                                        color: '#FFFFFF',
                                        fontSize: 16,
                                        fontWeight: '600',
                                        marginBottom: 15,
                                        letterSpacing: 0.3,
                                    }}>
                                        🎯 Search Results
                                    </Text>
                                    {searchResults.map((result, index) => (
                                        <View key={index} style={{
                                            backgroundColor: 'rgba(255,255,255,0.08)',
                                            padding: 16,
                                            borderRadius: 12,
                                            marginBottom: 10,
                                            borderWidth: 1,
                                            borderColor: 'rgba(255,255,255,0.12)',
                                        }}>
                                            <Text style={{
                                                color: '#FFFFFF',
                                                fontSize: 15,
                                                fontWeight: '600',
                                                marginBottom: 4,
                                            }}>
                                                {result.text}
                                            </Text>
                                            <Text style={{
                                                color: 'rgba(255,255,255,0.7)',
                                                fontSize: 13,
                                                lineHeight: 18,
                                            }}>
                                                {result.place_name}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}

                            <Animated.View style={{
                                transform: [{ scale: buttonScale }],
                            }}>
                                <TouchableOpacity
                                    style={{
                                        backgroundColor: '#FFFFFF',
                                        padding: 16,
                                        borderRadius: 12,
                                        alignItems: 'center',
                                        marginTop: 10,
                                        shadowColor: '#000',
                                        shadowOffset: {
                                            width: 0,
                                            height: 2,
                                        },
                                        shadowOpacity: 0.25,
                                        shadowRadius: 8,
                                        elevation: 8,
                                    }}
                                    activeOpacity={0.9}
                                    onPress={handleLocationPress}
                                >
                                    <Text style={{
                                        color: '#000000',
                                        fontSize: 16,
                                        fontWeight: '700',
                                        letterSpacing: 0.5,
                                    }}>
                                        📍 Update Location
                                    </Text>
                                </TouchableOpacity>
                            </Animated.View>
                        </View>
                    )}
                </View>
            </Animated.View>
        </View>
    );
};

export default BottomSheetMap;