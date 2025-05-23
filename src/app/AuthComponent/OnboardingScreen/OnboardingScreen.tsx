import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import ImageCarousel from './ImageCarousel';
import { onboardingImages } from './constants/OnboardingImages';

export default function OnboardingScreen({ onGetStarted }) {
    return (
        <View style={styles.container}>
            <ImageCarousel
                images={onboardingImages}
                blurIntensity={50}
                interval={4000}
                fadeDuration={600}
            />
            <View style={styles.overlay}>
                <Image
                    source={require('../../../../assets/a1.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <View style={styles.textContainer}>
                    <Text style={styles.taglinePrimary}>The Internet's Chillest Corner. 🧊</Text>
                   
                </View>
                <TouchableOpacity
                    style={styles.getStartedButton}
                    onPress={onGetStarted}
                >
                    <Text style={styles.buttonText}>Hop In</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: 20,
    },
    logo: {
        width: 200,
        height: 200,
        position: 'absolute',
        left: 20,
        top: '70%',
        transform: [{ translateY: -100 }],
    },
    textContainer: {
        position: 'absolute',
        left: 20,
        top: '75%',
    },
    taglinePrimary: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'medium',
        marginBottom: 5,
    },
 
    getStartedButton: {
        borderWidth: 1,
        borderColor: 'white',
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 20,
        position: 'absolute',
        bottom: 50,
        right: 20,
       
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        letterSpacing: 0.5, // Added slight letter spacing
    }
});