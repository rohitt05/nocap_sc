import React, { useState, useRef, useEffect } from 'react';
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
    Keyboard,
    RefreshControl,
    Animated,
    Dimensions,
    StatusBar
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useFetchFriends } from '../../../API/fetchFriends';
import { useSearchUsers } from '../../../API/searchFriends';
import { useFetchAllUsers } from '../../../API/useFetchAllUsers';
import { styles } from '../../components/TabStyles/friends';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = 60;
const BOTTOM_SHEET_MIN_HEIGHT = 80;

interface User {
    id: string;
    full_name: string;
    username: string;
    email: string;
    avatar_url: string | null;
    bio: string | null;
    created_at: string;
}

export default function Friends() {
    // Existing hooks
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
    const {
        allUsers,
        loading: loadingAllUsers,
        error: allUsersError,
        friendshipStatus,
        refreshAllUsers,
        sendFriendRequestToUser,
        isFriend,
        isPending,
        getCurrentUserId
    } = useFetchAllUsers();

    // Existing state
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Bottom sheet state
    const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState<boolean>(false);
    const bottomSheetAnim = useRef(new Animated.Value(0)).current;
    const mainContentOpacity = useRef(new Animated.Value(1)).current;
    const mainContentTranslateY = useRef(new Animated.Value(0)).current;

    // Get current user ID on mount
    useEffect(() => {
        const fetchCurrentUserId = async () => {
            const userId = await getCurrentUserId();
            setCurrentUserId(userId);
        };
        fetchCurrentUserId();
    }, []);

    // Filter friends based on search query when not in search mode
    const filteredFriends = friends.filter((friend: User) =>
        friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        friend.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filter all users to exclude current friends and current user
    const suggestedUsers = allUsers.filter((user: User) =>
        !isFriend(user.id) &&
        !isPending(user.id) &&
        user.id !== currentUserId
    );

    // Bottom sheet animation functions
    const expandBottomSheet = () => {
        setIsBottomSheetExpanded(true);
        Animated.parallel([
            Animated.timing(bottomSheetAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: false,
            }),
            Animated.timing(mainContentOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(mainContentTranslateY, {
                toValue: -50,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start();
    };

    const collapseBottomSheet = () => {
        Animated.parallel([
            Animated.timing(bottomSheetAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
            }),
            Animated.timing(mainContentOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(mainContentTranslateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start(() => {
            setIsBottomSheetExpanded(false);
        });
    };

    // Handle pull-to-refresh
    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await Promise.all([refreshFriends(), refreshAllUsers()]);
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

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
    const handleSearchChange = (text: string): void => {
        setSearchQuery(text);
        if (isSearchFocused) {
            searchUsers(text);
        }
    };

    // Handle friend removal
    const handleRemoveFriend = (friendId: string, username: string): void => {
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

    // Render components
    const renderFriend = ({ item }: { item: User }) => (
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

    const renderSearchResult = ({ item }: { item: User }) => (
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

    const renderSuggestedUser = ({ item }: { item: User }) => (
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
                    {isPending(item.id) ? (
                        <Text style={styles.pendingText}>Pending</Text>
                    ) : (
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => sendFriendRequestToUser(item.id)}
                        >
                            <Feather name="user-plus" size={18} color="#fff" />
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        </Link>
    );

    return (
        <SafeAreaView style={localStyles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />

            {/* Navigation Bar */}
            <View style={styles.navbar}>
                <View style={styles.navbarLeft}>
                    <View style={{ width: 30 }} />
                </View>
                <View style={styles.navbarCenter}>
                    <Text style={styles.navbarTitle}>Friends</Text>
                </View>
                <View style={styles.navbarRight}>
                    <View style={{ width: 30 }} />
                </View>
            </View>

            {/* Main Content */}
            <Animated.View
                style={[
                    localStyles.mainContent,
                    {
                        opacity: mainContentOpacity,
                        transform: [{ translateY: mainContentTranslateY }]
                    }
                ]}
            >
                <ScrollView
                    style={styles.scrollView}
                    keyboardShouldPersistTaps="handled"
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            tintColor="#3897f0"
                            colors={["#3897f0"]}
                        />
                    }
                >
                    {/* Search Bar */}
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
                            {loadingSearch && (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="small" color="#3897f0" />
                                </View>
                            )}

                            {searchError && (
                                <View style={styles.errorContainer}>
                                    <Text style={styles.errorText}>{searchError}</Text>
                                </View>
                            )}

                            {!loadingSearch && !searchError && searchQuery.length > 0 && searchResults.length === 0 && (
                                <Text style={styles.noResultsText}>
                                    No users found matching "{searchQuery}"
                                </Text>
                            )}

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
                            {/* Invite Bar */}
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
                                    <TouchableOpacity style={styles.inviteButton}>
                                        <Feather name="user-plus" size={24} color="#ffffff" />
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            </Link>

                            {/* Friends List Header */}
                            <Text style={styles.friendsHeader}>
                                My Friends ({friends.length})
                            </Text>

                            {/* Loading/Error/Empty States */}
                            {loadingFriends && (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color="#3897f0" />
                                </View>
                            )}

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

                            {!loadingFriends && !friendsError && friends.length === 0 && (
                                <View style={styles.emptyContainer}>
                                    <Feather name="users" size={50} color="#666" />
                                    <Text style={styles.emptyText}>No friends yet</Text>
                                    <Text style={styles.emptySubtext}>
                                        Use the search to find and add friends.
                                        {'\n'}NoCap is fun with friends!
                                    </Text>
                                </View>
                            )}

                            {/* Friends List */}
                            {!loadingFriends && !friendsError && friends.length > 0 && (
                                <FlatList
                                    data={filteredFriends}
                                    renderItem={renderFriend}
                                    keyExtractor={(item: User) => item.id}
                                    scrollEnabled={false}
                                    style={{ marginBottom: 100 }} // Add space for bottom sheet
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
            </Animated.View>

            {/* ✅ ENHANCED CONDITIONAL BOTTOM SHEET - Only render if friends <= 30 AND there are suggested users */}
            {friends.length <= 30 && suggestedUsers.length > 0 && (
                <Animated.View
                    style={[
                        localStyles.bottomSheet,
                        {
                            height: bottomSheetAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [BOTTOM_SHEET_MIN_HEIGHT, SCREEN_HEIGHT - HEADER_HEIGHT],
                            }),
                            transform: [{
                                translateY: bottomSheetAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 0],
                                }),
                            }],
                        }
                    ]}
                >
                    {/* Bottom Sheet Header */}
                    <TouchableOpacity
                        style={localStyles.bottomSheetHeader}
                        onPress={isBottomSheetExpanded ? collapseBottomSheet : expandBottomSheet}
                        activeOpacity={0.8}
                    >
                        <View style={localStyles.dragHandle} />
                        <View style={localStyles.bottomSheetTitleContainer}>
                            <View>
                                <Text style={localStyles.bottomSheetTitle}>
                                    Add More Friends
                                </Text>
                                <Text style={localStyles.bottomSheetSubtitle}>
                                    ...but remember less is more.
                                </Text>
                            </View>
                            <Feather
                                name={isBottomSheetExpanded ? "chevron-down" : "chevron-up"}
                                size={20}
                                color="#888"
                            />
                        </View>
                    </TouchableOpacity>

                    {/* Bottom Sheet Content */}
                    {isBottomSheetExpanded && (
                        <View style={localStyles.bottomSheetContent}>
                            {/* Suggested Users List */}
                            <ScrollView style={localStyles.suggestedUsersContainer}>
                                {loadingAllUsers && (
                                    <View style={styles.loadingContainer}>
                                        <ActivityIndicator size="large" color="#3897f0" />
                                    </View>
                                )}

                                {allUsersError && (
                                    <View style={styles.errorContainer}>
                                        <Text style={styles.errorText}>{allUsersError}</Text>
                                        <TouchableOpacity
                                            style={styles.retryButton}
                                            onPress={refreshAllUsers}
                                        >
                                            <Text style={styles.retryText}>Retry</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {!loadingAllUsers && !allUsersError && suggestedUsers.length > 0 && (
                                    <FlatList
                                        data={suggestedUsers}
                                        renderItem={renderSuggestedUser}
                                        keyExtractor={(item: User) => item.id}
                                        scrollEnabled={false}
                                    />
                                )}

                                {!loadingAllUsers && !allUsersError && suggestedUsers.length === 0 && (
                                    <View style={styles.emptyContainer}>
                                        <Feather name="users" size={50} color="#666" />
                                        <Text style={styles.emptyText}>No more users to add</Text>
                                        <Text style={styles.emptySubtext}>
                                            You've already added all available users as friends or sent them requests!
                                        </Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    )}
                </Animated.View>
            )}
        </SafeAreaView>
    );
}

const localStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    mainContent: {
        flex: 1,
    },
    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#111',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 10,
    },
    bottomSheetHeader: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#555',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 10,
    },
    bottomSheetTitleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bottomSheetTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    bottomSheetSubtitle: {
        fontSize: 14,
        color: '#888',
        fontStyle: 'italic',
        marginTop: 4,
    },
    bottomSheetContent: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: '#111',
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1,
        backgroundColor: '#222',
        borderRadius: 20,
        padding: 8,
    },
    suggestedUsersContainer: {
        flex: 1,
        paddingTop: 10,
    },
});
