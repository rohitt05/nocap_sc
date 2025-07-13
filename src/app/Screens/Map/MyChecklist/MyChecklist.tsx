import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { Link } from 'expo-router';

const MyChecklist: React.FC = () => {
    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Link href="/" asChild>
                    <TouchableOpacity style={styles.backButton}>
                        <FontAwesome6 name="arrow-left" size={20} color="#fff" />
                    </TouchableOpacity>
                </Link>
                <Text style={styles.headerTitle}>My Checklist</Text>
                <View style={styles.headerRight} />
            </View>

            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Icon Section */}
                <View style={styles.iconSection}>
                    <View style={styles.iconContainer}>
                        <FontAwesome6 name="box-archive" size={48} color="#007AFF" />
                    </View>
                </View>

                {/* Title and Description */}
                <View style={styles.textSection}>
                    <Text style={styles.title}>My Bookmark Collection</Text>
                    <Text style={styles.description}>
                        All the places and things you add to your bookmarks will appear here.
                        Start exploring the map and save your favorite locations to build your
                        personal collection of must-visit places!
                    </Text>
                </View>

                {/* Empty State */}
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No bookmarks yet</Text>
                    <Text style={styles.emptyStateSubtext}>
                        Tap the bookmark icon on places you discover to save them here
                    </Text>
                </View>

                {/* Action Button */}
                <View style={styles.actionSection}>
                    <Link href="/" asChild>
                        <TouchableOpacity style={styles.exploreButton}>
                            <FontAwesome6 name="map-location-dot" size={20} color="#fff" />
                            <Text style={styles.exploreButtonText}>Start Exploring</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    backButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    headerRight: {
        width: 36, // Same width as back button to center the title
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    iconSection: {
        alignItems: 'center',
        marginTop: 60,
        marginBottom: 30,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(0, 122, 255, 0.3)',
    },
    textSection: {
        alignItems: 'center',
        marginBottom: 50,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 15,
    },
    description: {
        fontSize: 16,
        color: '#ccc',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 10,
    },
    emptyState: {
        alignItems: 'center',
        marginBottom: 50,
        paddingVertical: 30,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        lineHeight: 20,
    },
    actionSection: {
        marginBottom: 40,
    },
    exploreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#007AFF',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 25,
        shadowColor: '#007AFF',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    exploreButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 10,
    },
});

export default MyChecklist;