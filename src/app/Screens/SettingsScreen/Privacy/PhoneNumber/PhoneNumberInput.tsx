import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    FlatList,
    Pressable,
    Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
    CountryCode,
    countryCodes,
    loadPhoneData,
    savePhoneNumber,
    syncPhoneData
} from './utils';

interface PhoneNumberInputProps {
    onPhoneNumberUploaded?: () => void;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({ onPhoneNumberUploaded }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedCountry, setSelectedCountry] = useState<CountryCode>(countryCodes[0]);
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Load phone data when component mounts
    useEffect(() => {
        const initializePhoneData = async () => {
            try {
                setInitialLoading(true);

                // Try to sync data from both local storage and database
                const { phoneNumber, selectedCountry, isDataSaved } = await syncPhoneData();

                setPhoneNumber(phoneNumber);
                setSelectedCountry(selectedCountry);
                setSaved(isDataSaved);
            } catch (error) {
                console.error('Error initializing phone data:', error);
            } finally {
                setInitialLoading(false);
            }
        };

        initializePhoneData();
    }, []);

    const handleSavePhoneNumber = async () => {
        if (!phoneNumber.trim()) return;

        setLoading(true);

        try {
            const { success, error } = await savePhoneNumber(phoneNumber, selectedCountry);

            if (!success) {
                Alert.alert(
                    'Error Saving Phone Number',
                    error || 'Failed to save phone number. Please try again.',
                    [{ text: 'OK' }]
                );
                return;
            }

            setSaved(true);
            setIsEditing(false);

            // Notify parent component that phone number has been successfully uploaded
            if (onPhoneNumberUploaded) {
                onPhoneNumberUploaded();
            }
        } catch (error) {
            console.error('Error in handleSavePhoneNumber:', error);
            Alert.alert(
                'Error',
                'An unexpected error occurred. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        // If we had a saved number before, restore it and exit edit mode
        if (saved) {
            // We don't need to reload the number since we never changed it in state
            setIsEditing(false);
        }
    };

    const selectCountry = (country: CountryCode) => {
        setSelectedCountry(country);
        setShowCountryPicker(false);
    };

    const renderCountryItem = ({ item }: { item: CountryCode }) => (
        <TouchableOpacity
            style={styles.countryItem}
            onPress={() => selectCountry(item)}
        >
            <Text style={styles.countryFlag}>{item.flag}</Text>
            <Text style={styles.countryName}>{item.name}</Text>
            <Text style={styles.countryCode}>{item.code}</Text>
            {selectedCountry.code === item.code && (
                <MaterialIcons name="check" size={20} color="#2196F3" />
            )}
        </TouchableOpacity>
    );

    // Show loading indicator while initializing
    if (initialLoading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={styles.loadingText}>Loading phone data...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.phoneInputContainer}>
                <TouchableOpacity
                    style={styles.countryCodeContainer}
                    onPress={() => !loading && (saved && !isEditing ? handleEdit() : setShowCountryPicker(true))}
                    disabled={loading}
                >
                    <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
                    <Text style={styles.countryCodeText}>{selectedCountry.code}</Text>
                    <MaterialIcons name="arrow-drop-down" size={20} color="#fff" />
                </TouchableOpacity>
                <TextInput
                    style={styles.phoneInput}
                    placeholder="Enter your phone number"
                    placeholderTextColor="#888"
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    editable={!loading && (isEditing || !saved)}
                />
            </View>

            {!saved || isEditing ? (
                <View style={styles.buttonContainer}>
                    {isEditing && (
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleCancel}
                            disabled={loading}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            !phoneNumber.trim() && styles.disabledButton,
                            isEditing && styles.editButton
                        ]}
                        onPress={handleSavePhoneNumber}
                        disabled={!phoneNumber.trim() || loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.saveButtonText}>{saved ? 'Update' : 'Save'}</Text>
                        )}
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.savedContainer}>
                    <View style={styles.verifiedContainer}>
                        <MaterialIcons name="check-circle" size={18} color="#4caf50" />
                        <Text style={styles.savedText}>Phone number verified</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.editButtonSmall}
                        onPress={handleEdit}
                    >
                        <MaterialIcons name="edit" size={16} color="#2196F3" />
                        <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                </View>
            )}

            <Text style={styles.infoText}>
                Your phone number is only used to help friends find your profile. It won't be displayed on your profile.
            </Text>

            {/* Country Code Picker Modal */}
            <Modal
                visible={showCountryPicker}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowCountryPicker(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setShowCountryPicker(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Country</Text>
                            <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                                <MaterialIcons name="close" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={countryCodes}
                            renderItem={renderCountryItem}
                            keyExtractor={(item) => item.code}
                            style={styles.countryList}
                        />
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1a1a1a',
        marginHorizontal: 16,
        marginVertical: 4,
        borderRadius: 12,
        padding: 14,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    loadingText: {
        color: '#fff',
        marginTop: 12,
        fontSize: 14,
    },
    phoneInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2c2c2c',
        borderRadius: 8,
        overflow: 'hidden',
    },
    countryCodeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 14,
        borderRightWidth: 1,
        borderRightColor: '#3a3a3a',
    },
    countryFlag: {
        fontSize: 16,
        marginRight: 6,
    },
    countryCodeText: {
        color: '#fff',
        fontSize: 16,
    },
    phoneInput: {
        flex: 1,
        color: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 14,
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        marginTop: 12,
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#2196F3',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    editButton: {
        flex: 1,
    },
    disabledButton: {
        backgroundColor: '#2196F380',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#424242',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginRight: 8,
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    savedContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
    },
    verifiedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    savedText: {
        color: '#4caf50',
        marginLeft: 8,
        fontSize: 14,
    },
    editButtonSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 6,
    },
    editButtonText: {
        color: '#2196F3',
        marginLeft: 4,
        fontSize: 14,
    },
    infoText: {
        color: '#aaa',
        fontSize: 13,
        marginTop: 12,
        lineHeight: 18,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#121212',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#2c2c2c',
    },
    modalTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    countryList: {
        padding: 8,
    },
    countryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#2c2c2c',
    },
    countryName: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        marginLeft: 12,
    },
    countryCode: {
        color: '#aaa',
        fontSize: 16,
        marginRight: 8,
    },
});

export default PhoneNumberInput;