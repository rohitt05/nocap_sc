import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

const HowItWorks = () => {
    const navigation = useNavigation();

    const steps = [
        {
            number: "01",
            title: "Close Friends Only",
            subtitle: "(max 20)",
            description: "Connect and share only with your real besties—no room for random followers."
        },
        {
            number: "02",
            title: "No Feeds or Algorithms",
            subtitle: "",
            description: "See only your friends' responses to daily prompts—no ads or influencers."
        },
        {
            number: "03",
            title: "Daily Prompts",
            subtitle: "",
            description: "Answer fun or deep questions to spark genuine conversations."
        },
        {
            number: "04",
            title: "Memory Spaces",
            subtitle: "",
            description: "Share photos, videos, and notes in private scrapbooks saved for your circle."
        },
        {
            number: "05",
            title: "The Catch",
            subtitle: "",
            description: "You have to answer your prompts to see your friends' responses."
        }
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()} 
                    style={styles.backButton}
                    activeOpacity={0.7}
                >
                    <Feather name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>How It Works</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Main Content */}
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Introduction */}
                <View style={styles.introSection}>
                    <Text style={styles.introText}>
                        Discover how our platform creates meaningful connections with your closest friends
                    </Text>
                </View>

                {/* Steps */}
                <View style={styles.stepsContainer}>
                    {steps.map((step, index) => (
                        <View key={index} style={styles.stepCard}>
                            <View style={styles.stepHeader}>
                                <View style={styles.stepNumberContainer}>
                                    <Text style={styles.stepNumber}>{step.number}</Text>
                                </View>
                                <View style={styles.stepTitleContainer}>
                                    <View style={styles.titleRow}>
                                        <Text style={styles.stepTitle}>{step.title}</Text>
                                        {step.subtitle && (
                                            <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
                                        )}
                                    </View>
                                </View>
                            </View>
                            <Text style={styles.stepDescription}>{step.description}</Text>
                        </View>
                    ))}
                </View>

                {/* Bottom Spacing */}
                <View style={styles.bottomSpacing} />
            </ScrollView>
        </View>
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
        backgroundColor: '#000',
    },
    backButton: {
        width: 32,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        letterSpacing: 0.3,
    },
    placeholder: {
        width: 32, // Same as back button to center title
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    introSection: {
        paddingHorizontal: 16,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#0a0a0a',
    },
    introText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#888',
        // textAlign: 'center',
        fontWeight: '400',
    },
    stepsContainer: {
        paddingHorizontal: 16,
        paddingTop: 4,
    },
    stepCard: {
        backgroundColor: '#0a0a0a',
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#1a1a1a',
    },
    stepHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    stepNumberContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    stepNumber: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    stepTitleContainer: {
        flex: 1,
        paddingTop: 4,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    stepTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        lineHeight: 24,
    },
    stepSubtitle: {
        fontSize: 16,
        fontWeight: '400',
        color: '#666',
        marginLeft: 8,
        fontStyle: 'italic',
    },
    stepDescription: {
        fontSize: 15,
        lineHeight: 22,
        color: '#aaa',
        fontWeight: '400',
        paddingLeft: 64, // Align with title text
    },
    bottomSpacing: {
        height: 40,
    },
});

export default HowItWorks;