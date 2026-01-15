import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image, Platform } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import ip from '../config/ip';
import * as ImagePicker from 'expo-image-picker';

const AddFoodScreen = ({ navigation, route }) => {
    const product = route.params?.product;
    const [name, setName] = useState(product?.name || '');
    const [description, setDescription] = useState(product?.description || '');
    const [price, setPrice] = useState(product?.price?.toString() || '');
    const [category, setCategory] = useState(product?.category?._id || product?.category || '');
    const [categories, setCategories] = useState([]);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [image, setImage] = useState(product?.image ? { uri: `http://${ip}:5000/${product.image}` } : null);
    const [isLoading, setIsLoading] = useState(false);
    const { userToken } = useContext(AuthContext);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`http://${ip}:5000/api/food/categories`, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            setCategories(response.data);
        } catch (e) {
            console.log("Fetch categories error:", e);
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    const handleAddFood = async () => {
        if (!name || !price || !category) {
            Alert.alert('Error', 'Please fill in required fields');
            return;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('price', price);
            formData.append('category', category);

            if (image) {
                const uri = Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri;
                formData.append('image', {
                    uri: uri,
                    type: 'image/jpeg', // Defaulting to jpeg, but ideally should match source
                    name: 'upload.jpg',
                });
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                    'Content-Type': 'multipart/form-data',
                }
            };

            if (product) {
                await axios.put(`http://${ip}:5000/api/food/${product._id}`, formData, config);
                Alert.alert('Success', 'Food item updated successfully');
            } else {
                await axios.post(`http://${ip}:5000/api/food`, formData, config);
                Alert.alert('Success', 'Food item added successfully');
            }
            navigation.goBack();
        } catch (e) {
            console.log(e);
            Alert.alert('Error', 'Failed to add food item');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-white dark:bg-slate-900 p-6">
            <Text className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">{product ? 'Edit Food Item' : 'Add New Food Item'}</Text>

            <Text className="text-gray-600 dark:text-gray-400 mb-2 font-medium">Food Name</Text>
            <TextInput
                className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 mb-4 text-gray-800 dark:text-white"
                placeholder="e.g. Cheese Burger"
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={setName}
            />

            <Text className="text-gray-600 dark:text-gray-400 mb-2 font-medium">Description</Text>
            <TextInput
                className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 mb-4 text-gray-800 dark:text-white h-24"
                placeholder="Brief description..."
                placeholderTextColor="#94a3b8"
                multiline
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
            />

            <View className="flex-row justify-between">
                <View className="w-[48%]">
                    <Text className="text-gray-600 dark:text-gray-400 mb-2 font-medium">Price ($)</Text>
                    <TextInput
                        className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 mb-4 text-gray-800 dark:text-white"
                        placeholder="9.99"
                        placeholderTextColor="#94a3b8"
                        keyboardType="numeric"
                        value={price}
                        onChangeText={setPrice}
                    />
                </View>
                <View className="w-[48%] mb-4">
                    <Text className="text-gray-600 dark:text-gray-400 mb-2 font-medium">Category</Text>
                    <TouchableOpacity
                        onPress={() => setShowCategoryPicker(prev => !prev)}
                        className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 flex-row justify-between items-center"
                    >
                        <Text className="text-gray-800 dark:text-white">
                            {category ? (categories.find(c => c._id === category)?.name || 'Select category') : 'Select category'}
                        </Text>
                        <Text className="text-orange-500 font-bold">{showCategoryPicker ? '▲' : '▼'}</Text>
                    </TouchableOpacity>
                    {showCategoryPicker && (
                        <View className="mt-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl max-h-48">
                            <ScrollView>
                                {categories.map((cat, idx) => (
                                    <TouchableOpacity
                                        key={cat._id}
                                        onPress={() => { setCategory(cat._id); setShowCategoryPicker(false); }}
                                        className={`p-3 ${idx < categories.length - 1 ? 'border-b border-gray-200 dark:border-slate-800' : ''}`}
                                    >
                                        <Text className="text-gray-800 dark:text-white">{cat.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>
            </View>

            <Text className="text-gray-600 dark:text-gray-400 mb-2 font-medium">Food Image</Text>
            <TouchableOpacity
                onPress={pickImage}
                className="bg-orange-500 px-4 py-3 rounded-xl items-center justify-center mb-3"
            >
                <Text className="text-white font-semibold">Add Photo</Text>
            </TouchableOpacity>
            {image && (
                <View className="mb-8">
                    <Image source={{ uri: image.uri }} className="w-full h-48 rounded-xl" resizeMode="cover" />
                </View>
            )}

            <TouchableOpacity
                className="bg-orange-500 p-4 rounded-2xl items-center shadow-lg mb-10"
                onPress={handleAddFood}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white font-bold text-lg">{product ? 'Update Item' : 'Add Item to Menu'}</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
};

export default AddFoodScreen;
