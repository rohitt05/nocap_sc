import { StyleSheet } from "react-native";
import { fonts } from '../../utils/Fonts/fonts';


export const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    loadingText: {
        color: '#fff',
        marginTop: 10,
    },
    errorText: {
        color: '#ff6b6b',
        marginBottom: 10,
        fontSize: 12,
    },
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#000',
    },
    outsideHeader: {
        marginBottom: 15,
        paddingHorizontal: 5,
        paddingTop: 10,
    },
    greetingText: {
        fontSize: 14,
        fontFamily: fonts.light,
        color: '#a8b1c2',
        marginBottom: 5,
    },
    promptTitle: {
        fontSize: 24,
        fontFamily: fonts.semiBoldItalic,
        color: '#fff',
    },
    promptCard: {
        backgroundColor: '#132fba',
        borderRadius: 20,
        minHeight: 200, // Reduced height as content was removed
        display: 'flex',
        flexDirection: 'column',
    },
    promptContainer: {
        flex: 1,
        paddingHorizontal: 15,
        justifyContent: 'center',
        paddingTop: 20, // Added top padding since the header was removed
    },
    promptTextBorder: {
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        borderRadius: 12,
        padding: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    promptText: {
        fontSize: 22,
        lineHeight: 30,
        fontFamily: fonts.semiBold,
        color: '#fff',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
    },
    tapToAnswerText: {
        fontSize: 12,
        fontFamily: fonts.medium,
        fontStyle: 'italic',
        color: '#fff',
    },
    promptTime: {
        fontSize: 14,
        fontFamily: fonts.medium,
        color: '#fff',
    },
    // Progress bar styles
    progressContainer: {
        bottom: 5,
        paddingHorizontal: 10,
    },
    progressBarBackground: {
        height: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    timeRemainingText: {
        color: '#fff',
        fontSize: 12,
        fontFamily: fonts.medium,
        marginTop: 5,
        textAlign: 'right',
    }
});
