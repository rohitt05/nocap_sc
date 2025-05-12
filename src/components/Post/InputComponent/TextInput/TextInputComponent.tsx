import React, { useState } from 'react';
import { TextInput, StyleSheet, View } from 'react-native';

const TextInputComponent = ({ inputText, setInputText }) => {
    const [height, setHeight] = useState(120); // Initial height, slightly bigger than before

    // Function to handle content size change and adjust height dynamically
    const handleContentSizeChange = (event) => {
        const { height } = event.nativeEvent.contentSize;
        setHeight(Math.max(120, height)); // Minimum height of 120, but grows as needed
    };

    return (
        <View style={styles.inputContainer}>
            <TextInput
                style={[styles.textInput, { height }]}
                placeholder="Poems, thoughts, stories, or anything else you want to share..."
                placeholderTextColor="#999"
                multiline={true}
                value={inputText}
                onChangeText={setInputText}
                onContentSizeChange={handleContentSizeChange}
                textAlignVertical="top"
                blurOnSubmit={false}
            />
        </View>
    );
};

// Enhanced styles with dark background (#111) for the text input
const styles = StyleSheet.create({
    inputContainer: {
        marginVertical: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        padding: 2,
    },
    textInput: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        borderRadius: 12,
        backgroundColor: '#111', // Changed to dark background as requested
        borderWidth: 1,
        borderColor: '#333', // Darkened border to match the new background
        color: '#fff', // Changed text color to white for better visibility on dark background
    },
});

export default TextInputComponent;