import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, Button } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useRouter} from "expo-router";



export default function CarsScreen() {
    const [carData, setCarsData] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigation = useRouter()

    useEffect(() => {
        checkAuth();
        getCars();
    }, []);

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

    async function getCars() {
        let url = `http://192.168.8.105:8000/cars`;
        try {
            await axios.get(url)
                .then((response) => {
                setCarsData(response.data);
            })

        } catch (error) {
            console.error(error);
        }
    }

    async function logout() {
        try {
            await AsyncStorage.removeItem('jwtToken');
            setIsAuthenticated(false);
            alert('Vous avez été déconnecté.');
            navigation.replace('/login');
        } catch (error) {
            alert(error);
        }
    }


    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Cars</Text>
            <View style={styles.authContainer}>
                <Text style={styles.authStatus}>
                    {isAuthenticated ? 'Statut : Connecté' : 'Statut : Déconnecté'}
                </Text>
                {isAuthenticated && (
                    <Button title="Se déconnecter" onPress={logout} color="#FF5733" />
                )}
            </View>


            <FlatList
                data={carData}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={styles.carContainer}>
                        <Text style={styles.carName}>Nom : {item.name}</Text>
                        <Text>Marque : {item.brand}</Text>
                        <Text>Puissance : {item.power} cv</Text>
                        {item.author && item.author.username ? (
                            <Text>Author : {item.author.username}</Text>
                        ) : (
                            <Text>Author : Non spécifié</Text>
                        )}
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>Aucune voiture trouvée.</Text>
                }
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    carContainer: {
        marginBottom: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
    },
});


