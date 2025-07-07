import React, { useState } from 'react';
import { TextInput, StyleSheet, View } from 'react-native';

const TextInputComponent = ({ inputText, setInputText }) => {
    const [height, setHeight] = useState(120); // Initial height
    const maxHeight = 200; // Set maximum height for scrolling

    // Function to handle content size change and adjust height dynamically
    const handleContentSizeChange = (event) => {
        const { height: contentHeight } = event.nativeEvent.contentSize;
        // Grow until maxHeight, then allow scrolling
        setHeight(Math.max(120, Math.min(contentHeight, maxHeight)));
    };

    return (
        <View style={styles.inputContainer}>
            <TextInput
                style={[styles.textInput, { height }]}
                placeholder="Poems, thoughts, stories, or anything else you want to share..."
                placeholderTextColor="#999"
                multiline={true}
                scrollEnabled={true} // Explicitly enable scrolling
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
        backgroundColor: '#111',
        borderWidth: 1,
        borderColor: '#333',
        color: '#fff',
        maxHeight: 200, // Add maximum height to enable scrolling
    },
});

export default TextInputComponent;