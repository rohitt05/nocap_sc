import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../../../lib/supabase'; // Ensure this path is correct
import Timer from '../../components/Post/Timer';
import PromptCard from '../../components/Post/PromptCard';
import TabsComponent from '../../components/Post/TabsComponent';
import InputComponent from '../../components/Post/InputComponent';
import { fetchPromptOfTheDay } from '../../../API/fetchpromptoftheday';
import { router, usePathname } from 'expo-router'; // Import from expo-router
import CustomAlertModal from '../../components/CustomAlertModal'; // Import the custom alert component

const Post = () => {
    // State for alert modal
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');

    // State for prompt data
    const [promptData, setPromptData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // State to track active tab
    const [activeTab, setActiveTab] = useState('TEXT');

    // State for different content types
    const [inputText, setInputText] = useState('');
    const [selectedGif, setSelectedGif] = useState(null);
    const [voiceRecording, setVoiceRecording] = useState(null);
    const [mediaFile, setMediaFile] = useState(null);

    // Current user state
    const [currentUser, setCurrentUser] = useState(null);

    // Get current pathname for screen focus detection
    const pathname = usePathname();

    // Function to reset component state
    const resetState = () => {
        setActiveTab('TEXT');
        setInputText('');
        setSelectedGif(null);
        setVoiceRecording(null);
        setMediaFile(null);
    };

    // Reset state when component unmounts and remounts
    useEffect(() => {
        return () => {
            // This cleanup function will run when the component unmounts
            resetState();
        };
    }, [pathname]);

    // Fetch user data
    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
        };
        fetchUserData();
    }, []);

    // Fetch prompt data on component mount
    useEffect(() => {
        async function loadPromptData() {
            try {
                const data = await fetchPromptOfTheDay();
                setPromptData({
                    id: data.prompt.id,
                    text: data.prompt.text,
                    date: new Date().toISOString(),
                    time: data.timeRemaining,
                    expiresAt: data.expiresAt
                });
            } catch (error) {
                console.error('Error loading prompt:', error);
                // Fallback data
                setPromptData({
                    id: 'fallback-id',
                    text: "What was your most memorable moment today?",
                    date: new Date().toISOString(),
                    time: "00:00:00",
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                });
            } finally {
                setLoading(false);
            }
        }

        loadPromptData();
    }, []);

    // Handle GIF selection
    const handleGifSelect = (gif) => {
        setSelectedGif(gif);
    };

    // Handle voice recording
    const handleVoiceRecording = (recording) => {
        setVoiceRecording(recording);
    };

    // Handle media file selection
    const handleMediaSelect = (file) => {
        setMediaFile(file);
    };

    // Determine if post button should be enabled
    const isPostButtonEnabled = () => {
        switch (activeTab) {
            case 'TEXT':
                return inputText.trim().length > 0;
            case 'GIF':
                return selectedGif !== null;
            case 'VOICE':
                return voiceRecording !== null;
            case 'MEDIA':
                return mediaFile !== null;
            default:
                return false;
        }
    };

    // Handle alert close and navigation
    const handleAlertClose = () => {
        setAlertVisible(false);
        // Navigate to index (home) after the alert is closed
        router.replace('/');
    };

    // Function to handle posting content
    const handlePost = async () => {
        if (!currentUser) {
            Alert.alert('Error', 'You must be logged in to post.');
            return;
        }

        if (!isPostButtonEnabled()) {
            Alert.alert('Error', 'Please add some content before posting.');
            return;
        }

        setSubmitting(true);

        try {
            let contentType;
            let fileUrl = null;
            let textContent = null;

            switch (activeTab) {
                case 'TEXT':
                    contentType = 'text';
                    textContent = inputText;
                    break;
                case 'GIF':
                    contentType = 'gif';
                    // Make sure to use the same URL format that you're using in GifInputComponent
                    fileUrl = selectedGif.images.original.url;
                    break;
                case 'VOICE':
                    contentType = 'audio';
                    fileUrl = await uploadAudio(voiceRecording);
                    break;
                case 'MEDIA':
                    // Determine if it's an image or video
                    contentType = mediaFile.type.startsWith('image') ? 'image' : 'video';
                    fileUrl = await uploadMedia(mediaFile);
                    break;
            }

            // Insert the response into the database
            const { data, error } = await supabase
                .from('responses')
                .insert({
                    user_id: currentUser.id,
                    prompt_id: promptData.id,
                    content_type: contentType,
                    file_url: fileUrl,
                    text_content: textContent
                });

            if (error) throw error;

            // Clear inputs after successful posting
            resetState();

            // Show custom alert instead of Alert.alert
            setAlertTitle('Success');
            setAlertMessage('Your response has been posted!');
            setAlertVisible(true);

        } catch (error) {
            console.error('Error posting response:', error);
            Alert.alert('Error', 'Failed to post your response. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Upload audio recording
    const uploadAudio = async (recording) => {
        if (!recording || !recording.uri) {
            throw new Error('Invalid audio recording');
        }

        try {
            const filename = `${new Date().getTime()}.m4a`;
            // FIXED: Path must match the RLS policy expectation
            const filePath = `user_${currentUser.id}/${filename}`;

            // For audio, we need to read the file as base64 and then upload
            const fileBase64 = await FileSystem.readAsStringAsync(recording.uri, {
                encoding: FileSystem.EncodingType.Base64
            });

            const { data, error } = await supabase.storage
                .from('response_bucket')
                .upload(filePath, decode(fileBase64), {
                    contentType: 'audio/m4a',
                });

            if (error) throw error;

            // Get the public URL
            const { data: urlData } = supabase.storage
                .from('response_bucket')
                .getPublicUrl(filePath);

            return urlData.publicUrl;
        } catch (error) {
            console.error('Audio upload error:', error);
            throw error;
        }
    };

    // Improved media upload function for images/videos
    const uploadMedia = async (file) => {
        if (!file || !file.uri) {
            throw new Error('Invalid media file');
        }

        try {
            // Extract file extension from URI or use jpg/mp4 default
            const uriParts = file.uri.split('.');
            const fileExt = uriParts[uriParts.length - 1] ||
                (file.type.startsWith('image') ? 'jpg' : 'mp4');

            // Create a unique filename
            const filename = `${new Date().getTime()}.${fileExt}`;

            // FIXED: Path must match the RLS policy expectation
            // Use 'user_' prefix as expected by the storage policy
            const filePath = `user_${currentUser.id}/${filename}`;

            // Read file as base64
            const fileBase64 = await FileSystem.readAsStringAsync(file.uri, {
                encoding: FileSystem.EncodingType.Base64
            });

            // Upload the decoded base64 data
            const { data, error } = await supabase.storage
                .from('response_bucket')
                .upload(filePath, decode(fileBase64), {
                    contentType: file.type ||
                        (fileExt === 'jpg' ? 'image/jpeg' : 'video/mp4'),
                });

            if (error) {
                console.error('Supabase storage error:', error);
                throw error;
            }

            // Get the public URL
            const { data: urlData } = supabase.storage
                .from('response_bucket')
                .getPublicUrl(filePath);

            return urlData.publicUrl;
        } catch (error) {
            console.error('Media upload error:', error);
            throw error;
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#6441A5" />
                <Text style={styles.loadingText}>Loading prompt...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Navbar */}
            <View style={styles.navbar}>
                <View style={styles.navSide} />
                <Text style={styles.logoText}>NoCap</Text>
                <View style={styles.navSide}>
                    <TouchableOpacity
                        style={[
                            styles.postButton,
                            (!isPostButtonEnabled() || submitting) && styles.disabledButton
                        ]}
                        onPress={handlePost}
                        disabled={!isPostButtonEnabled() || submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.postButtonText}>Post</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Post Content */}
            <View style={styles.content}>
                {/* Timer Component */}
                <Timer promptDate={promptData.date} promptTime={promptData.time} expiresAt={promptData.expiresAt} />

                {/* Prompt Card Component */}
                <PromptCard
                    promptText={promptData.text}
                    promptDate={promptData.date}
                    promptTime={promptData.time}
                />

                {/* Input Component */}
                <InputComponent
                    activeTab={activeTab}
                    inputText={inputText}
                    setInputText={setInputText}
                    onGifSelect={handleGifSelect}
                    onVoiceRecording={handleVoiceRecording}
                    onMediaSelect={handleMediaSelect}
                />

                {/* Tabs Component */}
                <TabsComponent
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
            </View>

            {/* Custom Alert Modal */}
            <CustomAlertModal
                visible={alertVisible}
                title={alertTitle}
                message={alertMessage}
                onClose={handleAlertClose}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        marginTop: 10,
    },
    navbar: {
        height: 50,
        backgroundColor: 'black',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 10,
        paddingHorizontal: 15,
    },
    navSide: {
        width: 60,
        alignItems: 'flex-end',
    },
    logoText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 0.5,
    },
    postButton: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 25,
        backgroundColor: '#6441A5',
        minWidth: 60,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#333',
        opacity: 0.7,
    },
    postButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 16,
    },
});

export default Post;