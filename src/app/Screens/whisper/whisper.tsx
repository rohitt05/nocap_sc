import React, { useRef } from 'react';
import { View, StyleSheet, Text, SafeAreaView, StatusBar, Animated, Dimensions, TouchableOpacity } from 'react-native';
import { PanGestureHandler, GestureHandlerRootView, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import Map from '../Map'

interface WeekEndProps {
    onClose: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

const whisper: React.FC<WeekEndProps> = ({ onClose }) => {
    const translateX = useRef(new Animated.Value(0)).current;

    // Custom gesture handler for edge swipe only
    const onGestureEvent = Animated.event(
        [{ nativeEvent: { translationX: translateX } }],
        { useNativeDriver: true }
    );

    const onHandlerStateChange = (event: any) => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            const { translationX, velocityX, x } = event.nativeEvent;

            // Only trigger if gesture started from the left edge (first 30px)
            const isEdgeSwipe = x <= 30;

            // Check if it's a left swipe (closing gesture)
            const shouldClose = isEdgeSwipe && (translationX < -50 || velocityX < -500);

            if (shouldClose) {
                // Close drawer
                Animated.timing(translateX, {
                    toValue: -screenWidth,
                    duration: 300,
                    useNativeDriver: true,
                }).start(() => {
                    onClose();
                });
            } else {
                // Reset position
                Animated.timing(translateX, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }).start();
            }
        }
    };

    return (
        <GestureHandlerRootView style={styles.container}>
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#000" />

                <View style={styles.mainContainer}>
                    {/* Edge gesture area - only captures gestures from the left edge */}
                    <PanGestureHandler
                        onGestureEvent={onGestureEvent}
                        onHandlerStateChange={onHandlerStateChange}
                        activeOffsetX={[-10, 10]}
                        failOffsetY={[-40, 40]}
                        shouldCancelWhenOutside={true}
                        minPointers={1}
                        maxPointers={1}
                        hitSlop={{ left: 0, right: -screenWidth + 30 }} // Only respond to left edge
                    >
                        <Animated.View
                            style={[
                                styles.gestureCapture,
                                {
                                    transform: [{ translateX }],
                                }
                            ]}
                        />
                    </PanGestureHandler>

                    {/* Map content - not wrapped in gesture handler */}
                    <Animated.View
                        style={[
                            styles.mapContainer,
                            {
                                transform: [{ translateX }],
                            }
                        ]}
                    >
                        <Map />

                        {/* Back button overlay */}
                        <View style={styles.backButtonContainer}>
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={onClose}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="arrow-back" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    mainContainer: {
        flex: 1,
        position: 'relative',
    },
    gestureCapture: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 30, // Capture area width
        zIndex: 1000,
        backgroundColor: 'transparent',
    },
    mapContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    backButtonContainer: {
        position: 'absolute',
        top: 25, // Adjust based on your status bar height
        left: 10,
        zIndex: 1001,
    },
    backButton: {
        // backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: 12,
        borderRadius: 25,
    
        justifyContent: 'center',
        alignItems: 'center',
        width: 50,
        height: 50,
    },
    title: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        color: '#aaa',
        fontSize: 16,
        textAlign: 'center',
    },
});

export default whisper;