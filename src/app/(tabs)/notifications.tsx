import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import NotificationList from '../Screens/Notifications/NotificationList';

const Notifications = () => {
    // State for refresh control
    const [refreshing, setRefreshing] = useState(false);

    // Refresh handler
    const onRefresh = useCallback(() => {
        // Set refreshing to true
        setRefreshing(true);

        // Simulate a refresh action
        // In a real app, you would fetch new data here
        setTimeout(() => {
            // Reset the refresh state
            setRefreshing(false);
        }, 1000); // Simulated 1-second refresh
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header without back button */}
            <View style={styles.header}>
                <View style={styles.leftPlaceholder} />
                <Text style={styles.headerTitle}>Notifications</Text>
                <Link href="../Screens/Notifications/sentModal" asChild>
                    <TouchableOpacity style={styles.sentButton}>
                        <Text style={styles.sentButtonText}>Sent</Text>
                        <Ionicons
                            name="chevron-forward"
                            size={16}
                            color="#fff"
                            style={styles.chevron}
                        />
                    </TouchableOpacity>
                </Link>
            </View>

            {/* Scrollable content with pull-to-refresh */}
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#fff']} // Customize refresh indicator color
                        tintColor={'#fff'} // iOS refresh indicator color
                        title={'Updating notifications...'}
                    />
                }
            >
                {/* Notification List Component */}
                <NotificationList />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        height: 50,
    },
    leftPlaceholder: {
        width: 40, // Added to maintain the header balance
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    rightPlaceholder: {
        width: 40, // To balance the header
    },
    scrollContainer: {
        flexGrow: 1,
    },
    sentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
    },
    sentButtonText: {
        color: '#fff',
        fontWeight: '500',
        marginRight: 4,
    },
    chevron: {
        marginTop: 1, // Small adjustment to align with text
    }
});

export default Notifications;