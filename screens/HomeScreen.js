import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, ChevronRight, BarChart3, Clock, Banknote } from 'lucide-react-native';
import { useIsFocused } from '@react-navigation/native';
import axios from 'axios';
import ip from '../config/ip';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const HomeScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const { userInfo, userToken } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [analytics, setAnalytics] = useState({
        visitors: 0,
        reservations: 0,
        orders: 0,
        revenue: 0,
        visitorsSeries: [],
        revenueSeries: [],
        visitorsSample: false,
        revenueSample: false,
    });
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
            const visitorsSeries = res.data.visitorsSeries || [];
            const revenueSeries = res.data.revenueSeries || [];

            const visitorsSample = visitorsSeries.length === 0;
            const revenueSample = revenueSeries.length === 0;

            setAnalytics({
                visitors: res.data.visitors || 0,
                reservations: res.data.reservations || 0,
                orders: res.data.orders || 0,
                revenue: res.data.revenue || 0,
                visitorsSeries: visitorsSample ? buildSampleSeries(80, 12) : visitorsSeries,
                revenueSeries: revenueSample ? buildSampleSeries(1200, 180) : revenueSeries,
                visitorsSample,
                revenueSample,
            });
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

                {!analyticsLoading && (
                    <View className="mb-10">
                        <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Trends (last 7 days)</Text>
                        <TrendCard title="Visitors" data={analytics.visitorsSeries} color="#f97316" isSample={analytics.visitorsSample} />
                        <TrendCard title="Revenue" data={analytics.revenueSeries} color="#0ea5e9" isSample={analytics.revenueSample} formatter={(v) => `$${Number(v || 0).toFixed(2)}`} />
                    </View>
                )}
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

const TrendCard = ({ title, data, color, formatter, isSample }) => {
    const values = Array.isArray(data) ? data : [];
    const latest = values[values.length - 1]?.value ?? 0;
    return (
        <View className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl mb-3 border border-slate-100 dark:border-slate-800 shadow-sm">
            <View className="flex-row justify-between items-center mb-2">
                <Text className="text-slate-600 dark:text-slate-300 font-medium">{title}</Text>
                <Text className="text-lg font-bold text-slate-900 dark:text-white">{formatter ? formatter(latest) : latest}</Text>
            </View>
            {values.length > 0 ? (
                <>
                    <Sparkline data={values} color={color} />
                    {isSample ? <Text className="text-[11px] text-slate-400 mt-1">Sample data (no GA4 data yet)</Text> : null}
                </>
            ) : (
                <Text className="text-slate-400 text-xs">No data yet</Text>
            )}
        </View>
    );
};

const Sparkline = ({ data, color = '#f97316', width = 220, height = 90 }) => {
    const values = data.map((d) => Number(d.value || 0));
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = max - min || 1;
    const stepX = data.length > 1 ? width / (data.length - 1) : width;

    const points = data.map((d, i) => {
        const x = i * stepX;
        const y = height - ((Number(d.value || 0) - min) / range) * (height - 10);
        return { x, y };
    });

    const linePath = points.reduce((acc, p, idx) => acc + `${idx === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)} `, '');
    const areaPath = `${linePath} L${width},${height} L0,${height} Z`;
    const gradId = `grad-${color.replace('#', '')}`;

    return (
        <View className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3">
            <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
                <Defs>
                    <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor={color} stopOpacity="0.35" />
                        <Stop offset="1" stopColor={color} stopOpacity="0" />
                    </LinearGradient>
                </Defs>
                <Path d={areaPath} fill={`url(#${gradId})`} />
                <Path d={linePath} stroke={color} strokeWidth="2.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
            </Svg>
            <View className="flex-row justify-between mt-2">
                <Text className="text-[11px] text-slate-400">7d ago</Text>
                <Text className="text-[11px] text-slate-400">Today</Text>
            </View>
        </View>
    );
};

const buildSampleSeries = (base = 50, swing = 10) => {
    const today = new Date();
    const series = [];
    for (let i = 6; i >= 0; i -= 1) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const bump = Math.sin((i / 6) * Math.PI) * swing;
        const jitter = (Math.random() - 0.5) * swing * 0.4;
        const value = Math.max(0, Math.round(base + bump + jitter));
        series.push({ date: d.toISOString().slice(0, 10).replace(/-/g, ''), value });
    }
    return series;
};

// Implement order fetching - 2 days ago

// Improve home screen layout - 1 day ago

// Add animations to cards - 1 day ago
