import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Dimensions,
    StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
    Easing
} from 'react-native-reanimated';
import { signUpImages, logo } from '../constants';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function SignUpCarousel({
    interval = 4000,
    fadeDuration = 1000
}) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [nextImageIndex, setNextImageIndex] = useState(1);

    const transitionProgress = useSharedValue(0);

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
            height: '100%',
            overflow: 'hidden'
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
            height: '100%',
            overflow: 'hidden'
        };
    });

    const transitionImages = useCallback(() => {
        transitionProgress.value = withTiming(1, {
            duration: fadeDuration,
            easing: Easing.bezier(0.4, 0, 0.2, 1)
        });

        setTimeout(() => {
            setCurrentImageIndex(prevIndex => (prevIndex + 1) % signUpImages.length);
            setNextImageIndex(prevIndex => (prevIndex + 2) % signUpImages.length);
            transitionProgress.value = 0;
        }, fadeDuration);
    }, [fadeDuration]);

    useEffect(() => {
        const imageTransitionTimer = setInterval(transitionImages, interval);
        return () => clearInterval(imageTransitionTimer);
    }, [transitionImages, interval]);

    return (
        <View style={styles.container}>
            {/* Current Image */}
            <Animated.View style={currentImageStyle}>
                <Image
                    source={signUpImages[currentImageIndex]}
                    style={styles.image}
                    resizeMode="cover"
                />
                <View style={styles.overlay} />
            </Animated.View>

            {/* Next Image */}
            <Animated.View style={nextImageStyle}>
                <Image
                    source={signUpImages[nextImageIndex]}
                    style={styles.image}
                    resizeMode="cover"
                />
                <View style={styles.overlay} />
            </Animated.View>

            {/* Centered Logo */}
            <View style={styles.logoContainer}>
                <Image
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
        flex: 1,
        backgroundColor: 'black',
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        flex: 1,
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
        width: 400, // Reduced size for better proportions
        height: 400, // Reduced size for better proportions
        zIndex: 100,
    }
});