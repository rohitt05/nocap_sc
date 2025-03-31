import { Audio } from 'expo-av';

export interface RecordingData {
    file: Blob;
    uri: string;
    duration: number;
}

export class VoiceInputUtils {
    static async requestAudioPermissions() {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
        });
    }

    static async startRecording(): Promise<Audio.Recording | null> {
        try {
            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            return recording;
        } catch (error) {
            console.error('Failed to start recording', error);
            return null;
        }
    }

    static async stopRecording(recording: Audio.Recording | null): Promise<RecordingData | null> {
        if (!recording) return null;

        try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            if (!uri) return null;

            const { sound: newSound } = await Audio.Sound.createAsync({ uri });
            const status = await newSound.getStatusAsync();

            return {
                file: await this.fetchAudioFile(uri),
                uri: uri,
                duration: status.durationMillis / 1000
            };
        } catch (error) {
            console.error('Failed to stop recording', error);
            return null;
        }
    }

    static async fetchAudioFile(uri: string): Promise<Blob> {
        const response = await fetch(uri);
        return await response.blob();
    }

    static async playSound(sound: Audio.Sound): Promise<boolean> {
        try {
            await sound.replayAsync();
            return true;
        } catch (error) {
            console.error('Failed to play sound', error);
            return false;
        }
    }

    static async pauseSound(sound: Audio.Sound): Promise<boolean> {
        try {
            await sound.pauseAsync();
            return true;
        } catch (error) {
            console.error('Failed to pause sound', error);
            return false;
        }
    }

    static formatDuration(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
}