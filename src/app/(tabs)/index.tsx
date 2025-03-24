import { View, StyleSheet, SafeAreaView, Animated, RefreshControl } from 'react-native';
import React, { useRef, useState, useCallback } from 'react';
import Prompt from '../../components/prompts';
import { useNavigation } from '@react-navigation/native';
import { HomeHeader } from '../../components/Header/Header';
import Responses from '../../components/responses/responses';


const HomeScreen = () => {
    // Create an animated value for scroll position
    const scrollY = useRef(new Animated.Value(0)).current;

    // State for refresh control
    const [refreshing, setRefreshing] = useState(false);

    // Get navigation to update the header with our animated value
    const navigation = useNavigation();

    // Handle refresh function
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            // This will trigger the fetchResponses function inside the Responses component
            // when the component notices the refreshKey has changed
            setRefreshKey(prevKey => prevKey + 1);
            await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for better UX
        } catch (error) {
            console.error('Error refreshing:', error);
        } finally {
            setRefreshing(false);
        }
    }, []);

    // Use a key to force Responses component to re-mount and fetch new data
    const [refreshKey, setRefreshKey] = useState(0);

    // Update header with the scrollY value
    React.useEffect(() => {
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
                <Responses key={refreshKey} />
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
    }
});

export default HomeScreen;