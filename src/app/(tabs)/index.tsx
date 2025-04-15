import { View, StyleSheet, Text, SafeAreaView, Animated, RefreshControl } from 'react-native';
import React, { useRef, useState, useCallback, useEffect } from 'react';
import Prompt from '../../components/prompts';
import { useNavigation } from '@react-navigation/native';
import { HomeHeader } from '../../components/Header/Header';
import Responses from '../../components/responses/responses';
import NoResponse from '../../components/NoResponse';
import { loadPromptAndCheckResponse } from '../../../API/checkPromptResponse';
import { useNotifications } from '../context/NotificationContext';

const HomeScreen = () => {
   const {notification, expoPushToken, error} = useNotifications();
   
   // Log the Expo push token when it changes
   useEffect(() => {
     console.log('Expo Push Token:', expoPushToken);
   }, [expoPushToken]);

    // Create an animated value for scroll position
    const scrollY = useRef(new Animated.Value(0)).current;

    // State for refresh control
    const [refreshing, setRefreshing] = useState(false);

    // State to track if user has responded to current prompt
    const [hasResponded, setHasResponded] = useState(false);

    // State to store current prompt ID
    const [currentPromptId, setCurrentPromptId] = useState(null);

    // State for loading status
    const [loading, setLoading] = useState(true);

    // Get navigation to update the header with our animated value
    const navigation = useNavigation();

    // Use a key to force Responses component to re-mount and fetch new data
    const [refreshKey, setRefreshKey] = useState(0);

    // Load prompt data and check response status
    const loadPromptData = async () => {
        try {
            setLoading(true);
            const { promptId, hasResponded } = await loadPromptAndCheckResponse();
            setCurrentPromptId(promptId);
            setHasResponded(hasResponded);
        } catch (error) {
            console.error('Error in loadPromptData:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle refresh function
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await loadPromptData();
            setRefreshKey(prevKey => prevKey + 1);
            await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for better UX
        } catch (error) {
            console.error('Error refreshing:', error);
        } finally {
            setRefreshing(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        loadPromptData();
    }, []);

    // Update header with the scrollY value
    useEffect(() => {
        navigation.setOptions({
            headerTitle: () => <HomeHeader scrollY={scrollY} />,
        });
    }, [navigation, scrollY]);

    return (
        <SafeAreaView style={styles.container}>
            <Animated.ScrollView
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#6441A5"
                        colors={["white"]}
                        progressBackgroundColor="#000"
                    />
                }
            >
                <Prompt />

                {loading ? (
                    <View style={styles.messageContainer}>
                        <Text style={styles.loadingText}>Loading...</Text>
                    </View>
                ) : hasResponded ? (
                    <Responses key={refreshKey} />
                ) : (
                    <NoResponse />
                )}
            </Animated.ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    scrollContent: {
        flexGrow: 1,
    },
    messageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        marginTop: 50,
    },
    loadingText: {
        color: '#aaa',
        fontSize: 16,
        textAlign: 'center',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
        padding: 20,
    }
});

export default HomeScreen;