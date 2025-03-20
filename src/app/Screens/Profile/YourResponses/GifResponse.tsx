import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

const GifResponse = ({ response }) => {
    return (
        <View style={styles.mediaPreviewContainer}>
            <Image
                source={{ uri: response }}
                style={styles.gifPreview}
                onError={(e) => console.log('Error loading GIF:', e.nativeEvent.error)}
            />
            <View style={styles.gifBadge}>
                <Text style={styles.gifBadgeText}>GIF</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    mediaPreviewContainer: {
        height: 180, // Set to match other components' height
        backgroundColor: '#2A2A2A',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        // Removed aspectRatio to allow custom height
    },
    gifPreview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    gifBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    gifBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
});

export default GifResponse;