import React from 'react';
import {StyleSheet, Text, View, Button, ScrollView, FlatList, TouchableOpacity} from 'react-native';
import { Audio } from 'expo-av';
import {index} from "@zxing/text-encoding/es2015/encoding/indexes";

export default function App() {
    const [recording, setRecording] = React.useState();
    const [recordings, setRecordings] = React.useState([]);



    async function startRecording() {
        try {
            const perm = await Audio.requestPermissionsAsync();
            if (perm.status === "granted") {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true
                });
                // @ts-ignore
                const { recording } = await Audio.Recording.createAsync({
                    android: {
                        extension: ".wav",
                        outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT,
                        audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
                        sampleRate: 16000,
                        numberOfChannels: 1,
                        bitRate: 128000,
                    },
                    ios: {
                        extension: ".wav",
                        audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
                        sampleRate: 16000,
                        numberOfChannels: 1,
                        bitRate: 128000,
                        linearPCMBitDepth: 16,
                        linearPCMIsBigEndian: false,
                        linearPCMIsFloat: false,
                    },
                })
                // @ts-ignore
                setRecording(recording);
            }
        } catch (err) {}
    }

    async function stopRecording() {
        setRecording(undefined);

        // @ts-ignore
        await recording.stopAndUnloadAsync();
        // @ts-ignore
        const uri = recording.getURI();
        console.log("Audio file stored at:", uri);

        let allRecordings = [...recordings];
        // @ts-ignore
        const { sound, status } = await recording.createNewLoadedSoundAsync();
        // @ts-ignore
        allRecordings.push({
            sound: sound,
            duration: getDurationFormatted(status.durationMillis),
            file: uri,
        });

        setRecordings(allRecordings);
    }

    function getDurationFormatted(milliseconds: number) {
        const minutes = milliseconds / 1000 / 60;
        const seconds = Math.round((minutes - Math.floor(minutes)) * 60);
        return seconds < 10 ? `${Math.floor(minutes)}:0${seconds}` : `${Math.floor(minutes)}:${seconds}`
    }


    function clearRecordings() {
        setRecordings([])
    }

    return (
        <ScrollView style={styles.container}>

            <FlatList
                data={recordings}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <View style={styles.audioContainer}>
                        <Text style={styles.audioName}>Audio : {index + 1}</Text>
                        <Text>Durée : {item.duration}</Text>
                        <TouchableOpacity style={styles.playButton} onPress={() => item.sound.replayAsync()}>
                            <Text style={styles.buttonText}>Lire</Text>
                        </TouchableOpacity>
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>Aucun enregistrement trouvé</Text>
                }
            />

            <Button

                title={recording ? 'Stop Recording' : 'Start Recording'}
                onPress={recording ? stopRecording : startRecording}
            />
            <Button
                title={recordings.length > 0 ? 'Clear Recordings' : ''}
                onPress={clearRecordings}
            />
        </ScrollView>


    );
}

const styles = StyleSheet.create({
    audioName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',


    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
        marginRight: 40
    },
    fill: {
        flex: 1,
        margin: 15
    },
    audioContainer: {
        marginBottom: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
    },
    playButton: {
        marginTop: 5,
        padding: 5,
        backgroundColor: '#2196F3',
        borderRadius: 5,
        width: '40%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 16,
    },
});