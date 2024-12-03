import React, { useState } from 'react';
import { Button, TextInput, View, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useRouter} from "expo-router";


const AddCarScreen = () => {
    const navigation = useRouter()
    const [name, setName] = useState('');
    const [brand, setBrand] = useState('');
    const [power, setPower] = useState('');

    const handleAddCar = async () => {
        try {
            const token = await AsyncStorage.getItem('jwtToken');
            console.log('Token:', token)
            if (!token) {
                Alert.alert('error token');
                return;
            }

            const response = await axios.post('http://192.168.8.105:8000/cars/create',
                { name, brand, power },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Alert.alert('Success', response.data.message);
            navigation.replace('/(tabs)/api-cars');

        } catch (error) {
            alert(error);
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Car Name"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="Brand"
                value={brand}
                onChangeText={setBrand}
            />
            <TextInput
                style={styles.input}
                placeholder="Power"
                value={power}
                keyboardType="numeric"
                onChangeText={setPower}
            />
            <Button title="Add Car" onPress={handleAddCar} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 16,
        padding: 8,
        borderRadius: 8,
    },
});

export default AddCarScreen;
