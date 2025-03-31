import React from 'react';
import { TextInput, StyleSheet, View } from 'react-native';
import { styles } from './styles'

const TextInputComponent = ({ inputText, setInputText }) => {
    return (
        <View style={styles.inputContainer}>
            <TextInput
                style={styles.textInput}
                placeholder="Add your respone and drop it"
                placeholderTextColor="#666"
                multiline={true}
                value={inputText}
                onChangeText={setInputText}
                numberOfLines={5}
                textAlignVertical="top"
            />
        </View>
    );
};

export default TextInputComponent;