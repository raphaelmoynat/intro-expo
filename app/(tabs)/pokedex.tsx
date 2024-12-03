import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet } from 'react-native';

export default function Pokedex() {
    const [pokemonName, setPokemonName] = useState(null);
    const [pokemonData, setPokemonData] = useState(null);

    async function apiCall(pokemonName) {
        let url = `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`;
        await fetch(url)
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                setPokemonData(data)
            })

    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Pokédex</Text>


            <TextInput
                style={styles.input}
                placeholder="Entrez un nom de Pokémon"
                value={pokemonName}
                onChangeText={setPokemonName}
            />

            <Button title="Rechercher" onPress={() => apiCall(pokemonName)} />


            {pokemonData && (
                <View style={styles.pokemonContainer}>
                    <Image
                        source={{ uri: pokemonData.sprites.front_default }}
                        style={styles.image}
                    />
                    <Text>Nom : {pokemonData.name}</Text>
                    <Text>Type : {pokemonData.types[0].type.name}</Text>
                    <Text>Poids : {pokemonData.weight / 10} kg</Text>
                    <Text>Taille : {pokemonData.height / 10} m</Text>
                    <Text>Attaque : {pokemonData.moves[0].move.name}</Text>
                </View>
            )}
        </View>
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
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 8,
        marginBottom: 16,
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 16,
    },
    pokemonContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    image: {
        width: 150,
        height: 150,
        marginBottom: 16,
    },
});


