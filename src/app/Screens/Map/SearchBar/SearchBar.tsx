import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';

interface SearchBarProps {
    onLocationPress: () => void;
    onSearch: (query: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onLocationPress, onSearch, onFocus, onBlur }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = () => {
        if (searchQuery.trim()) {
            onSearch(searchQuery.trim());
        } else {
            Alert.alert('Search', 'Please enter a location to search');
        }
    };

    const handleClear = () => {
        setSearchQuery('');
    };

    const handleFocus = () => {
        onFocus?.();
    };

    const handleBlur = () => {
        onBlur?.();
    };

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={18} color="#999" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="search for something or someone"
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                        <Ionicons name="close-circle" size={18} color="#999" />
                    </TouchableOpacity>
                )}
            </View>

            <TouchableOpacity
                style={styles.locationButton}
                onPress={onLocationPress}
                activeOpacity={0.7}
            >
                <FontAwesome5 name="location-arrow" size={18} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 10, // Reduced from 50 to 10
        paddingBottom: 8, // Reduced from 16 to 8
        backgroundColor: 'transparent',
        zIndex: 1000,
        paddingLeft: 70, // Add space for back button
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)', // Changed to dark/black
        borderRadius: 25,
        paddingHorizontal: 12,
        paddingVertical: 16,
        marginRight: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
        backdropFilter: 'blur(10px)',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#fff', // Changed to white text
        fontWeight: '500',
    },
    clearButton: {
        marginLeft: 6,
        padding: 2,
    },
    locationButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#000', // Changed to black background
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },
});

export default SearchBar;
