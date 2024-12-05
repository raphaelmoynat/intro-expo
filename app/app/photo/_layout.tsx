import { Stack } from "expo-router";

export default function RootLayout() {
    return <Stack>
        <Stack.Screen name="home"/>
        <Stack.Screen name="details"/>
        <Stack.Screen
            name="modal"
            options={{
                presentation: 'modal',
                animation: 'fade',
                headerShown: false,            }}
        />
    </Stack>;
}