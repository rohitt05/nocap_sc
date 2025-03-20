import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const ImageResponse = ({ response }) => {
    return (
        <View style={styles.mediaPreviewContainer}>
            <Image
                source={{ uri: response }}
                style={styles.imagePreview}
                onError={(e) => console.log('Error loading image:', e.nativeEvent.error)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    mediaPreviewContainer: {
        height: 180, // Set to match TextResponse height
        backgroundColor: '#2A2A2A',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        // Removed aspectRatio to allow custom height
    },
    imagePreview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
});

export default ImageResponse;