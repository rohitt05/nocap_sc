import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { ResponseItemProps } from '../../types';
import { Entypo, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './styles';
import { Link } from 'expo-router';


const TextResponse: React.FC<ResponseItemProps> = ({ item }) => {
    // State to track if the content is expanded
    const [expanded, setExpanded] = useState(false);
    // State to track if content is long enough to need expansion
    const [needsExpansion, setNeedsExpansion] = useState(false);
    // Ref for the text component to measure its height
    const textRef = useRef(null);

    // Format timestamp in the desired format: "17 Mar · 3:24 PM"
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const day = date.getDate();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = monthNames[date.getMonth()];
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

        return `${day} ${month} · ${formattedHours}:${formattedMinutes} ${ampm}`;
    };

    // Function to check if content needs expansion button
    useEffect(() => {
        if (textRef.current) {
            // Improved line counting logic
            const charsPerLine = 40; // Adjusted based on font size and container width
            const text = item.content || '';

            // Count actual lines by looking for newlines
            const newlineCount = (text.match(/\n/g) || []).length;

            // Calculate approximate lines from text length
            // Adjust this calculation based on your font size and container width
            const textLength = text.length;
            const estimatedLines = Math.ceil(textLength / charsPerLine);

            // Use the greater of the two counts
            const totalLines = Math.max(newlineCount + 1, estimatedLines);

            // Only show expansion button if we have more than 3 lines
            setNeedsExpansion(totalLines > 3);
        }
    }, [item.content]);

    // For more accurate line counting after render
    useEffect(() => {
        // This would be replaced with actual measurement in a real app
        // Using onLayout or similar to get the actual number of lines
        const measureTextLines = () => {
            if (textRef.current && Platform && Platform.OS === 'ios') {
                // On iOS, we could use the numberOfLines property
                // This is pseudo-code and would need to be implemented properly
                // textRef.current.measure((x, y, width, height) => {
                //    const actualLines = Math.floor(height / lineHeight);
                //    setNeedsExpansion(actualLines > 3);
                // });
            }
        };

        // Run with a small delay to ensure text has rendered
        const timeout = setTimeout(measureTextLines, 100);
        return () => clearTimeout(timeout);
    }, []);

    // Toggle expanded state
    const toggleExpanded = () => {
        setExpanded(!expanded);
    };

    return (
        <View style={[
            styles.responseItem,
            // Dynamic height based on content and expansion state
            expanded ? styles.expanded : (needsExpansion ? styles.defaultHeight : styles.compactHeight)
        ]}>
            <View style={styles.contentContainer}>

                <View style={styles.header}>
                    <Link href={`/Screens/user/users?id=${item.user.id}`} asChild>
                        <TouchableOpacity>
                            <Image
                                source={{ uri: item.user.avatar || 'https://via.placeholder.com/40' }}
                                style={styles.profilePic}
                            />
                        </TouchableOpacity>
                    </Link>
                    <View style={styles.headerInfo}>
                        <Link href={`/Screens/user/users?id=${item.user.id}}`} asChild>
                            <TouchableOpacity>
                                <Text style={styles.username}>{item.user.username}</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>


                {/* Header right section with timestamp and menu dots */}
                <View style={styles.headerRight}>
                    <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
                    <TouchableOpacity style={styles.menuDotsContainer}>
                        <Entypo name="dots-two-vertical" size={16} color="#fff" style={styles.menuDots} />
                    </TouchableOpacity>
                </View>

                {/* Text content with quote icon */}
                <View style={styles.textContentContainer}>
                    <MaterialCommunityIcons
                        name="format-quote-open-outline"
                        size={24}
                        color="#e0e0e0"
                        style={styles.quoteIcon}
                    />
                    <Text
                        ref={textRef}
                        style={styles.textContent}
                        numberOfLines={expanded ? undefined : 3}
                        onTextLayout={(e) => {
                            // Most accurate way to count lines on both iOS and Android
                            const linesCount = e.nativeEvent.lines.length;
                            setNeedsExpansion(linesCount > 3);
                        }}
                    >
                        {item.content}
                    </Text>
                </View>

                {/* Only render the Show more/less button if needed */}
                {needsExpansion && (
                    <TouchableOpacity
                        style={styles.moreButton}
                        onPress={toggleExpanded}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.moreButtonText}>
                            {expanded ? "Show less" : "Show more"}
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Always render reaction container at the bottom right */}
                <View style={styles.reactionsContainer}>
                    {/* Feather icon */}
                    <Feather name="send" size={18} color="#fff" style={styles.sendIcon} />
                    {/* Emoji icons */}
                    <TouchableOpacity style={styles.reactionButton}>
                        <Entypo name="emoji-flirt" size={18} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.reactionButton}>
                        <Entypo name="emoji-happy" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default TextResponse;