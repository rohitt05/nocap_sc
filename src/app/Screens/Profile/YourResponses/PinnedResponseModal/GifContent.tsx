import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

interface ImageContentProps {
    fileUrl?: string;
}

const GifContent = ({ fileUrl }: ImageContentProps) => {
    return (
        <View style={styles.mediaContainer}>
            <Image
                source={{ uri: fileUrl }}
                style={styles.mediaContent}
                contentFit="cover"
            />
            <LinearGradient
                colors={['rgba(0,0,0,0.7)', 'transparent', 'transparent', 'rgba(0,0,0,0.7)']}
                style={styles.gradientOverlay}
                locations={[0, 0.2, 0.8, 1]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    mediaContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        position: 'relative',
    },
    mediaContent: {
        width: '100%',
        height: '100%',
        borderRadius: 25,

    },
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
    },
});

export default GifContent;