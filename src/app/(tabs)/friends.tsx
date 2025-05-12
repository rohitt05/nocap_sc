import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    Image,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    FlatList,
    ActivityIndicator,
    Alert,
    Keyboard
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useFetchFriends } from '../../../API/fetchFriends';
import { useSearchUsers } from '../../../API/searchFriends';
import { styles } from '../../components/TabStyles/friends'

export default function Friends() {
    const { friends, loading: loadingFriends, error: friendsError, refreshFriends, removeFriend } = useFetchFriends();
    const {
        searchResults,
        loading: loadingSearch,
        error: searchError,
        friendStatus,
        searchUsers,
        sendFriendRequest,
        resetSearch
    } = useSearchUsers();

    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // Filter friends based on search query when not in search mode
    const filteredFriends = friends.filter(friend =>
        friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        friend.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Handle search focus
    const handleSearchFocus = () => {
        setIsSearchFocused(true);
    };

    // Handle search cancel
    const handleSearchCancel = () => {
        setIsSearchFocused(false);
        setSearchQuery('');
        resetSearch();
        Keyboard.dismiss();
    };

    // Handle search input changes
    const handleSearchChange = (text) => {
        setSearchQuery(text);
        if (isSearchFocused) {
            searchUsers(text);
        }
    };

    // Handle friend removal
    const handleRemoveFriend = (friendId, username) => {
        Alert.alert(
            "Remove Friend",
            `Are you sure you want to remove ${username} from your friends?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: () => removeFriend(friendId)
                }
            ]
        );
    };

    // Render each friend item
    const renderFriend = ({ item }) => (
        <Link href={`/Screens/user/users?id=${item.id}`} asChild>
            <TouchableOpacity>
                <View style={styles.friendItem}>
                    <View style={styles.friendInfo}>
                        <Image
                            source={{ uri: item.avatar_url || 'https://via.placeholder.com/50' }}
                            style={styles.friendImage}
                            defaultSource={require('../../../assets/hattori.webp')}
                        />
                        <View>
                            <Text style={styles.friendUsername}>{item.username}</Text>
                            {item.full_name && <Text style={styles.friendName}>{item.full_name}</Text>}
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => handleRemoveFriend(item.id, item.username)}
                    >
                        <Feather name="x" size={18} color="#666" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Link>
    );

    // Render each search result item
    const renderSearchResult = ({ item }) => (
        <Link href={`/Screens/user/users?id=${item.id}`} asChild>
            <TouchableOpacity>

                <View style={styles.friendItem}>
                    <View style={styles.friendInfo}>
                        <Image
                            source={{ uri: item.avatar_url || 'https://via.placeholder.com/50' }}
                            style={styles.friendImage}
                            defaultSource={require('../../../assets/hattori.webp')}
                        />
                        <View>
                            <Text style={styles.friendUsername}>{item.username}</Text>
                            {item.full_name && <Text style={styles.friendName}>{item.full_name}</Text>}
                        </View>
                    </View>
                    {!friendStatus[item.id] && (
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => sendFriendRequest(item.id)}
                        >
                            <Feather name="user-plus" size={18} color="#fff" />
                        </TouchableOpacity>
                    )}
                    {friendStatus[item.id] === 'pending' && (
                        <Text style={styles.pendingText}>Pending</Text>
                    )}
                </View>
            </TouchableOpacity>
        </Link>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Navigation Bar */}
            <View style={styles.navbar}>
                <View style={styles.navbarLeft}>
                    {/* Empty view for layout balance */}
                    <View style={{ width: 30 }} />
                </View>
                <View style={styles.navbarCenter}>
                    <Text style={styles.navbarTitle}>Friends</Text>
                </View>
                <View style={styles.navbarRight}>
                    {/* Updated Link component with proper path */}
                    <View style={{ width: 30 }} />
                </View>
            </View>

            {/* Main Content in ScrollView */}
            <ScrollView
                style={styles.scrollView}
                keyboardShouldPersistTaps="handled"
            >
                {/* Search Bar with integrated Cancel Button */}
                <View style={styles.searchBarContainer}>
                    <View style={styles.searchContainer}>
                        <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder={isSearchFocused ? "Search people" : "Search friends"}
                            placeholderTextColor="#666"
                            value={searchQuery}
                            onChangeText={handleSearchChange}
                            onFocus={handleSearchFocus}
                        />
                        {isSearchFocused && (
                            <TouchableOpacity
                                style={styles.inlineCancel}
                                onPress={handleSearchCancel}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Search Results */}
                {isSearchFocused ? (
                    <View style={styles.searchResultsContainer}>
                        {/* Search Loading State */}
                        {loadingSearch && (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color="#3897f0" />
                            </View>
                        )}

                        {/* Search Error State */}
                        {searchError && (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{searchError}</Text>
                            </View>
                        )}

                        {/* Empty Search State */}
                        {!loadingSearch && !searchError && searchQuery.length > 0 && searchResults.length === 0 && (
                            <Text style={styles.noResultsText}>
                                No users found matching "{searchQuery}"
                            </Text>
                        )}

                        {/* Search Results List */}
                        {!loadingSearch && searchResults.length > 0 && (
                            <FlatList
                                data={searchResults}
                                renderItem={renderSearchResult}
                                keyExtractor={item => item.id}
                                scrollEnabled={false}
                            />
                        )}
                    </View>
                ) : (
                    <>
                        {/* Invite Bar - Only shown when not searching */}
                        <Link href="/Screens/ContactInvites" asChild>
                            <TouchableOpacity style={styles.inviteBar}>
                                <View style={styles.inviteLeft}>

                                    <Image
                                        source={require('../../../assets/a1.png')}
                                        style={styles.logo}
                                        resizeMode='center'
                                    />
                                    <View style={styles.inviteTextContainer}>
                                        <Text style={styles.inviteText}>Invite your closest one's on NoCap</Text>
                                        <Text style={styles.inviteLinkText}>Invite now</Text>
                                    </View>
                                </View>
                                <Link href="/Screens/ContactInvites" asChild>
                                    <TouchableOpacity style={styles.inviteButton}>
                                        <Feather name="user-plus" size={24} color="#ffffff" />
                                    </TouchableOpacity>
                                </Link>
                            </TouchableOpacity>
                        </Link>

                        {/* Friends List Header */}
                        <Text style={styles.friendsHeader}>
                            My Friends ({friends.length})
                        </Text>

                        {/* Loading State */}
                        {loadingFriends && (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#3897f0" />
                            </View>
                        )}

                        {/* Error State */}
                        {friendsError && (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{friendsError}</Text>
                                <TouchableOpacity
                                    style={styles.retryButton}
                                    onPress={refreshFriends}
                                >
                                    <Text style={styles.retryText}>Retry</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Empty State */}
                        {!loadingFriends && !friendsError && friends.length === 0 && (
                            <View style={styles.emptyContainer}>
                                <Feather name="users" size={50} color="#666" />
                                <Text style={styles.emptyText}>No friends yet</Text>
                                <Text style={styles.emptySubtext}>
                                    Use the search to find and add friends.
                                    {'\n'}NoCap is fun with friends!
                                    {/* {'\n'}Note: Once you have 20 friends, you can no longer add more, and only you and your friends can see your profile or activity. */}
                                </Text>
                            </View>

                        )}

                        {/* Friends List */}
                        {!loadingFriends && !friendsError && friends.length > 0 && (
                            <FlatList
                                data={filteredFriends}
                                renderItem={renderFriend}
                                keyExtractor={item => item.id}
                                scrollEnabled={false}
                                ListEmptyComponent={
                                    searchQuery ? (
                                        <Text style={styles.noResultsText}>
                                            No friends match "{searchQuery}"
                                        </Text>
                                    ) : null
                                }
                            />
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

