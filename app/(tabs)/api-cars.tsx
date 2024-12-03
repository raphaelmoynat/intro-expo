import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';

export default function CarsScreen() {
    const [carData, setCarsData] = useState([]);



    const params = {
        headers: { "Content-type": "application/json" },
        method: "GET",
    };

    async function getCars() {
        let url = `http://192.168.8.105:8000/cars`;
        try {
            await fetch(url, params)
                .then((response) => {
                return response.json();
            })
                .then((data) => {
                    setCarsData(data)
                })

        } catch (error) {
            console.error(error);
        }
    }

   getCars();

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Cars</Text>

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


