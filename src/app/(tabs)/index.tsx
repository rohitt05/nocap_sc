import {
    View,
    StyleSheet,
    Text,
    SafeAreaView,
    Animated,
    RefreshControl,
    Dimensions,
} from 'react-native';
import React, {
    useRef,
    useState,
    useCallback,
    useEffect,
} from 'react';
import {
    GestureHandlerRootView,
    PanGestureHandler,
    State,
} from 'react-native-gesture-handler';
import Prompt from '../../components/prompts';
import { useNavigation } from '@react-navigation/native';
import { HomeHeader } from '../../components/Header/Header';
import Responses from '../../components/responses/responses';
import NoResponse from '../../components/NoResponse';
import { loadPromptAndCheckResponse } from '../../../API/checkPromptResponse';
import { useNotifications } from '../context/NotificationContext';
import { useTabBar } from '../context/TabBarContext'; // Import the context
import Whisper from '../Screens/whisper';

const { width: screenWidth } = Dimensions.get('window');

const HomeScreen = () => {
    const { notification, expoPushToken, error } = useNotifications();
    const { hideTabBar, showTabBar } = useTabBar(); // Use the context

    const scrollY = useRef(new Animated.Value(0)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const drawerOpacity = useRef(new Animated.Value(0)).current;

    const [drawerVisible, setDrawerVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [hasResponded, setHasResponded] = useState(false);
    const [currentPromptId, setCurrentPromptId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    const navigation = useNavigation();

    /* ──────────────────────────────────────────
       DIRECT TAB BAR CONTROL - THIS WILL WORK!
    ─────────────────────────────────────────── */
    useEffect(() => {
        if (drawerVisible) {
            console.log('🚫 HomeScreen: Hiding tab bar because drawer is visible');
            hideTabBar();
        } else {
            console.log('✅ HomeScreen: Showing tab bar because drawer is hidden');
            showTabBar();
        }
    }, [drawerVisible, hideTabBar, showTabBar]);
    /* ────────────────────────────────────────── */

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

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await loadPromptData();
            setRefreshKey((prevKey) => prevKey + 1);
            await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (error) {
            console.error('Error refreshing:', error);
        } finally {
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadPromptData();
    }, []);

    useEffect(() => {
        navigation.setOptions({
            headerShown: !drawerVisible,
            headerTitle: () => <HomeHeader scrollY={scrollY} />,
        });
    }, [navigation, scrollY, drawerVisible]);

    const onGestureEvent = Animated.event(
        [{ nativeEvent: { translationX: translateX } }],
        { useNativeDriver: true }
    );

    const onHandlerStateChange = (event: any) => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            const { translationX, velocityX } = event.nativeEvent;
            const shouldOpen = translationX > 50 || velocityX > 500;

            if (shouldOpen) {
                console.log('🚀 Opening drawer - tab bar should hide now');
                setDrawerVisible(true);
                Animated.parallel([
                    Animated.timing(translateX, {
                        toValue: screenWidth,
                        duration: 250,
                        useNativeDriver: true,
                    }),
                    Animated.timing(drawerOpacity, {
                        toValue: 1,
                        duration: 250,
                        useNativeDriver: true,
                    }),
                ]).start();
            } else {
                closeDrawer();
            }
        }
    };

    const closeDrawer = () => {
        console.log('🔙 Closing drawer - tab bar should show now');
        Animated.parallel([
            Animated.timing(translateX, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(drawerOpacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setDrawerVisible(false);
        });
    };

    return (
        <GestureHandlerRootView style={styles.container}>
            <PanGestureHandler
                onGestureEvent={onGestureEvent}
                onHandlerStateChange={onHandlerStateChange}
                activeOffsetX={[-5, 5]}
                failOffsetY={[-30, 30]}
                shouldCancelWhenOutside={false}
                minPointers={1}
                maxPointers={1}
            >
                <Animated.View
                    style={[
                        styles.mainContainer,
                        {
                            transform: [{ translateX }],
                        },
                    ]}
                >
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
                                    colors={['white']}
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
                </Animated.View>
            </PanGestureHandler>

            {drawerVisible && (
                <Animated.View
                    style={[
                        styles.drawerContainer,
                        {
                            opacity: drawerOpacity,
                        },
                    ]}
                >
                    <Whisper onClose={closeDrawer} />
                </Animated.View>
            )}
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    mainContainer: {
        flex: 1,
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
    drawerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000',
        zIndex: 1000,
    },
});

export default HomeScreen;
