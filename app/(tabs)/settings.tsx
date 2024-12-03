import { Button, View } from 'react-native';

import { useRouter } from 'expo-router';


export default function Settings() {
    const router = useRouter();

    const handleDismiss = (count: number) => {
        router.dismiss(count)
    };

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Button title="Go to home" onPress={() => handleDismiss(3)} />
        </View>
    );
}
