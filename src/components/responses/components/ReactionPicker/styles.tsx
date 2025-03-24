import { StyleSheet } from "react-native";

export
    const styles = StyleSheet.create({
        container: {
            position: 'absolute',
            bottom: 45, // Position above the reaction container in TextResponse
            left: 110,
            zIndex: 100,
        },
        pickerContainer: {
            flexDirection: 'row',
            padding: 8,
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        },
        reactionButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            marginHorizontal: 4,
        },
        emojiText: {
            fontSize: 20,
        }
    });