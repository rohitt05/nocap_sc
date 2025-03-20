import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Notifications = () => {
    // State for toggle switches
    const [friendsPostsEnabled, setFriendsPostsEnabled] = useState(true);
    const [friendRequestsEnabled, setFriendRequestsEnabled] = useState(false);
    const [mentionsEnabled, setMentionsEnabled] = useState(false);
    const [reactionsEnabled, setReactionsEnabled] = useState(false);
    const [streaksEnabled, setStreaksEnabled] = useState(true);

    return (
        <View style={styles.container}>
            {/* Top Navbar */}
            <View style={styles.navbar}>
                <TouchableOpacity style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.navTitle}>Notifications</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Content - ScrollView */}
            <ScrollView style={styles.contentContainer}>
                {/* Description - Now part of scrollable content */}
                <View style={styles.descriptionContainer}>
                    <Text style={styles.descriptionText}>
                        On NoCap, you're in control of your push notifications. You can choose the type of notifications you want to receive.
                    </Text>
                </View>

                {/* POSTS */}
                <Text style={styles.sectionTitle}>POSTS</Text>
                <View style={styles.card}>
                    <View style={styles.notificationRow}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="images-outline" size={24} color="white" />
                        </View>
                        <View style={styles.notificationInfo}>
                            <Text style={styles.notificationTitle}>Friends' Posts</Text>
                            <Text style={styles.notificationSubtitle}>someone, someone, someone & 4 others have all posted a NoCap.</Text>
                        </View>
                        <Switch
                            value={friendsPostsEnabled}
                            onValueChange={setFriendsPostsEnabled}
                            trackColor={{ false: '#3e3e3e', true: '#0084ff' }}
                            thumbColor="white"
                        />
                    </View>
                </View>

                {/* INTERACTIONS */}
                <Text style={styles.sectionTitle}>INTERACTIONS</Text>
                <View style={styles.card}>
                    <View style={styles.notificationRow}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="people-outline" size={24} color="white" />
                        </View>
                        <View style={styles.notificationInfo}>
                            <Text style={styles.notificationTitle}>Friend requests</Text>
                            <Text style={styles.notificationSubtitle}>someone just sent you a friend request</Text>
                        </View>
                        <Switch
                            value={friendRequestsEnabled}
                            onValueChange={setFriendRequestsEnabled}
                            trackColor={{ false: '#3e3e3e', true: '#0084ff' }}
                            thumbColor="white"
                        />
                    </View>

                    <View style={styles.separator} />

                    <View style={styles.notificationRow}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="at-outline" size={24} color="white" />
                        </View>
                        <View style={styles.notificationInfo}>
                            <Text style={styles.notificationTitle}>Mentions and Tags</Text>
                            <Text style={styles.notificationSubtitle}>someone mentioned you on someone's NoCap.</Text>
                        </View>
                        <Switch
                            value={mentionsEnabled}
                            onValueChange={setMentionsEnabled}
                            trackColor={{ false: '#3e3e3e', true: '#0084ff' }}
                            thumbColor="white"
                        />
                    </View>

                    <View style={styles.separator} />

                    <View style={styles.notificationRow}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="happy-outline" size={24} color="white" />
                        </View>
                        <View style={styles.notificationInfo}>
                            <Text style={styles.notificationTitle}>Reactions</Text>
                            <Text style={styles.notificationSubtitle}>someone just reacted to your NoCap.</Text>
                        </View>
                        <Switch
                            value={reactionsEnabled}
                            onValueChange={setReactionsEnabled}
                            trackColor={{ false: '#3e3e3e', true: '#0084ff' }}
                            thumbColor="white"
                        />
                    </View>
                </View>

                {/* UPDATES AND REMINDERS */}
                <Text style={styles.sectionTitle}>UPDATES AND REMINDERS</Text>
                <View style={styles.card}>
                    <View style={styles.notificationRow}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="flame-outline" size={24} color="white" />
                        </View>
                        <View style={styles.notificationInfo}>
                            <Text style={styles.notificationTitle}>Streaks</Text>
                            <Text style={styles.notificationSubtitle}>Be careful not to lose your streak!</Text>
                        </View>
                        <Switch
                            value={streaksEnabled}
                            onValueChange={setStreaksEnabled}
                            trackColor={{ false: '#3e3e3e', true: '#0084ff' }}
                            thumbColor="white"
                        />
                    </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    navbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 10,
        height: 56, // Fixed height for navbar without top padding
    },
    backButton: {
        padding: 5,
    },
    navTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    placeholder: {
        width: 24,
    },
    contentContainer: {
        flex: 1,
    },
    descriptionContainer: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 20,
    },
    descriptionText: {
        color: 'white',
        fontSize: 16,
        lineHeight: 22,
    },
    sectionTitle: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
        paddingHorizontal: 16,
        marginVertical: 10,
    },
    card: {
        backgroundColor: '#121212',
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 20,
        overflow: 'hidden',
    },
    notificationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    iconContainer: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    notificationInfo: {
        flex: 1,
        marginRight: 10,
    },
    notificationTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    notificationSubtitle: {
        color: '#9e9e9e',
        fontSize: 14,
    },
    separator: {
        height: 1,
        backgroundColor: '#2a2a2a',
    },
    saveButton: {
        backgroundColor: 'white',
        borderRadius: 20,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 16,
        marginTop: 10,
        marginBottom: 20,
    },
    saveButtonText: {
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
    },
    bottomSpacer: {
        height: 50,
    },
});

export default Notifications;