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
        fontSize: 13,
        fontFamily: fonts.medium,
        color: 'gray',
        marginBottom: 5,
    },
    promptTitle: {
        fontSize: 24,
        fontFamily: fonts.black,
        color: '#fff',
    },
    promptCard: {
        backgroundColor: '#132fba',
        borderRadius: 20,
        minHeight: 200,
        display: 'flex',
        flexDirection: 'column',
        shadowColor: '#3b56d9',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 10,
        position: 'relative',
        overflow: 'hidden',
    },
    promptContainer: {
        flex: 1,
        paddingHorizontal: 18,
        justifyContent: 'center',
        paddingTop: 24,
    },
    promptTextBorder: {
        borderRadius: 12,
        padding: 16,
    },
    promptText: {
        fontSize: 22,
        lineHeight: 30,
        fontFamily: fonts.semiBoldItalic,
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
        top: -5,
        bottom: 5,
        paddingHorizontal: 10,
    },
    progressBarBackground: {
        height: 5,
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
