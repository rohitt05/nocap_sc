import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Keyboard, Platform } from 'react-native';
import TextInputComponent from './TextInput';
import GifInputComponent from './Gif';
import VoiceInputComponent from './VoiceInput';
import MediaInputComponent from './MediaInput';

const InputComponent = ({
    activeTab = 'TEXT',
    inputText,
    setInputText,
    onGifSelect,
    onVoiceRecording,
    onMediaSelect
}) => {
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    // Add keyboard listeners
    useEffect(() => {
        const keyboardWillShowListener = Platform.OS === 'ios' 
            ? Keyboard.addListener('keyboardWillShow', (e) => {
                setKeyboardVisible(true);
                setKeyboardHeight(e.endCoordinates.height);
              })
            : Keyboard.addListener('keyboardDidShow', (e) => {
                setKeyboardVisible(true);
                setKeyboardHeight(e.endCoordinates.height);
              });
            
        const keyboardWillHideListener = Platform.OS === 'ios'
            ? Keyboard.addListener('keyboardWillHide', () => {
                setKeyboardVisible(false);
                setKeyboardHeight(0);
              })
            : Keyboard.addListener('keyboardDidHide', () => {
                setKeyboardVisible(false);
                setKeyboardHeight(0);
              });

        return () => {
            keyboardWillShowListener.remove();
            keyboardWillHideListener.remove();
        };
    }, []);

    // Get dynamic height based on keyboard visibility
    const getContainerHeight = () => {
        // When in MEDIA tab and keyboard is visible, expand the container
        if (activeTab === 'MEDIA' && isKeyboardVisible) {
            return { flex: 1 }; // Take full available space
        }
        
        return styles.responseArea;
    };

    // Render input based on active tab
    const renderInput = () => {
        switch (activeTab) {
            case 'TEXT':
                return <TextInputComponent inputText={inputText} setInputText={setInputText} />;
            case 'GIF':
                return <GifInputComponent onGifSelect={onGifSelect} />;
            case 'VOICE':
                return <VoiceInputComponent onRecordingComplete={onVoiceRecording} />;
            case 'MEDIA':
                return (
                    <MediaInputComponent 
                        onMediaSelect={onMediaSelect} 
                        isKeyboardVisible={isKeyboardVisible}
                        keyboardHeight={keyboardHeight}
                    />
                );
            default:
                return <TextInputComponent inputText={inputText} setInputText={setInputText} />;
        }
    };

    return (
        <View style={[getContainerHeight(), activeTab === 'MEDIA' && styles.mediaContainer]}>
            {renderInput()}
        </View>
    );
};

const styles = StyleSheet.create({
    responseArea: {
        height: 200,
        flex: 1,
        marginBottom: 10,
        overflow: 'hidden',
    },
    mediaContainer: {
        position: 'relative',
        zIndex: 10, // Ensure media container is above other elements
    }
});

export default InputComponent;