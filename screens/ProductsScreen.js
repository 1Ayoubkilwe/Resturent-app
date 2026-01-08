import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Search, Edit2, Trash2, Package } from 'lucide-react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import ip from '../config/ip';
import { useIsFocused } from '@react-navigation/native';

const ProductsScreen = ({ navigation }) => {
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const { userToken } = useContext(AuthContext);
    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            fetchProducts();
        }
    }, [isFocused]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://${ip}:5000/api/food`, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            setProducts(response.data);
        } catch (e) {
            console.log("Fetch products error:", e);
            Alert.alert('Error', 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const deleteProduct = (id) => {
        Alert.alert(
            'Delete Product',
            'Are you sure you want to delete this item?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await axios.delete(`http://${ip}:5000/api/food/${id}`, {
                                headers: { Authorization: `Bearer ${userToken}` }
                            });
                            setProducts(products.filter(p => p._id !== id));
                            Alert.alert('Success', 'Product deleted');
                        } catch (e) {
                            Alert.alert('Error', 'Failed to delete product');
                        }
                    }
                }
            ]
        );
    };

    if (loading && products.length === 0) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-slate-900">
                <ActivityIndicator size="large" color="#f97316" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
            <View className="px-6 py-4 flex-row justify-between items-center">
                <View>
                    <Text className="text-2xl font-bold text-slate-900 dark:text-white">Products</Text>
                    <Text className="text-slate-500 dark:text-slate-400">Manage your menu items</Text>
                </View>
                <TouchableOpacity
                    onPress={() => navigation.navigate('AddFood')}
                    className="bg-orange-500 p-3 rounded-full"
                >
                    <Plus size={24} color="white" />
                </TouchableOpacity>
            </View>

            <View className="px-6 mb-4">
                <View className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl flex-row items-center border border-slate-200 dark:border-slate-700">
                    <Search size={18} color="#94a3b8" />
                    <TextInput
                        className="flex-1 ml-2 text-slate-900 dark:text-white"
                        placeholder="Search products..."
                        placeholderTextColor="#94a3b8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{ padding: 16, paddingBottom: 150 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (

                    <View className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl mb-4 flex-row items-center">
                        <Image
                            source={{ uri: item.image ? `http://${ip}:5000/${item.image}` : 'https://via.placeholder.com/150' }}
                            className="w-20 h-20 rounded-xl"
                        />
                        <View className="flex-1 ml-4">
                            <Text className="text-lg font-bold text-slate-900 dark:text-white" numberOfLines={1}>{item.name}</Text>
                            <Text className="text-slate-500 dark:text-slate-400 text-sm" numberOfLines={1}>{item.category?.name || 'Uncategorized'}</Text>
                            <Text className="text-orange-500 font-bold mt-1">${item.price}</Text>
                        </View>
                        <View className="flex-row">
                            <TouchableOpacity
                                onPress={() => navigation.navigate('AddFood', { product: item })}
                                className="p-2 bg-orange-100 rounded-full mr-2"
                            >
                                <Edit2 size={18} color="#f97316" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => deleteProduct(item._id)}
                                className="p-2 bg-red-100 rounded-full"
                            >
                                <Trash2 size={18} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <View className="p-10 items-center justify-center">
                        <Package size={64} color="#94a3b8" />
                        <Text className="text-slate-500 dark:text-slate-400 text-center mt-4">
                            No products found. Start by adding your first food item.
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

export default ProductsScreen;
