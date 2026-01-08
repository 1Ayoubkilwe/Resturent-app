import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, Platform } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import ip from '../config/ip';
import * as ImagePicker from 'expo-image-picker';

const AddCategoryScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [image, setImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { userToken } = useContext(AuthContext);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    const handleAddCategory = async () => {
        if (!name) {
            Alert.alert('Error', 'Please enter a category name');
            return;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            if (image) {
                const uri = Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri;
                formData.append('image', {
                    uri: uri,
                    type: 'image/jpeg',
                    name: 'category.jpg',
                });
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                    'Content-Type': 'multipart/form-data',
                }
            };

            await axios.post(`http://${ip}:5000/api/food/categories`, formData, config);
            Alert.alert('Success', 'Category added');
            navigation.goBack();
        } catch (e) {
            console.log(e);
            Alert.alert('Error', 'Failed to add category');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white dark:bg-slate-900 p-6">
            <Text className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">New Category</Text>

            <Text className="text-gray-600 dark:text-gray-400 mb-2">Category Name</Text>
            <TextInput
                className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 mb-6 text-gray-800 dark:text-white"
                placeholder="e.g. Drinks, Desserts"
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={setName}
            />

            <Text className="text-gray-600 dark:text-gray-400 mb-2 font-medium">Category Image</Text>
            <TouchableOpacity
                onPress={pickImage}
                className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 mb-8 items-center justify-center overflow-hidden"
                style={{ height: 150 }}
            >
                {image ? (
                    <Image source={{ uri: image.uri }} className="w-full h-full" resizeMode="cover" />
                ) : (
                    <View className="items-center">
                        <Text className="text-slate-400">Tap to select an image</Text>
                    </View>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                className="bg-orange-500 p-4 rounded-2xl items-center shadow-sm"
                onPress={handleAddCategory}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white font-bold text-lg">Create Category</Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

export default AddCategoryScreen;
