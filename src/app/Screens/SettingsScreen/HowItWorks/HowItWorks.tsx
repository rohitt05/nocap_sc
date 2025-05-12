import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

const HowItWorks = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>How It Works?</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.step}>1. Close Friends Only (max 20)</Text>
                <Text style={styles.description}>
                    Connect and share only with your real besties—no room for random followers.
                </Text>

                <Text style={styles.step}>2. No Feeds or Algorithms</Text>
                <Text style={styles.description}>
                    See only your friends’ responses to daily prompts—no ads or influencers.
                </Text>

                <Text style={styles.step}>3. Daily Prompts</Text>
                <Text style={styles.description}>
                    Answer fun or deep questions to spark genuine conversations.
                </Text>

                <Text style={styles.step}>4. Memory Spaces</Text>
                <Text style={styles.description}>
                    Share photos, videos, and notes in private scrapbooks saved for your circle.
                </Text>

                <Text style={styles.step}>5.The Catch</Text>
                <Text style={styles.description}>
                    You have to answer your prompts to see your friends’ responses.
                </Text>
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        flex: 1,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginRight: 32, // to center title considering back button width
    },
    content: {
        padding: 20,
    },
    step: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 12,
        color: '#fff',
    },
    description: {
        fontSize: 16,
        marginTop: 4,
        color: '#888',
    },
});

export default HowItWorks;
