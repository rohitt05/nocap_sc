import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Linking } from 'react-native';
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';

interface DropdownItemProps {
    icon: React.ReactNode;
    title: string;
    children: string;
    versionText?: string;
}

const DropdownItem: React.FC<DropdownItemProps> = ({
    icon,
    title,
    children,
    versionText
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    const toggleDropdown = () => {
        setIsExpanded(!isExpanded);
        if (isExpanded && scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: 0, animated: false });
        }
    };

    return (
        <View style={styles.dropdownContainer}>
            <TouchableOpacity
                style={styles.optionItem}
                onPress={toggleDropdown}
                activeOpacity={0.7}
            >
                <View style={styles.iconContainer}>
                    {icon}
                </View>
                <Text style={styles.optionText}>{title}</Text>
                {versionText && <Text style={styles.versionText}>{versionText}</Text>}
                <MaterialIcons
                    name={isExpanded ? "expand-less" : "expand-more"}
                    size={24}
                    color="#666"
                />
            </TouchableOpacity>

            {isExpanded && (
                <View style={styles.dropdownContent}>
                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.dropdownScrollView}
                        contentContainerStyle={styles.dropdownScrollViewContent}
                    >
                        <Text style={styles.dropdownText}>{children}</Text>
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

const About = () => {
    const handleExternalLink = (url: string) => {
        Linking.openURL(url);
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
                    <Text style={styles.headerTitle}>About</Text>
                </View>
                <View style={styles.backButton} />
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                {/* App Version */}
                <DropdownItem
                    icon={<Ionicons name="information-circle-outline" size={24} color="white" />}
                    title="App Version"
                    versionText="0.0.1 (000)"
                >
                    {`This is version 0.0.1 of our application. 

Key Details:
• Initial release
• Early development stage
• Baseline features implemented

Our commitment is to continuously improve and enhance your experience with regular updates.`}
                </DropdownItem>

                {/* Terms of Service */}
                <View style={styles.linkContainer}>
                    <TouchableOpacity
                        style={styles.linkItem}
                        onPress={() => handleExternalLink('https://noocap.netlify.app/terms')}
                        activeOpacity={0.7}
                    >
                        <View style={styles.linkContent}>
                            <MaterialIcons name="description" size={24} color="#fff" />
                            <Text style={styles.linkText}>Terms of Service</Text>
                        </View>
                        <Feather name="external-link" size={20} color="#666" />
                    </TouchableOpacity>
                </View>

                {/* Privacy Policy */}
                <View style={styles.linkContainer}>
                    <TouchableOpacity
                        style={styles.linkItem}
                        onPress={() => handleExternalLink('https://noocap.netlify.app/privacy')}
                        activeOpacity={0.7}
                    >
                        <View style={styles.linkContent}>
                            <MaterialIcons name="privacy-tip" size={24} color="#fff" />
                            <Text style={styles.linkText}>Privacy Policy</Text>
                        </View>
                        <Feather name="external-link" size={20} color="#666" />
                    </TouchableOpacity>
                </View>

                {/* Open Source Licenses */}
                <DropdownItem
                    icon={<MaterialIcons name="gavel" size={24} color="white" />}
                    title="Open Source Licenses"
                >
                    {`Open Source Libraries Acknowledgment:

1. React Native
• Version: 0.72.x
• License: MIT
• Copyright: Facebook, Inc.
• Core mobile application framework

2. Expo
• Version: 49.x
• License: MIT
• Provides essential development tools
• Simplified React Native development

3. React Navigation
• Version: 6.x
• License: MIT
• Routing and navigation implementation
• Smooth screen transitions

4. Vector Icons
• Comprehensive icon library
• License: MIT
• Customizable icon solutions

5. AsyncStorage
• Persistent, key-value storage system
• License: MIT
• Managed by React Native Community

Detailed Licensing:
• Full license texts available upon request
• Profound appreciation for open-source community
• Committed to maintaining open-source ethics`}
                </DropdownItem>
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
        flex: 1,
        marginHorizontal: 20,
        marginTop: 20,
    },
    contentContainer: {
        paddingBottom: 40,
    },
    dropdownContainer: {
        marginBottom: 16,
        backgroundColor: '#1C1C1E',
        borderRadius: 12,
        overflow: 'hidden',
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 20,
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
    versionText: {
        color: '#8E8E93',
        fontSize: 14,
        marginRight: 12,
    },
    dropdownContent: {
        backgroundColor: '#000',
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    dropdownScrollView: {
        paddingHorizontal: 16,
    },
    dropdownScrollViewContent: {
        paddingVertical: 12,
    },
    dropdownText: {
        color: '#E5E5EA',
        fontSize: 14,
        lineHeight: 22,
    },
    linkContainer: {
        marginBottom: 16,
        backgroundColor: '#1C1C1E',
        borderRadius: 12,
        overflow: 'hidden',
    },
    linkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 18,
        paddingHorizontal: 20,
    },
    linkContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    linkText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default About;