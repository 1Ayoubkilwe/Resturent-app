import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Package, Utensils, Clock, ShoppingBag, ChevronRight } from 'lucide-react-native';
import axios from 'axios';
import ip from '../config/ip';
import { useIsFocused } from '@react-navigation/native';

const HomeScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const { userInfo, userToken } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            fetchOrders();
        }
    }, [isFocused]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://${ip}:5000/api/orders`, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            setOrders(response.data);
        } catch (e) {
            console.log("Fetch orders error:", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-950">
            <View className="px-6 flex-row justify-between items-center mb-6 mt-4">
                <View>
                    <Text className="text-gray-500 dark:text-gray-400 font-medium">{t('home')}</Text>
                    <Text className="text-2xl font-bold text-gray-800 dark:text-white">{userInfo?.name || "Restaurant"}</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')} className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full items-center justify-center">
                    <Text className="text-xl">🏪</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                className="px-6"
                contentContainerStyle={{ paddingBottom: 150 }}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={fetchOrders} />
                }
            >

                <Text className="text-xl font-bold text-gray-800 dark:text-white mb-4">{t('orders_overview')}</Text>

                {loading && orders.length === 0 ? (
                    <View className="items-center justify-center py-20">
                        <ActivityIndicator size="large" color="#f97316" />
                    </View>
                ) : orders.length === 0 ? (
                    <View className="items-center justify-center py-20">
                        <ShoppingBag size={64} color="#e2e8f0" />
                        <Text className="text-slate-400 mt-4">No active orders</Text>
                    </View>
                ) : (
                    orders.map((order) => (
                        <TouchableOpacity key={order._id} className="bg-slate-50 dark:bg-slate-900 p-4 rounded-3xl mb-4 border border-slate-100 dark:border-slate-800">
                            <View className="flex-row justify-between items-start mb-2">
                                <View className="bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full">
                                    <Text className="text-orange-600 dark:text-orange-400 font-bold text-xs">{order.status}</Text>
                                </View>
                                <Text className="text-slate-400 text-xs">
                                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                            <Text className="text-lg font-bold text-slate-800 dark:text-white mb-1">{order.customer?.name}</Text>
                            <Text className="text-slate-500 dark:text-slate-400 text-sm mb-3">
                                {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                            </Text>
                            <View className="flex-row justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
                                <Text className="text-slate-800 dark:text-white font-bold">${order.totalPrice?.toFixed(2)}</Text>
                                <TouchableOpacity className="flex-row items-center">
                                    <Text className="text-orange-500 font-bold mr-1">Manage</Text>
                                    <ChevronRight size={16} color="#f97316" />
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    ))
                )}

                <View className="mt-4 mb-4">
                    <Text className="text-xl font-bold text-gray-800 dark:text-white mb-4">Quick Actions</Text>
                    <View className="flex-row justify-between">
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Products')}
                            className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl w-[48%] items-center border border-slate-100 dark:border-slate-800"
                        >
                            <Package size={24} color="#f97316" />
                            <Text className="mt-2 text-slate-700 dark:text-white font-bold">{t('products')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Dine In')}
                            className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl w-[48%] items-center border border-slate-100 dark:border-slate-800"
                        >
                            <Utensils size={24} color="#f97316" />
                            <Text className="mt-2 text-slate-700 dark:text-white font-bold">{t('dine_in')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default HomeScreen;
