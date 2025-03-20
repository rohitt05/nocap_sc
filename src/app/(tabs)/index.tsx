// HomeScreen.jsx
import { View, StyleSheet, SafeAreaView, Animated } from 'react-native';
import React, { useRef } from 'react';
import Prompt from '../../components/prompts';
import { useNavigation } from '@react-navigation/native';
import { HomeHeader } from '../../components/Header/Header';
import responsesData from '../../../assets/response/response.json';
import Responses from '../../components/responses/responses';
import { ResponsesData } from '../../components/responses/types';

const HomeScreen = () => {
    // Create an animated value for scroll position
    const scrollY = useRef(new Animated.Value(0)).current;

    // Get navigation to update the header with our animated value
    const navigation = useNavigation();

    // Type assertion for our JSON data
    const typedResponsesData = responsesData as ResponsesData;

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
            >
                <Prompt />
                <Responses responsesData={typedResponsesData} />
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