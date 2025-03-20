import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

const Help = () => {
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
                {/* Empty view for centering the title */}
                <View style={styles.backButton} />
            </View>

            {/* Help Options */}
            <View style={styles.content}>
                {/* Help Center */}
                <TouchableOpacity style={styles.optionItem}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="help-circle-outline" size={24} color="white" />
                    </View>
                    <Text style={styles.optionText}>Help Center</Text>
                    <MaterialIcons name="chevron-right" size={24} color="#666" />
                </TouchableOpacity>

                {/* Contact Us */}
                <TouchableOpacity style={styles.optionItem}>
                    <View style={styles.iconContainer}>
                        <MaterialIcons name="email" size={24} color="white" />
                    </View>
                    <Text style={styles.optionText}>Contact us</Text>
                    <MaterialIcons name="chevron-right" size={24} color="#666" />
                </TouchableOpacity>
            </View>
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