// AlbumNamingModal.tsx - Optimized Clean UI
import React, { useState, useEffect, useCallback } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Alert, FlatList, StyleSheet, Dimensions, Animated } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { supabase } from '../../../../../../lib/supabase';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ✅ OPTIMIZED: Memoized user function
const getCurrentUser = async (): Promise<string | null> => {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
            console.error('❌ Error getting current user:', error);
            return null;
        }
        return user?.id || null;
    } catch (error) {
        console.error('❌ Exception getting current user:', error);
        return null;
    }
};

interface Album {
    id: string;
    name: string;
    description?: string;
    media_count: number;
    created_at: string;
}

interface AlbumNamingModalProps {
    visible: boolean;
    onClose: () => void;
    onCreateAlbum: (albumName: string) => void;
    onAddToExistingAlbum: (albumId: string, albumName: string) => void;
    locationName: string;
    isCreating: boolean;
}

const AlbumNamingModal: React.FC<AlbumNamingModalProps> = ({
    visible,
    onClose,
    onCreateAlbum,
    onAddToExistingAlbum,
    locationName,
    isCreating
}) => {
    const [albumName, setAlbumName] = useState(locationName);
    const [showExistingAlbums, setShowExistingAlbums] = useState(false);
    const [existingAlbums, setExistingAlbums] = useState<Album[]>([]);
    const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
    const [selectedAlbumName, setSelectedAlbumName] = useState<string>('');
    const [isLoadingAlbums, setIsLoadingAlbums] = useState(false);
    const [slideAnimation] = useState(new Animated.Value(0));

    // ✅ OPTIMIZED: Smoother animation
    useEffect(() => {
        if (visible) {
            Animated.timing(slideAnimation, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            slideAnimation.setValue(0);
        }
    }, [visible]);

    // Reset state when modal opens
    useEffect(() => {
        if (visible) {
            setAlbumName(locationName);
            setShowExistingAlbums(false);
            setSelectedAlbumId(null);
            setSelectedAlbumName('');
            fetchExistingAlbums();
        }
    }, [visible, locationName]);

    // ✅ OPTIMIZED: Memoized fetch function
    const fetchExistingAlbums = useCallback(async () => {
        try {
            setIsLoadingAlbums(true);
            const userId = await getCurrentUser();

            if (!userId) {
                Alert.alert('Error', 'User not authenticated');
                return;
            }

            const { data: albums, error } = await supabase
                .from('albums')
                .select('id, name, description, media_count, created_at')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setExistingAlbums(albums || []);

        } catch (error) {
            console.error('❌ Error fetching existing albums:', error);
            Alert.alert('Error', 'Failed to load existing albums. Please try again.');
            setExistingAlbums([]);
        } finally {
            setIsLoadingAlbums(false);
        }
    }, []);

    const handleToggleMode = useCallback(() => {
        setShowExistingAlbums(prev => !prev);
        setSelectedAlbumId(null);
        setSelectedAlbumName('');
    }, []);

    const handleSelectAlbum = useCallback((album: Album) => {
        setSelectedAlbumId(album.id);
        setSelectedAlbumName(album.name);
        console.log('📂 Selected album:', album.name);
    }, []);

    const handleConfirm = useCallback(() => {
        if (showExistingAlbums) {
            if (!selectedAlbumId || !selectedAlbumName) {
                Alert.alert('Select Album', 'Please select an album to add your media to');
                return;
            }
            onAddToExistingAlbum(selectedAlbumId, selectedAlbumName);
        } else {
            if (!albumName.trim()) {
                Alert.alert('Album Name Required', 'Please enter an album name');
                return;
            }
            onCreateAlbum(albumName.trim());
        }
    }, [showExistingAlbums, selectedAlbumId, selectedAlbumName, albumName, onAddToExistingAlbum, onCreateAlbum]);

    const handleClose = useCallback(() => {
        Animated.timing(slideAnimation, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            setAlbumName(locationName);
            setShowExistingAlbums(false);
            setSelectedAlbumId(null);
            setSelectedAlbumName('');
            onClose();
        });
    }, [slideAnimation, locationName, onClose]);

    // ✅ OPTIMIZED: Memoized render function
    const renderAlbumItem = useCallback(({ item, index }: { item: Album; index: number }) => {
        const isSelected = selectedAlbumId === item.id;

        return (
            <Animated.View
                style={[
                    styles.albumItemWrapper,
                    {
                        opacity: slideAnimation,
                        transform: [{
                            translateY: slideAnimation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [30 * (index + 1), 0]
                            })
                        }]
                    }
                ]}
            >
                <TouchableOpacity
                    style={[
                        styles.albumItem,
                        isSelected && styles.albumItemSelected
                    ]}
                    onPress={() => handleSelectAlbum(item)}
                    activeOpacity={0.7}
                >
                    <View style={styles.albumItemContent}>
                        <View style={styles.albumIconContainer}>
                            <MaterialIcons
                                name="folder"
                                size={24}
                                color={isSelected ? '#000' : '#999'}
                            />
                        </View>

                        <View style={styles.albumTextContainer}>
                            <Text style={[
                                styles.albumItemName,
                                isSelected && styles.albumItemNameSelected
                            ]}>
                                {item.name}
                            </Text>
                            <Text style={[
                                styles.albumItemInfo,
                                isSelected && styles.albumItemInfoSelected
                            ]}>
                                {item.media_count || 0} {item.media_count === 1 ? 'item' : 'items'} • {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </Text>
                        </View>

                        <View style={styles.albumSelectionIndicator}>
                            {isSelected && (
                                <View style={styles.selectedCheckmark}>
                                    <MaterialIcons name="check" size={16} color="#000" />
                                </View>
                            )}
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    }, [selectedAlbumId, slideAnimation, handleSelectAlbum]);

    const slideTransform = {
        transform: [{
            translateY: slideAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [SCREEN_HEIGHT, 0]
            })
        }]
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none"
            onRequestClose={handleClose}
        >
            <BlurView intensity={15} style={styles.modalOverlay}>
                <TouchableOpacity
                    style={styles.backgroundDismiss}
                    onPress={handleClose}
                    activeOpacity={1}
                />

                <Animated.View style={[styles.modalContainer, slideTransform]}>
                    <View style={styles.modalContent}>
                        {/* Clean Header */}
                        <View style={styles.modalHeader}>
                            <View style={styles.dragIndicator} />

                            <View style={styles.headerContent}>
                                <View style={styles.headerLeft}>
                                    <View style={styles.headerIconContainer}>
                                        <MaterialIcons name="collections" size={20} color="#000" />
                                    </View>
                                    <Text style={styles.modalTitle}>
                                        {showExistingAlbums ? 'Add to Album' : 'Create Album'}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={handleClose}
                                >
                                    <Ionicons name="close" size={20} color="#666" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Location Badge */}
                        <View style={styles.locationBadge}>
                            <MaterialIcons name="location-on" size={14} color="#666" />
                            <Text style={styles.locationText}>{locationName}</Text>
                        </View>

                        {/* Mode Toggle - Clean Switch Design */}
                        <View style={styles.modeToggleContainer}>
                            <TouchableOpacity
                                style={[styles.modeToggleButton, !showExistingAlbums && styles.modeToggleActive]}
                                onPress={() => !showExistingAlbums || handleToggleMode()}
                                disabled={isCreating}
                            >
                                <MaterialIcons name="add-circle-outline" size={18} color={!showExistingAlbums ? '#000' : '#666'} />
                                <Text style={[styles.modeToggleText, !showExistingAlbums && styles.modeToggleTextActive]}>
                                    Create New
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modeToggleButton, showExistingAlbums && styles.modeToggleActive]}
                                onPress={() => showExistingAlbums || handleToggleMode()}
                                disabled={isCreating}
                            >
                                <MaterialIcons name="folder-open" size={18} color={showExistingAlbums ? '#000' : '#666'} />
                                <Text style={[styles.modeToggleText, showExistingAlbums && styles.modeToggleTextActive]}>
                                    Add to Existing
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Content Area */}
                        <View style={styles.contentContainer}>
                            {showExistingAlbums ? (
                                /* Albums List */
                                <View style={styles.albumsSection}>
                                    <Text style={styles.sectionTitle}>Choose Album</Text>

                                    {isLoadingAlbums ? (
                                        <View style={styles.loadingState}>
                                            <Animated.View
                                                style={[
                                                    styles.loadingSpinner,
                                                    {
                                                        transform: [{
                                                            rotate: slideAnimation.interpolate({
                                                                inputRange: [0, 1],
                                                                outputRange: ['0deg', '360deg']
                                                            })
                                                        }]
                                                    }
                                                ]}
                                            >
                                                <MaterialIcons name="refresh" size={28} color="#999" />
                                            </Animated.View>
                                            <Text style={styles.loadingText}>Loading your albums...</Text>
                                        </View>
                                    ) : existingAlbums.length === 0 ? (
                                        <View style={styles.emptyState}>
                                            <View style={styles.emptyIconContainer}>
                                                <MaterialIcons name="photo-library" size={48} color="#444" />
                                            </View>
                                            <Text style={styles.emptyTitle}>No Albums Yet</Text>
                                            <Text style={styles.emptySubtitle}>Create your first album to get started!</Text>
                                        </View>
                                    ) : (
                                        <FlatList
                                            data={existingAlbums}
                                            keyExtractor={(item) => item.id}
                                            renderItem={renderAlbumItem}
                                            style={styles.albumsList}
                                            contentContainerStyle={styles.albumsListContent}
                                            showsVerticalScrollIndicator={false}
                                            bounces={true}
                                            scrollEventThrottle={16}
                                            removeClippedSubviews={true}
                                            maxToRenderPerBatch={10}
                                            windowSize={10}
                                        />
                                    )}
                                </View>
                            ) : (
                                /* Input Section */
                                <View style={styles.inputSection}>
                                    <Text style={styles.inputSectionTitle}>Album Details</Text>

                                    <View style={styles.inputWrapper}>
                                        <Text style={styles.inputLabel}>Album Name</Text>
                                        <View style={styles.inputContainer}>
                                            <TextInput
                                                style={styles.textInput}
                                                value={albumName}
                                                onChangeText={setAlbumName}
                                                placeholder="Enter a memorable name..."
                                                placeholderTextColor="#666"
                                                maxLength={50}
                                                autoFocus={!showExistingAlbums}
                                                selectTextOnFocus
                                            />
                                            <View style={styles.inputUnderline} />
                                        </View>
                                        <Text style={styles.characterCounter}>
                                            {albumName.length}/50 characters
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actionsContainer}>
                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={handleClose}
                                disabled={isCreating}
                            >
                                <Text style={styles.secondaryButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.primaryButton,
                                    (isCreating || (showExistingAlbums && !selectedAlbumId)) && styles.buttonDisabled
                                ]}
                                onPress={handleConfirm}
                                disabled={isCreating || (showExistingAlbums && !selectedAlbumId)}
                            >
                                <Text style={styles.primaryButtonText}>
                                    {isCreating ? 'Processing...' :
                                        showExistingAlbums ? 'Add to Album' : 'Create Album'}
                                </Text>
                                <Ionicons
                                    name={isCreating ? "hourglass" : showExistingAlbums ? "add" : "save"}
                                    size={16}
                                    color="#000"
                                    style={{ marginLeft: 8 }}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </BlurView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backgroundDismiss: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    modalContainer: {
        height: SCREEN_HEIGHT * 0.85,
        marginHorizontal: 0,
    },
    modalContent: {
        flex: 1,
        backgroundColor: '#000',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 8,
    },
    modalHeader: {
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    dragIndicator: {
        width: 40,
        height: 4,
        backgroundColor: '#444',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    headerIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: 'white',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#222',
        alignItems: 'center',
        justifyContent: 'center',
    },
    locationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: '#222',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginHorizontal: 24,
        marginBottom: 24,
    },
    locationText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 6,
    },
    modeToggleContainer: {
        flexDirection: 'row',
        marginHorizontal: 24,
        marginBottom: 24,
        backgroundColor: '#222',
        borderRadius: 16,
        padding: 4,
    },
    modeToggleButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
    },
    modeToggleActive: {
        backgroundColor: '#FFF',
    },
    modeToggleText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginLeft: 6,
    },
    modeToggleTextActive: {
        color: '#000',
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 24,
    },
    albumsSection: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
        marginBottom: 16,
    },
    loadingState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    loadingSpinner: {
        marginBottom: 16,
    },
    loadingText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#222',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: 'white',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        lineHeight: 20,
    },
    albumsList: {
        flex: 1,
    },
    albumsListContent: {
        paddingBottom: 20,
    },
    albumItemWrapper: {
        marginBottom: 12,
    },
    albumItem: {
        borderRadius: 16,
        backgroundColor: '#111',
        overflow: 'hidden',
    },
    albumItemSelected: {
        backgroundColor: '#FFF',
    },
    albumItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    albumIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#222',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    albumTextContainer: {
        flex: 1,
    },
    albumItemName: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginBottom: 4,
    },
    albumItemNameSelected: {
        color: '#000',
    },
    albumItemInfo: {
        fontSize: 12,
        color: '#999',
    },
    albumItemInfoSelected: {
        color: '#666',
    },
    albumSelectionIndicator: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedCheckmark: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputSection: {
        flex: 1,
        paddingTop: 20,
    },
    inputSectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
        marginBottom: 24,
    },
    inputWrapper: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#999',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    inputContainer: {
        position: 'relative',
    },
    textInput: {
        fontSize: 18,
        color: 'white',
        paddingVertical: 16,
        paddingHorizontal: 0,
        backgroundColor: 'transparent',
        borderWidth: 0,
    },
    inputUnderline: {
        height: 2,
        backgroundColor: '#FFF',
        borderRadius: 1,
        marginTop: 4,
    },
    characterCounter: {
        fontSize: 12,
        color: '#666',
        textAlign: 'right',
        marginTop: 8,
    },
    actionsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: 20,
        gap: 16,
    },
    secondaryButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 16,
        backgroundColor: '#222',
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#999',
    },
    primaryButton: {
        flex: 1,
        borderRadius: 16,
        backgroundColor: '#FFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
});

export default AlbumNamingModal;
