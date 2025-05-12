import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Dimensions,
    StyleSheet,
    // Use React Native's Image component as a fallback
    Image as RNImage
} from 'react-native';
// Try using React Native's built-in Image component instead of expo-image
// If you need to use expo-image, ensure it's properly installed with:
// npx expo install expo-image
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
    Easing
} from 'react-native-reanimated';
import { signInImages, logo } from '../constants';

const { width: screenWidth } = Dimensions.get('window');

export default function SignInCarousel({
    interval = 4000,
    fadeDuration = 1000
}) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [nextImageIndex, setNextImageIndex] = useState(1);

    // Shared values for smooth interpolation
    const transitionProgress = useSharedValue(0);

    // Animated styles for crossfade
    const currentImageStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            transitionProgress.value,
            [0, 1],
            [1, 0]
        );
        return {
            opacity,
            position: 'absolute',
            width: '100%',
            height: '100%'
        };
    });

    const nextImageStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            transitionProgress.value,
            [0, 1],
            [0, 1]
        );
        return {
            opacity,
            position: 'absolute',
            width: '100%',
            height: '100%'
        };
    });

    // Transition function
    const transitionImages = useCallback(() => {
        // Animate transition
        transitionProgress.value = withTiming(1, {
            duration: fadeDuration,
            easing: Easing.bezier(0.4, 0, 0.2, 1)
        });

        // After animation, reset and update indices
        setTimeout(() => {
            setCurrentImageIndex(prevIndex => (prevIndex + 1) % signInImages.length);
            setNextImageIndex(prevIndex => (prevIndex + 1) % signInImages.length);
            transitionProgress.value = 0;
        }, fadeDuration);
    }, [fadeDuration]);

    // Setup interval for image transitions
    useEffect(() => {
        const imageTransitionTimer = setInterval(transitionImages, interval);
        return () => clearInterval(imageTransitionTimer);
    }, [transitionImages, interval]);

    return (
        <View style={styles.container}>
            {/* Current Image */}
            <Animated.View style={currentImageStyle}>
                <RNImage
                    source={signInImages[currentImageIndex]}
                    style={styles.image}
                    resizeMode="cover"
                />
                <View style={styles.overlay} />
            </Animated.View>

            {/* Next Image */}
            <Animated.View style={nextImageStyle}>
                <RNImage
                    source={signInImages[nextImageIndex]}
                    style={styles.image}
                    resizeMode="cover"
                />
                <View style={styles.overlay} />
            </Animated.View>

            {/* Fixed Logo */}
            <View style={styles.logoContainer}>
                <RNImage
                    source={logo}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 250,
        width: screenWidth,
        overflow: 'hidden',
        position: 'relative',
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25
    },
    image: {
        width: '100%',
        height: '100%'
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)', // Semi-transparent black overlay
    },
    logoContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100 // Ensure logo is above the carousel images
    },
    logo: {
        width: 300, // Adjust width as needed
        height: 300, // Adjust height as needed
        zIndex: 100,
        opacity: 0.6 // Added opacity to the logo
    }
});