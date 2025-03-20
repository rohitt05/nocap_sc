import { View, Text, StatusBar, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import LastYearTab from '../../components/ArchiveTabs/LastYearTab';
import MemoryLaneTab from '../../components/ArchiveTabs/MemoryLaneTab';

export default function Archives() {
    const [activeTab, setActiveTab] = useState('lastYear');

    const handleTabPress = (tab) => {
        setActiveTab(tab);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.navBar}>
                    <Text style={styles.headerText}>Archives</Text>
                </View>
                <View style={styles.tabContainer}>
                    <View style={styles.tabBar}>
                        <TouchableOpacity
                            style={[
                                styles.tabButton,
                                activeTab === 'lastYear' && styles.activeTabButton
                            ]}
                            onPress={() => handleTabPress('lastYear')}
                        >
                            <Text style={[
                                styles.tabText,
                                activeTab === 'lastYear' && styles.activeTabText,
                                styles.noWrap
                            ]}>Last Year, This Day</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.tabButton,
                                activeTab === 'memoryLane' && styles.activeTabButton
                            ]}
                            onPress={() => handleTabPress('memoryLane')}
                        >
                            <Text style={[
                                styles.tabText,
                                activeTab === 'memoryLane' && styles.activeTabText
                            ]}>Memory Lane</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.content}>
                    {activeTab === 'lastYear' ? (
                        <LastYearTab />
                    ) : (
                        <MemoryLaneTab />
                    )}
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    safeArea: {
        flex: 1,
    },
    navBar: {
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 0.5,
    },
    tabContainer: {
        alignItems: 'center',
        marginTop: 8,
        backgroundColor: 'transparent',
    },
    tabBar: {
        flexDirection: 'row',
        bottom: 8,
        borderRadius: 20,
        width: 280,
        height: 36,
        overflow: 'hidden',
    },
    tabButton: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    activeTabButton: {
        backgroundColor: '#333',
    },
    tabText: {
        color: '#999',
        fontWeight: '500',
        fontSize: 12,
        textAlign: 'center',
    },
    activeTabText: {
        color: '#fff',
    },
    noWrap: {
        width: '100%',
        overflow: 'hidden',
    },
    content: {
        flex: 1,
    }
});