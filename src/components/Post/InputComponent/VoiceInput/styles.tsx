import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    voiceContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    recordButtonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    recordButtonOuter: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(224, 46, 46, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    recordButton: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#e02e2e',
        justifyContent: 'center',
        alignItems: 'center',
    },
    recordingActive: {
        backgroundColor: '#ff0000',
    },
    recordButtonInner: {
        width: 40,
        height: 40,
        borderRadius: 5,
        backgroundColor: 'white',
    },
    timerContainer: {
        alignItems: 'center',
    },
    timerText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 8,
    },
    recordingInstructions: {
        color: '#999',
        fontSize: 14,
    },
    disabled: {
        opacity: 0.5,
    },
    playbackContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    playButton: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#2e7de0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    newRecordingButton: {
        marginTop: 10,
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#e02e2e',
        borderRadius: 20,
    },
    newRecordingText: {
        color: 'white',
        fontWeight: 'bold',
    }
});

