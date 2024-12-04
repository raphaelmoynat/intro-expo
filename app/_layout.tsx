import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function RootLayout() {

    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem('jwtToken');
            if (!token) {
                router.replace('/login');
            }else{
                router.replace('/(tabs)/api-cars');
            }
        };

        checkAuth();
    }, []);


    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Drawer />
        </GestureHandlerRootView>
    );
}
