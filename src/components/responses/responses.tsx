import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, RefreshControl } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import ResponseItem from './components/ResponseItem';
import { ResponseItemData, ResponsesData } from './types';
import { fonts } from '../../utils/Fonts/fonts';
import { fetchResponses } from '../../../API/fetchResponses';

const Responses: React.FC = () => {
    const [responsesData, setResponsesData] = useState<ResponsesData>({ responses_received: [] });
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const loadResponses = async () => {
        try {
            const data = await fetchResponses();
            setResponsesData(data);
            setError(null);
        } catch (err) {
            console.error('Failed to load responses:', err);
            setError('Failed to load responses. Please try again later.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        // Load responses when component mounts
        loadResponses();
        // Removed auto-refresh interval
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadResponses();
    };

    const { responses_received } = responsesData;

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>Your Friends' Responses</Text>
            <ScrollView
                contentContainerStyle={styles.scrollViewContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#FFFFFF"
                        titleColor="#FFFFFF"
                        colors={["#FFFFFF"]}
                    />
                }
            >
                {responses_received.length > 0 ? (
                    responses_received.map((item: ResponseItemData) => (
                        <ResponseItem key={item.id} item={item} />
                    ))
                ) : (
                    <Text style={styles.emptyText}>
                        No responses yet. Be the first to respond to today's prompt!
                    </Text>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: {
        color: '#fff',
        fontSize: 18,
        fontFamily: fonts.semiBold,
        textAlign: 'center',
        marginVertical: 5,
    },
    scrollViewContent: {
        padding: 10,
        minHeight: '100%',
    },
    errorText: {
        color: '#ff5252',
        textAlign: 'center',
        fontFamily: fonts.medium,
        padding: 20,
    },
    emptyText: {
        color: '#aaa',
        textAlign: 'center',
        fontFamily: fonts.regular,
        padding: 40,
    }
});

export default Responses;