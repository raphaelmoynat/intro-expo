import { Text, View, StyleSheet } from "react-native";
import { useState, useRef } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { captureRef } from 'react-native-view-shot';

import EmojiPicker from './components/EmojiPicker';
import EmojiList from './components/EmojiList';
import EmojiSticker from './components/EmojiSticker';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as MediaLibrary from 'expo-media-library';

import ImageViewer from "./components/ImageViewer";
import Button from './components/Button';
import IconButton from './components/IconButton';
import CircleButton from './components/CircleButton';

const PlaceholderImage = require('@/assets/images/watch.jpeg');

export default function Home() {
    const imageRef = useRef<View>(null);

    const [status, requestPermission] = MediaLibrary.usePermissions();
    if (status === null) {
        requestPermission();
    }

    const [cameraPermission, requestCameraPermission] = ImagePicker.useCameraPermissions();
    if (cameraPermission === null) {
        requestCameraPermission();
    }

    const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
    const [showAppOptions, setShowAppOptions] = useState<boolean>(false);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [pickedEmoji, setPickedEmoji] = useState<ImageSource | undefined>(undefined);

    const pickImageAsync = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setShowAppOptions(true);
            setSelectedImage(result.assets[0].uri);
        } else {
            alert('You did not select any image.');
        }
    };

    const takePhotoAsync = async () => {
        if (!cameraPermission?.granted) {
            const { granted } = await requestCameraPermission();
            if (!granted) {
                alert('Camera permission is required to take a photo.');
            }
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setShowAppOptions(true);
            setSelectedImage(result.assets[0].uri);
        } else {
            alert('You did not take any photo.');
        }
    };

    const onReset = () => {
        setShowAppOptions(false);
        setSelectedImage(undefined);
        setPickedEmoji(undefined);
    };

    const onAddSticker = () => {
        setIsModalVisible(true);
    };

    const onModalClose = () => {
        setIsModalVisible(false);
    };

    const onSaveImageAsync = async () => {
        try {
            const localUri = await captureRef(imageRef, {
                height: 440,
                quality: 1,
            });

            await MediaLibrary.saveToLibraryAsync(localUri);
            if (localUri) {
                alert('Saved!');
            }
        } catch (e) {
            console.log(e);
        }
    };
    return (
        <GestureHandlerRootView style={styles.container}>
            <View style={styles.imageContainer}>
                <View ref={imageRef} collapsable={false}>
                    <ImageViewer imgSource={PlaceholderImage} selectedImage={selectedImage} />
                    {pickedEmoji && <EmojiSticker imageSize={40} stickerSource={pickedEmoji} />}
                </View>
            </View>
            {showAppOptions ? (
                <View style={styles.optionsContainer}>
                    <View style={styles.optionsRow}>
                        <IconButton icon="refresh" label="Reset" onPress={onReset} />
                        <CircleButton onPress={onAddSticker} />
                        <IconButton icon="save-alt" label="Save" onPress={onSaveImageAsync} />
                    </View>
                </View>
            ) : (
                <View style={styles.footerContainer}>
                    <Button theme="primary" label="Choose a photo" onPress={pickImageAsync} />
                    <Button theme="primary" label="Take a photo" onPress={takePhotoAsync} /></View>
            )}
            <EmojiPicker isVisible={isModalVisible} onClose={onModalClose}>
                <EmojiList onSelect={setPickedEmoji} onCloseModal={onModalClose} />
            </EmojiPicker>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
    },
    imageContainer: {
        flex: 1,
    },
    footerContainer: {
        flex: 1 / 3,
        alignItems: 'center',
    },
    optionsContainer: {
        position: 'absolute',
        bottom: 80,
    },
    optionsRow: {
        alignItems: 'center',
        flexDirection: 'row',
    },
});




