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

const { width, height } = Dimensions.get('window');

const ImageCarousel = ({
    images,
    interval = 4000,
    fadeDuration = 1500,
    // We'll use opacity instead of blur intensity
    blurIntensity = 50
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [nextImageIndex, setNextImageIndex] = useState(1);

    const transitionProgress = useSharedValue(0);

    const currentImageStyle = useAnimatedStyle(() => ({
        opacity: interpolate(transitionProgress.value, [0, 1], [1, 0]),
        position: 'absolute',
        width: '100%',
        height: '100%'
    }));

    const nextImageStyle = useAnimatedStyle(() => ({
        opacity: interpolate(transitionProgress.value, [0, 1], [0, 1]),
        position: 'absolute',
        width: '100%',
        height: '100%'
    }));

    const transitionImages = useCallback(() => {
        transitionProgress.value = withTiming(1, {
            duration: fadeDuration,
            easing: Easing.bezier(0.4, 0, 0.2, 1)
        });

        setTimeout(() => {
            setCurrentImageIndex(prevIndex => (prevIndex + 1) % images.length);
            setNextImageIndex(prevIndex => (prevIndex + 1) % images.length);
            transitionProgress.value = 0;
        }, fadeDuration);
    }, [images, fadeDuration]);

    useEffect(() => {
        const imageTransitionTimer = setInterval(transitionImages, interval);
        return () => clearInterval(imageTransitionTimer);
    }, [transitionImages, interval]);

    // Simple overlay instead of blur
    const renderImageWithEffects = (imageSource, animatedStyle) => (
        <Animated.View style={animatedStyle}>
            <ImageBackground
                source={imageSource}
                style={styles.imageBackground}
                resizeMode="cover"
            >
                {/* Dark overlay instead of blur */}
                <View style={[styles.darkOverlay, { opacity: blurIntensity / 100 }]} />
                <View style={styles.grainOverlay} />
            </ImageBackground>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            {renderImageWithEffects(images[currentImageIndex], currentImageStyle)}
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
    darkOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    grainOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        backgroundColor: 'transparent',
        opacity: 0.1,
        zIndex: 2,
    }
});

export default React.memo(ImageCarousel);