import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigation = useRouter();

    async function register(){
        if (password !== confirmPassword) {
            alert('passwords do not match');
            return;
        }
        try{
            await axios.post('http://192.168.8.105:8000/register',{ username, password })
                .then((response) => {
                    alert("Register successfully");
                    navigation.replace('/login');

                })
        }catch (error) {
            alert(error);
        }


    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Register</Text>
            <TextInput
                style={styles.input}
                placeholder="Nom d'utilisateur"
                placeholderTextColor="#888"
                onChangeText={setUsername}
                value={username}
            />
            <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor="#888"
                secureTextEntry={true}
                onChangeText={setPassword}
                value={password}
            />
            <TextInput
                style={styles.input}
                placeholder="Confirmer le mot de passe"
                placeholderTextColor="#888"
                secureTextEntry={true}
                onChangeText={setConfirmPassword}
                value={confirmPassword}
            />
            <TouchableOpacity style={styles.button} onPress={register}>
                <Text style={styles.buttonText}>S'inscrire</Text>
            </TouchableOpacity>
        </View>
    );


}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    input: {
        width: '90%',
        height: 50,
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        fontSize: 16,
    },
    button: {
        width: '70%',
        height: 50,
        backgroundColor: 'black',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});