import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface MediaCaptionResponseProps {
  caption?: string;
  style?: object;
}

const MediaCaptionResponse: React.FC<MediaCaptionResponseProps> = ({ caption, style }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [numberOfLines, setNumberOfLines] = useState(2);

  // Skip rendering if no caption
  if (!caption) return null;

  const toggleReadMore = () => {
    setIsExpanded(!isExpanded);
    setNumberOfLines(isExpanded ? 2 : 0); // 0 means no limit
  };

  // This function checks if text was actually truncated
  const onTextLayout = (e: any) => {
    const { nativeEvent } = e;
    // Check if text was truncated (more lines than we're showing)
    setIsTruncated(nativeEvent.lines.length > 2);
  };

  return (
    <View style={[styles.captionContainer, style]}>
      <Text 
        style={styles.captionText}
        numberOfLines={numberOfLines}
        onTextLayout={onTextLayout}
      >
        {caption}
      </Text>
      
      {isTruncated && (
        <TouchableOpacity onPress={toggleReadMore} style={styles.readMoreButton}>
          <Text style={styles.readMoreText}>
            {isExpanded ? 'Read less' : 'Read more'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  captionContainer: {
  
  },
  captionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  readMoreButton: {
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    color: '#3b56d9', // Blue color
    fontSize: 14,
    fontWeight: '600',
  }
});

export default MediaCaptionResponse;