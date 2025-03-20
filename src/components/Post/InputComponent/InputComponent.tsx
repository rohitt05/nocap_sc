import React from 'react';
import { View, StyleSheet } from 'react-native';
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
                return <MediaInputComponent onMediaSelect={onMediaSelect} />;
            default:
                return <TextInputComponent inputText={inputText} setInputText={setInputText} />;
        }
    };

    return (
        <View style={styles.responseArea}>
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
});

export default InputComponent;