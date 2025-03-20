import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

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
                <TouchableOpacity style={styles.optionItem}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="information-circle-outline" size={24} color="white" />
                    </View>
                    <Text style={styles.optionText}>App Version</Text>
                    <Text style={styles.versionText}>0.0.1 (000)</Text>
                </TouchableOpacity>

                {/* Terms of Service */}
                <TouchableOpacity style={styles.optionItem}>
                    <View style={styles.iconContainer}>
                        <MaterialIcons name="description" size={24} color="white" />
                    </View>
                    <Text style={styles.optionText}>Terms of Service</Text>
                    <MaterialIcons name="chevron-right" size={24} color="#666" />
                </TouchableOpacity>

                {/* Privacy Policy */}
                <TouchableOpacity style={styles.optionItem}>
                    <View style={styles.iconContainer}>
                        <MaterialIcons name="privacy-tip" size={24} color="white" />
                    </View>
                    <Text style={styles.optionText}>Privacy Policy</Text>
                    <MaterialIcons name="chevron-right" size={24} color="#666" />
                </TouchableOpacity>

                {/* Licenses */}
                <TouchableOpacity style={styles.optionItem}>
                    <View style={styles.iconContainer}>
                        <MaterialIcons name="gavel" size={24} color="white" />
                    </View>
                    <Text style={styles.optionText}>Open Source Licenses</Text>
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
        flex: 1,
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
    },
});

export default About;