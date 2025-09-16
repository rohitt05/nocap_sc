// MapControls.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome6, MaterialIcons, Ionicons } from '@expo/vector-icons';

interface MapControlsProps {
    isFullScreen: boolean;
    locationSharingEnabled: boolean;
    showAlbums: boolean;
    showFriends: boolean;
    onGPSPress: () => void;
    onLocationSharingToggle: () => void;
    onAlbumsToggle: () => void;
    onFriendsToggle: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({
    isFullScreen,
    locationSharingEnabled,
    showAlbums,
    showFriends,
    onGPSPress,
    onLocationSharingToggle,
    onAlbumsToggle,
    onFriendsToggle
}) => {
    if (!isFullScreen) return null;

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.iconBackground} onPress={onGPSPress} activeOpacity={0.8}>
                <FontAwesome6 name="map-location-dot" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.iconBackground, locationSharingEnabled && styles.iconBackgroundActive]}
                onPress={onLocationSharingToggle}
                activeOpacity={0.8}
            >
                <MaterialIcons
                    name={locationSharingEnabled ? 'visibility' : 'visibility-off'}
                    size={24}
                    color={locationSharingEnabled ? '#4A90E2' : 'white'}
                />
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.iconBackground, showAlbums && styles.iconBackgroundActive]}
                onPress={onAlbumsToggle}
                activeOpacity={0.8}
            >
                <Ionicons
                    name="albums"
                    size={24}
                    color={showAlbums ? '#4A90E2' : 'white'}
                />
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.iconBackground, showFriends && styles.iconBackgroundActive]}
                onPress={onFriendsToggle}
                activeOpacity={0.8}
            >
                <MaterialIcons
                    name="emoji-people"
                    size={24}
                    color={showFriends ? '#4A90E2' : 'white'}
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: '50%',
        right: 20,
        transform: [{ translateY: -80 }],
        flexDirection: 'column',
        gap: 10,
    },
    iconBackground: {
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        borderRadius: 22,
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconBackgroundActive: {
        backgroundColor: 'rgba(74, 144, 226, 0.25)',
    },
});

export default MapControls;
