import React from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Image, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { FontAwesome6, FontAwesome, Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';

// Sample data for friends
const friendsData = [
    {
        id: '1',
        username: 'John Doe',
        profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
        isActive: true,
        lastMessage: 'Hey, how are you doing?',
        timestamp: '10:30 AM'
    },
    {
        id: '2',
        username: 'Sarah Smith',
        profileImage: 'https://randomuser.me/api/portraits/women/1.jpg',
        isActive: false,
        lastMessage: 'Let me know when you\'re free',
        timestamp: 'Yesterday'
    }
];

export default function ChatScreen() {
    const renderChatItem = ({ item }) => (
        <TouchableOpacity style={styles.chatItem}>
            <View style={styles.profileImageContainer}>
                <Image
                    source={{ uri: item.profileImage }}
                    style={styles.profileImage}
                />
                {item.isActive && <View style={styles.activeStatus} />}
            </View>
            <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                    <Text style={styles.username}>{item.username}</Text>
                    <Text style={styles.timestamp}>{item.timestamp}</Text>
                </View>
                <Text style={styles.lastMessage} numberOfLines={1}>
                    {item.lastMessage}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" />
            <View style={styles.container}>
                {/* Top Navbar */}
                <View style={styles.navbar}>
                    <View style={styles.navbarContent}>
                        <Text style={styles.navbarTitle}>Chats</Text>
                        <Link href="/Screens/NewChats/newchats" style={styles.editButton}>
                            <FontAwesome6 name="edit" size={24} color="white" />
                        </Link>
                    </View>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Feather name="search" size={20} color="#8e8e8e" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search your friends and texts"
                        placeholderTextColor="#8e8e8e"
                    />
                </View>

                {/* Chats List */}
                <FlatList
                    data={friendsData}
                    renderItem={renderChatItem}
                    keyExtractor={item => item.id}
                    style={styles.chatsList}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'black',
    },
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    navbar: {
        backgroundColor: 'black',
        height: 50,
    },
    navbarContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 15,
        position: 'relative',
        height: 50,
    },
    navbarTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    editButton: {
        position: 'absolute',
        right: 15,
        zIndex: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#222',
        borderRadius: 18,
        marginHorizontal: 15,
        marginVertical: 10,
        paddingHorizontal: 10,
        height: 50,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 50,
        color: '#fff',
    },
    chatsList: {
        flex: 1,
    },
    chatItem: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderBottomWidth: 0.3,
        borderBottomColor: '#333',
    },
    profileImageContainer: {
        position: 'relative',
        marginRight: 15,
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    activeStatus: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#4CAF50',
        borderWidth: 2,
        borderColor: 'black',
    },
    chatContent: {
        flex: 1,
        justifyContent: 'center',
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    username: {
        fontWeight: 'bold',
        fontSize: 16,
        color: 'white',
    },
    timestamp: {
        color: '#999',
        fontSize: 12,
    },
    lastMessage: {
        color: '#aaa',
    },
});