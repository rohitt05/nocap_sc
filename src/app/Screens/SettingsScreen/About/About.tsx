import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Animated, Dimensions } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
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
    const screenHeight = Dimensions.get('window').height;

    const toggleDropdown = () => {
        setIsExpanded(!isExpanded);
        // Reset scroll position when closing
        if (isExpanded && scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: 0, animated: false });
        }
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
                        showsVerticalScrollIndicator={true}
                    >
                        <Text style={styles.dropdownText}>{children}</Text>
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

const About = () => {
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
                {/* Empty view for centering the title */}
                <View style={styles.backButton} />
            </View>

            <ScrollView style={styles.content}>
                {/* App Info */}
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
                <DropdownItem
                    icon={<MaterialIcons name="description" size={24} color="white" />}
                    title="Terms of Service"
                >
                    {`Terms of Service Highlights:

1. Acceptance of Terms
• By using this app, you agree to these terms
• Terms may be updated periodically
• Continued use implies acceptance of changes

2. User Responsibilities
• Comply with local and international laws
• Protect your account credentials
• Use the app ethically and responsibly

3. Intellectual Property
• All app content is proprietary
• No unauthorized reproduction
• Trademarks and copyrights reserved

4. Limitation of Liability
• App provided "as is" without warranties
• No guarantee of uninterrupted service
• Limited liability for direct/indirect damages

5. Account Termination
• We reserve the right to terminate accounts
• Violation of terms may result in suspension
• Users can discontinue app usage anytime`}
                </DropdownItem>

                {/* Privacy Policy */}
                <DropdownItem
                    icon={<MaterialIcons name="privacy-tip" size={24} color="white" />}
                    title="Privacy Policy"
                >
                    {`Privacy Permissions and Data Usage

1. Camera Permission
• Purpose: Photo capture and document scanning
• Activated only during explicit camera use
• Can be revoked at any time in settings

2. Microphone Permission
• Enables voice commands and recording
• Strictly opt-in functionality
• Never accessed without direct user interaction

3. Location Services
• Optional precise or approximate location
• Used for personalized recommendations
• No permanent location data storage
• Full user control and transparency

4. Storage Access
• Limited to app-specific directories
• File saving and content download
• No unrestricted device storage access

5. Contacts Integration
• Completely voluntary feature
• No automatic contact uploads
• User-controlled sharing mechanisms

6. Notification Preferences
• Important updates and personalized alerts
• Fully customizable settings
• One-tap disable option

Data Protection Commitments:
• Zero data selling policy
• Minimal information collection
• End-to-end encryption
• Regular security audits
• 100% Transparent data handling`}
                </DropdownItem>

                {/* Licenses */}
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
    dropdownContainer: {
        marginBottom: 16,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#222',
        borderRadius: 10,
        padding: 16,
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
        color: '#666',
        fontSize: 14,
        marginRight: 10,
    },
    dropdownContent: {
        backgroundColor: '#000',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        maxHeight: 300, // Set a max height
    },
    dropdownScrollView: {
        paddingHorizontal: 16,
    },
    dropdownScrollViewContent: {
        paddingVertical: 12,
    },
    dropdownText: {
        color: 'white',
        fontSize: 14,
        lineHeight: 24,
    }
});

export default About;