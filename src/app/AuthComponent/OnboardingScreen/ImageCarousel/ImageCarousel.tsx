import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Dimensions,
    StyleSheet,
    ImageBackground
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
    Easing
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const ImageCarousel = ({
    images,
    interval = 4000,
    fadeDuration = 1500,
    blurIntensity = 50
}) => {
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
            setCurrentImageIndex(prevIndex => (prevIndex + 1) % images.length);
            setNextImageIndex(prevIndex => (prevIndex + 2) % images.length);
            transitionProgress.value = 0;
        }, fadeDuration);
    }, [images, fadeDuration]);

    // Setup interval for image transitions
    useEffect(() => {
        const imageTransitionTimer = setInterval(transitionImages, interval);
        return () => clearInterval(imageTransitionTimer);
    }, [transitionImages, interval]);

    // Render image with effects
    const renderImageWithEffects = (imageSource, animatedStyle) => (
        <Animated.View style={animatedStyle}>
            <ImageBackground
                source={imageSource}
                style={styles.imageBackground}
                resizeMode="cover"
            >
                <View style={styles.grainOverlay} />
                <BlurView
                    intensity={blurIntensity}
                    style={styles.absolute}
                    tint="dark"
                />
            </ImageBackground>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            {/* Current Image */}
            {renderImageWithEffects(images[currentImageIndex], currentImageStyle)}

            {/* Next Image */}
            {renderImageWithEffects(images[nextImageIndex], nextImageStyle)}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: width,
        height: height,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageBackground: {
        width: '100%',
        height: '100%',
    },
    absolute: {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    grainOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        backgroundColor: 'transparent',
        backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        opacity: 0.1,
        zIndex: 2,
    }
});

export default React.memo(ImageCarousel);