import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Linking } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

interface DropdownItemProps {
    icon: React.ReactNode;
    title: string;
    children: string;
}

const DropdownItem: React.FC<DropdownItemProps> = ({
    icon,
    title,
    children
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleDropdown = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <View style={styles.dropdownContainer}>
            <TouchableOpacity
                style={styles.optionItem}
                onPress={toggleDropdown}
            >
                <View style={styles.iconContainer}>
                    {icon}
                </View>
                <Text style={styles.optionText}>{title}</Text>
                <MaterialIcons
                    name={isExpanded ? "expand-less" : "expand-more"}
                    size={24}
                    color="#666"
                />
            </TouchableOpacity>

            {isExpanded && (
                <View style={styles.dropdownContent}>
                    <ScrollView>
                        <Text style={styles.dropdownText}>{children}</Text>
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

const Help = () => {
    const handleContactUs = () => {
        const email = 'rohitkattimani172@gmail.com';
        const subject = 'App Support Inquiry';
        const body = 'Hello,\n\nI have a question about the app:\n';

        Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />

            {/* Header */}
            <View style={styles.header}>
                <Link href=".." asChild>
                    <TouchableOpacity style={styles.backButton}>
                        <MaterialIcons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                </Link>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Help</Text>
                </View>
                <View style={styles.backButton} />
            </View>

            {/* Help Options */}
            <ScrollView style={styles.content}>
                {/* Help Center */}
                <DropdownItem
                    icon={<Ionicons name="help-circle-outline" size={24} color="white" />}
                    title="Help Center"
                >
                    {`User Support Guidelines:

1. App Navigation
• Explore our intuitive interface
• Use side menu for quick access
• Tap help icons for context-specific assistance

2. Troubleshooting
• Check internet connection
• Restart the app for minor glitches
• Clear app cache if performance issues persist

3. Feature Explanations
• Detailed tooltips available
• Contextual help within each screen
• Video tutorials coming soon

4. Frequently Asked Questions (FAQ)
• Covers common user queries
• Updated regularly
• Comprehensive problem-solving resource

5. Community Support
• User forums available
• Peer-to-peer problem solving
• Share experiences and tips`}
                </DropdownItem>

                {/* Contact Us */}
                <TouchableOpacity
                    style={styles.optionItem}
                    onPress={handleContactUs}
                >
                    <View style={styles.iconContainer}>
                        <MaterialIcons name="email" size={24} color="white" />
                    </View>
                    <Text style={styles.optionText}>Contact us</Text>
                    <MaterialIcons name="chevron-right" size={24} color="#666" />
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 40,
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    content: {
        marginHorizontal: 20,
        marginTop: 20,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#222',
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
    },
    dropdownContainer: {
        marginBottom: 16,
    },
    dropdownContent: {
        backgroundColor: '#000',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        padding: 16,
    },
    dropdownText: {
        color: 'white',
        fontSize: 14,
        lineHeight: 24,
    },
    iconContainer: {
        marginRight: 16,
    },
    optionText: {
        flex: 1,
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default Help;