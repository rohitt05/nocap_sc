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
                    <Text style={styles.taglinePrimary}>Unfiltered, unedited, undeniable.</Text>
                    <Text style={styles.taglineSecondary}>For moments that don't need a filter</Text>
                </View>
                <TouchableOpacity
                    style={styles.getStartedButton}
                    onPress={onGetStarted}
                >
                    <Text style={styles.buttonText}>i swear, i'd never lie!</Text>
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
        fontWeight: 'bold',
        marginBottom: 5,
    },
    taglineSecondary: {
        color: 'white',
        fontSize: 16,
        fontStyle: 'italic',
    },
    getStartedButton: {
        backgroundColor: 'rgba(255,255,255,0.1)', // Slightly increased opacity
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 30,
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