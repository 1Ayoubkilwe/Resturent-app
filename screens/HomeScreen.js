import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, ChevronRight, BarChart3, Clock, Banknote } from 'lucide-react-native';
import { useIsFocused } from '@react-navigation/native';
import axios from 'axios';
import ip from '../config/ip';

const HomeScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const { userInfo, userToken } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [analytics, setAnalytics] = useState({ visitors: 0, reservations: 0, orders: 0, revenue: 0 });
    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            // Orders feature is paused; keep placeholder
            setOrders([]);
            setLoading(false);
            fetchAnalytics();
        }
    }, [isFocused]);

    const fetchAnalytics = async () => {
        try {
            setAnalyticsLoading(true);
            const res = await axios.get(`http://${ip}:5000/api/analytics/summary`);
            setAnalytics({ visitors: res.data.visitors || 0, reservations: res.data.reservations || 0, orders: res.data.orders || 0, revenue: res.data.revenue || 0 });
        } catch (err) {
            console.log('Analytics fetch error', err?.response?.data || err.message);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-950">
            <View className="px-6 flex-row justify-between items-center mb-6 mt-4">
                <View>
                    <Text className="text-gray-500 dark:text-gray-400 font-medium">{t('home')}</Text>
                    <Text className="text-2xl font-bold text-gray-800 dark:text-white">{userInfo?.name || t('restaurant')}</Text>
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
                    <RefreshControl refreshing={analyticsLoading} onRefresh={fetchAnalytics} />
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
                        <Text className="text-slate-400 mt-4">{t('no_active_orders')}</Text>
                        <Text className="text-slate-400 text-sm mt-1">Coming soon — this feature is being rebuilt.</Text>
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
                                    <Text className="text-orange-500 font-bold mr-1">{t('manage')}</Text>
                                    <ChevronRight size={16} color="#f97316" />
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    ))
                )}

                <View className="mt-4 mb-4">
                    <View className="flex-row items-center mb-3">
                        <BarChart3 size={20} color="#f97316" />
                        <Text className="text-xl font-bold text-gray-800 dark:text-white ml-2">Analytics</Text>
                    </View>

                    {analyticsLoading ? (
                        <View className="items-center justify-center py-8">
                            <ActivityIndicator size="small" color="#f97316" />
                        </View>
                    ) : (
                        <View className="flex-row flex-wrap justify-between">
                            <AnalyticsCard label="Visitors" value={analytics.visitors} icon={<BarChart3 size={18} color="#f97316" />} />
                            <AnalyticsCard label="Reservations" value={analytics.reservations} icon={<Clock size={18} color="#f97316" />} />
                            <AnalyticsCard label="Orders" value={analytics.orders} icon={<ShoppingBag size={18} color="#f97316" />} />
                            <AnalyticsCard label="Revenue" value={`$${Number(analytics.revenue || 0).toFixed(2)}`} icon={<Banknote size={18} color="#f97316" />} />
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};
const AnalyticsCard = ({ label, value, icon }) => (
    <View className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl w-[48%] mb-3 border border-slate-100 dark:border-slate-800 shadow-sm">
        <View className="flex-row items-center mb-2">
            {icon ? <View className="mr-2">{icon}</View> : null}
            <Text className="text-slate-500 dark:text-slate-400 text-xs">{label}</Text>
        </View>
        <Text className="text-2xl font-bold text-slate-800 dark:text-white">{value}</Text>
    </View>
);

export default HomeScreen;
