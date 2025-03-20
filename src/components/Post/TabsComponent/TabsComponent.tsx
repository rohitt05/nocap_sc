import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { fonts } from '../../../utils/Fonts/fonts'; // Importing fonts

const TabsComponent = ({ activeTab, onTabChange }) => {
    const tabsScrollRef = useRef(null);
    const [tabPositions, setTabPositions] = useState({});
    const [scrollX, setScrollX] = useState(0);
    const screenWidth = Dimensions.get('window').width;

    // Tab options
    const tabOptions = ['TEXT', 'GIF', 'VOICE', 'MEDIA'];

    // Constants for tab sizing
    const TAB_WIDTH = 80; // Width of each tab

    // Handle tab change
    const handleTabChange = (tab) => {
        onTabChange(tab);

        // Scroll to position the selected tab in the center
        if (tabsScrollRef.current && tabPositions[tab]) {
            const tabCenter = tabPositions[tab].x + tabPositions[tab].width / 2;
            const scrollToX = tabCenter - screenWidth / 2;
            tabsScrollRef.current.scrollTo({ x: scrollToX, animated: true });
        }
    };

    // Store tab positions when layout changes
    const handleTabLayout = (tab, event) => {
        const layout = event.nativeEvent.layout;
        setTabPositions((prev) => ({
            ...prev,
            [tab]: {
                x: layout.x,
                width: layout.width,
            },
        }));
    };

    // Initialize scroll to center the active tab
    useEffect(() => {
        if (tabsScrollRef.current && tabPositions[activeTab]) {
            const tabCenter = tabPositions[activeTab].x + tabPositions[activeTab].width / 2;
            const scrollToX = tabCenter - screenWidth / 2;
            tabsScrollRef.current.scrollTo({ x: scrollToX, animated: false });
        }
    }, [tabPositions, activeTab]);

    // Handle scroll to determine which tab is active
    const handleScroll = (event) => {
        const newScrollX = event.nativeEvent.contentOffset.x;
        setScrollX(newScrollX);

        // Calculate the center position on screen
        const centerX = newScrollX + screenWidth / 2;

        // Find which tab is closest to center position
        let closestTab = activeTab;
        let minDistance = Infinity;

        Object.entries(tabPositions).forEach(([tab, position]) => {
            const tabCenter = position.x + position.width / 2;
            const distance = Math.abs(tabCenter - centerX);

            if (distance < minDistance) {
                minDistance = distance;
                closestTab = tab;
            }
        });

        // Only change the active tab if significantly closer to center
        if (closestTab !== activeTab && minDistance < TAB_WIDTH * 0.75) {
            onTabChange(closestTab);
        }
    };

    return (
        <View style={styles.tabsWrapper}>
            {/* Fixed position indicator in the center */}
            <View style={styles.fixedIndicatorContainer}>
                <View style={styles.activeTabIndicator} />
            </View>

            {/* Scrollable tabs */}
            <ScrollView
                ref={tabsScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabsScrollContainer}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                decelerationRate="normal"
            >
                {/* Add padding at beginning for better centering */}
                <View style={{ width: screenWidth / 2 - TAB_WIDTH / 2 }} />

                {tabOptions.map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, { width: TAB_WIDTH }]}
                        onPress={() => handleTabChange(tab)}
                        onLayout={(event) => handleTabLayout(tab, event)}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === tab ? styles.activeTabText : null,
                            ]}
                        >
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}

                {/* Add padding at end for better centering */}
                <View style={{ width: screenWidth / 2 - TAB_WIDTH / 2 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    // Tab styling with fixed indicator
    tabsWrapper: {
        width: '100%',
        height: 50,
        position: 'relative',
    },
    fixedIndicatorContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
        alignItems: 'center',
        zIndex: 10,
        pointerEvents: 'none', // Make sure it doesn't block touch events
    },
    activeTabIndicator: {
        width: 80, // Fixed width for the indicator
        height: 4,
        backgroundColor: 'transparent',
        borderRadius: 2,
    },
    tabsScrollContainer: {
        alignItems: 'center',
        height: 50,
    },
    tab: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabText: {
        color: '#666',
        fontSize: 16,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontFamily: fonts.medium, // Using Figtree Medium for normal tabs
    },
    activeTabText: {
        color: 'white',
        fontFamily: fonts.bold, // Using Figtree Bold for active tab
    },
});

export default TabsComponent;