import React, { useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Animated,
    Dimensions,
    TouchableOpacity,
    Platform,
    BackHandler, // ✅ ADD: Import BackHandler
} from 'react-native';
import {
    PanGestureHandler,
    GestureHandlerRootView,
    State,
} from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import MapCamera from '../Map/MapCamera';

interface WeekEndProps {
    onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const Whisper: React.FC<WeekEndProps> = ({ onClose }) => {
    const translateX = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.98)).current;

    // ✅ ADD: Hardware back button handler
    useEffect(() => {
        const backAction = () => {
            console.log('🔙 Hardware back pressed in Whisper - going back to HomeScreen');
            handleBackPress(); // Use existing back press logic
            return true; // ✅ IMPORTANT: Return true to prevent default behavior
        };

        // ✅ ADD: Register back handler when component mounts
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

        // ✅ CLEANUP: Remove back handler when component unmounts
        return () => backHandler.remove();
    }, []);

    useEffect(() => {
        // Quick entrance animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 120,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const onGestureEvent = Animated.event(
        [{ nativeEvent: { translationX: translateX } }],
        {
            useNativeDriver: true,
            listener: (event: any) => {
                const progress =
                    Math.abs(event.nativeEvent.translationX) / screenWidth;
                scaleAnim.setValue(Math.max(0.95, 1 - progress * 0.05));
                fadeAnim.setValue(Math.max(0.5, 1 - progress * 0.5));
            },
        },
    );

    const onHandlerStateChange = (event: any) => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            const { translationX, velocityX, x } = event.nativeEvent;
            const isEdgeSwipe = x <= 40;
            const shouldClose = isEdgeSwipe && (translationX < -80 || velocityX < -800);

            if (shouldClose) {
                Animated.parallel([
                    Animated.timing(translateX, {
                        toValue: -screenWidth,
                        duration: 250,
                        useNativeDriver: true,
                    }),
                    Animated.timing(fadeAnim, {
                        toValue: 0,
                        duration: 250,
                        useNativeDriver: true,
                    }),
                ]).start(() => {
                    onClose();
                });
            } else {
                Animated.parallel([
                    Animated.spring(translateX, {
                        toValue: 0,
                        tension: 120,
                        friction: 8,
                        useNativeDriver: true,
                    }),
                    Animated.spring(scaleAnim, {
                        toValue: 1,
                        tension: 120,
                        friction: 8,
                        useNativeDriver: true,
                    }),
                    Animated.spring(fadeAnim, {
                        toValue: 1,
                        tension: 120,
                        friction: 8,
                        useNativeDriver: true,
                    }),
                ]).start();
            }
        }
    };

    const handleBackPress = () => {
        console.log('🔙 Back action triggered - animating back to HomeScreen');
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onClose(); // ✅ This calls the closeDrawer function from HomeScreen
        });
    };

    return (
        <GestureHandlerRootView style={styles.container}>
            <StatusBar
                barStyle="light-content"
                backgroundColor="transparent"
                translucent
            />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.mainContainer}>
                    {/* Edge gesture area */}
                    <PanGestureHandler
                        onGestureEvent={onGestureEvent}
                        onHandlerStateChange={onHandlerStateChange}
                        activeOffsetX={[-10, 10]}
                        failOffsetY={[-50, 50]}
                        shouldCancelWhenOutside
                        minPointers={1}
                        maxPointers={1}
                        hitSlop={{ left: 0, right: -screenWidth + 40 }}
                    >
                        <Animated.View
                            style={[
                                styles.gestureCapture,
                                {
                                    transform: [{ translateX }],
                                },
                            ]}
                        />
                    </PanGestureHandler>

                    {/* Full-screen content */}
                    <Animated.View
                        style={[
                            styles.mapContainer,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateX }, { scale: scaleAnim }],
                            },
                        ]}
                    >
                        <MapCamera />

                        {/* Back button */}
                        <View style={styles.backButtonContainer}>
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={handleBackPress}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="arrow-back" size={20} color="#ffffff" />
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
        backgroundColor: '#000000',
    },
    safeArea: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
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
        width: 40,
        zIndex: 1000,
        backgroundColor: 'transparent',
    },
    mapContainer: {
        flex: 1,
        backgroundColor: '#000000',
    },
    backButtonContainer: {
        position: 'absolute',
        top: 30,
        left: 15,
        zIndex: 1001,
    },
    backButton: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Whisper;
