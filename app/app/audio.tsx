import React, {useState} from 'react';
import {StyleSheet, Text, View, Button, ScrollView, FlatList, TouchableOpacity, Alert} from 'react-native';
import { Audio } from 'expo-av';
import {index} from "@zxing/text-encoding/es2015/encoding/indexes";
import * as FileSystem from 'expo-file-system';
import Icon from 'react-native-vector-icons/Ionicons'
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function AudioScreen() {
    const [recording, setRecording] = React.useState();
    const [recordings, setRecordings] = React.useState([]);
    const [textApi, setTextApi] = React.useState('');
    const [audiosMelo, setAudiosMelo] = React.useState([]);
    const [ollamaResponse, setOllamaResponse] = React.useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [conv, setConv] = React.useState('')

    async function checkAuth() {
        try {
            const token = await AsyncStorage.getItem('jwtToken');
            if (token) {
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        } catch (error) {
            alert(error);
        }
    }


    async function startRecording() {
        try {
            const perm = await Audio.requestPermissionsAsync();
            if (perm.status === "granted") {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true
                });
                // @ts-ignore
                const {recording} = await Audio.Recording.createAsync({
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
        } catch (err) {
        }
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
        const {sound, status} = await recording.createNewLoadedSoundAsync();
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

            const token = await AsyncStorage.getItem('jwtToken');
            console.log('Token:', token)
            if (!token) {
                Alert.alert('Merci de vous connecter avant d\'utiliser felix');
                return;
            }

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

            const response = await fetch('https://felix.esdlyon.dev/whisper/v1/transcriptions', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();
            console.log(data);

            if (data.text) {
                setTextApi(data.text)
                // @ts-ignore
                setConv(prev => [...prev, {type: 'question', text: data.text}]);
                await sendTextToOllama(data.text);
            }
        } catch (error) {
            console.error('Erreur :', error);
        }
    }

    async function sendTextToOllama(responseText) {
        try {
            const token = await AsyncStorage.getItem('jwtToken');
            console.log('Token:', token)
            if (!token) {
                Alert.alert('error token');
                return;
            }

            const body = {
                prompt: responseText,
            };

            const response = await fetch('https://felix.esdlyon.dev/ollama', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();
            setTextApi(data.message)
            console.log("message ollama: " + data.message)


            readTextCoqui(data.message)

        } catch (error) {
            console.error('Erreur :', error);
        }
    }

    async function readTextCoqui(textFromOllama) {
        try {
            const token = await AsyncStorage.getItem('jwtToken');
            console.log('Token:', token);

            if (!token) {
                Alert.alert('Erreur : Token manquant', 'Merci de vous connecter pour continuer.');
                return;
            }

            const uri = `https://felix.esdlyon.dev/coqui/api/tts?text=${encodeURIComponent(textFromOllama)}`;

            const response = await fetch(uri, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const blob = await response.blob();

            const audioFileUri = URL.createObjectURL(blob);

            const {sound} = await Audio.Sound.createAsync({uri: audioFileUri});


            // @ts-ignore
            setConv((prev) => [
                ...prev,
                {
                    type: 'response',
                    text: textFromOllama,
                    audio: {uri: audioFileUri, sound},
                },
            ]);


            console.log('Audio:', textFromOllama);
        } catch (error) {
            console.error('Erreur:', error);
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


    checkAuth();

    async function logout() {
        try {
            await AsyncStorage.removeItem('jwtToken');
            setIsAuthenticated(false);
            alert('Vous avez été déconnecté.');
        } catch (error) {
            alert(error);
        }
    }


        return (
            <View style={styles.container}>
                ListHeaderComponent={
                <>
                    <View style={styles.authContainer}>
                        <Text style={styles.authStatus}>
                            {isAuthenticated ? 'Statut : Connecté' : 'Statut : Déconnecté'}
                        </Text>
                        {isAuthenticated && (
                            <Button title="Se déconnecter" onPress={logout} color="#FF5733"/>
                        )}
                    </View>
                </>
            }
                {conv.length > 0 && (
                    <TouchableOpacity
                        style={styles.trashIcon}
                        onPress={() => setConv([])}
                    >
                        <Icon name="trash" size={30} color="#df4444"/>
                    </TouchableOpacity>
                )}
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <FlatList
                        data={conv}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({item}) => (
                            <View
                                style={[
                                    styles.messageContainer,
                                    item.type === 'question' ? styles.question : styles.response,
                                ]}
                            >
                                <Text style={styles.messageText}>{item.text}</Text>
                                {item.audio && (
                                    <TouchableOpacity
                                        style={styles.playIcon}
                                        onPress={() => item.audio.sound.replayAsync()}
                                    >
                                        <Icon name="play-circle" size={24} color="#2196F3"/> </TouchableOpacity>
                                )}
                            </View>
                        )}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>Comment puis-je vous aider ?</Text>
                        }
                    />
                </ScrollView>

                <View style={styles.btnContainer}>
                    <TouchableOpacity
                        style={recording ? styles.stopBtn : styles.startBtn}
                        onPress={recording ? stopRecording : startRecording}
                    >
                        <Text style={styles.buttonText}>{recording ? 'Stop' : 'Start'}</Text>
                    </TouchableOpacity>
                </View>

            </View>
        )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        paddingBottom: 100,
    },
    messageContainer: {
        margin: 10,
        padding: 10,
        borderRadius: 5,
        maxWidth: '90%'
    },
    question: {
        alignSelf: 'flex-start',
        backgroundColor: '#979db2'
    },
    response: {
        alignSelf: 'flex-end',
        backgroundColor: "#33b8ff",
    },
    messageText: {
        fontSize: 16,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 200,
        fontSize: 30,
    },
    stopBtn: {
        width: '90%',
        height: 50,
        backgroundColor: '#df4444',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
    },
    startBtn: {
        width: '90%',
        height: 50,
        backgroundColor: '#4469df',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    clearBtn: {
        width: '40%',
        height: 50,
        backgroundColor: 'green',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
    },
    btnContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        borderTopWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#fff',
    },
    trashIcon: {
        position: 'absolute',
        top: 10,
        right: 20,
        zIndex: 10,
        backgroundColor: '#fff',
        padding: 5,
        borderRadius: 5,
    },
    audioName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
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
    playIcon: {
        marginTop: 10,
        alignSelf: 'flex-end',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 5,
    },
    authContainer: {
        marginBottom: 16,
        alignItems: 'center',
    },
    authStatus: {
        fontSize: 16,
        marginBottom: 8,
        color: '#333',
    },
});