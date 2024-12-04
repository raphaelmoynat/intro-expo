import { StyleSheet, Text, View } from 'react-native';
import { Link, router} from 'expo-router';

export default function Modal() {
    const isPresented = router.canGoBack();
    return (
        <View style={styles.container}>
            <Text>Modal screen</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
