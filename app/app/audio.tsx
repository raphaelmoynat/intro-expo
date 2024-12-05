import React from 'react';
import {StyleSheet, Text, View, Button, ScrollView, FlatList, TouchableOpacity} from 'react-native';
import { Audio } from 'expo-av';
import {index} from "@zxing/text-encoding/es2015/encoding/indexes";
import * as FileSystem from 'expo-file-system';


export default function AudioScreen() {
    const [recording, setRecording] = React.useState();
    const [recordings, setRecordings] = React.useState([]);
    const [textApi, setTextApi] = React.useState('');
    const [ollamaResponse, setOllamaResponse] = React.useState('');




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
                        outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_WAVE,
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

        await sendAudioToAPI(uri);

        const recordingsDir = `${FileSystem.documentDirectory}recordings/`;

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


    async function sendAudioToAPI(uri) {
        try {
            const formData = new FormData();

            // @ts-ignore
            formData.append('file', {
                uri: uri,
                name: 'recording.wav',
                type: 'audio/wav',
            });
            formData.append('model', 'base');
            formData.append('language', 'fr');
            formData.append('initial_prompt', 'string');

            const response = await fetch('http://10.9.65.3:8000/v1/transcriptions', {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer dummy_api_key',
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            const data = await response.json();
            console.log(data);

            if (data.text) {
                setTextApi(data.text)
                await sendTextToOllama(data.text);
            }
        } catch (error) {
            console.error('Erreur :', error);
        }
    }

    async function sendTextToOllama(responseText) {
        try {
            const body = {
                stream: false,
                prompt: responseText,
                model: 'llama3.2',
            };

            const response = await fetch('https://ollama.esdlyon.dev/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

           const data = await response.json();
           setOllamaResponse(data.response)
           console.log(data.response)

        } catch (error) {
            console.error('Erreur :', error);
        }
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
            {textApi ? (
                <View style={styles.textApiContainer}>
                    <Text>{textApi}</Text>
                </View>
            ) : null}
            {ollamaResponse ? (
                <View style={styles.textApiContainer}>
                    <Text>{ollamaResponse}</Text>
                </View>
            ) : null}

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
    textApiContainer: {
        marginTop: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
    },
    textApi: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 8,
    },
});