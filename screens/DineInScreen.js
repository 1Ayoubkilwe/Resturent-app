import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Switch, ScrollView, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, Image, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Utensils, Plus, Users, Trash2, Clock, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import ip from '../config/ip';

const DineInScreen = () => {
    const { t } = useTranslation();
    const { userToken } = useContext(AuthContext);
    const [isEnabled, setIsEnabled] = useState(false);
    const [tables, setTables] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [tableName, setTableName] = useState('');
    const [capacity, setCapacity] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState(null);

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

    useEffect(() => {
        if (userToken) {
            fetchSettings();
        }
    }, [userToken]);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://${ip}:5000/api/dine-in`, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            setIsEnabled(response.data.isEnabled);
            setTables(response.data.tables);
            setTimeSlots(response.data.availableTimeSlots || []);
        } catch (e) {
            console.log("Fetch settings error:", e);
        } finally {
            setLoading(false);
        }
    };

    const toggleSwitch = async () => {
        try {
            const response = await axios.put(`http://${ip}:5000/api/dine-in/toggle`, {}, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            setIsEnabled(response.data.isEnabled);
        } catch (e) {
            Alert.alert(t('error') || 'Error', t('toggle_failed') || 'Failed to toggle status');
        }
    };

    const addTable = async () => {
        if (!tableName || !capacity) {
            Alert.alert(t('error') || 'Error', t('fill_name_capacity') || 'Please fill name and capacity');
            return;
        }
        try {
            const formData = new FormData();
            formData.append('name', tableName);
            formData.append('capacity', parseInt(capacity));
            formData.append('price', parseFloat(price) || 0);

            if (image) {
                const uri = Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri;
                formData.append('image', {
                    uri: uri,
                    type: 'image/jpeg',
                    name: 'table.jpg',
                });
            }

            const response = await axios.post(`http://${ip}:5000/api/dine-in/table`, formData, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                    'Content-Type': 'multipart/form-data',
                }
            });
            setTables(response.data.tables);
            setModalVisible(false);
            setTableName('');
            setCapacity('');
            setPrice('');
            setImage(null);
        } catch (e) {
            Alert.alert(t('error') || 'Error', t('add_table_failed') || 'Failed to add table');
        }
    };

    const deleteTable = async (id) => {
        Alert.alert(
            t('delete_table_title') || 'Delete Table',
            t('delete_table_confirm') || 'Are you sure you want to delete this table?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: t('delete') || 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await axios.delete(`http://${ip}:5000/api/dine-in/table/${id}`, {
                                headers: { Authorization: `Bearer ${userToken}` }
                            });
                            setTables(response.data.tables);
                            Alert.alert(t('success') || 'Success', t('table_deleted') || 'Table deleted');
                        } catch (e) {
                            Alert.alert(t('error') || 'Error', t('delete_table_failed') || 'Failed to delete table');
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-slate-900">
                <ActivityIndicator size="large" color="#f97316" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
            <ScrollView
                className="flex-1 px-4 pt-4"
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="mb-6 flex-row justify-between items-center">
                    <View>
                        <Text className="text-2xl font-bold text-slate-900 dark:text-white">{t('dine_in')}</Text>
                        <Text className="text-slate-500 dark:text-slate-400">{t('dine_in_manage')}</Text>
                    </View>
                    <Switch
                        value={isEnabled}
                        onValueChange={toggleSwitch}
                        trackColor={{ false: '#cbd5e1', true: '#f97316' }}
                    />
                </View>

                {/* Time Slots Section */}
                <View className="mb-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xl font-bold text-slate-900 dark:text-white">{t('available_time_slots')}</Text>
                        <TouchableOpacity className="bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full">
                            <Text className="text-orange-600 dark:text-orange-400 font-bold text-xs">{t('edit')}</Text>
                        </TouchableOpacity>
                    </View>
                    <View className="flex-row flex-wrap">
                        {timeSlots.map((slot, index) => (
                            <View key={index} className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full mr-2 mb-2 flex-row items-center border border-slate-200 dark:border-slate-700">
                                <Clock size={12} color="#f97316" className="mr-1" />
                                <Text className="text-slate-700 dark:text-slate-300 font-medium">{slot}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-xl font-bold text-slate-900 dark:text-white">{t('tables')}</Text>
                    <TouchableOpacity
                        onPress={() => setModalVisible(true)}
                        className="bg-orange-500 p-2 rounded-full"
                    >
                        <Plus size={20} color="white" />
                    </TouchableOpacity>
                </View>

                {tables.length === 0 ? (
                    <View className="items-center justify-center py-20 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                        <Utensils size={48} color="#94a3b8" />
                        <Text className="text-slate-400 mt-4">{t('no_tables')}</Text>
                    </View>
                ) : (
                    tables.map((table) => (
                        <View key={table._id} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl mb-4 flex-row justify-between items-center border border-slate-100 dark:border-slate-700">
                            <View className="flex-row items-center flex-1">
                                {table.image ? (
                                    <Image
                                        source={{ uri: `http://${ip}:5000/${table.image}` }}
                                        className="w-16 h-16 rounded-xl mr-4"
                                    />
                                ) : (
                                    <View className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-xl mr-4">
                                        <Utensils size={20} color="#f97316" />
                                    </View>
                                )}
                                <View>
                                    <Text className="text-lg font-bold text-slate-900 dark:text-white">{table.tableNumber}</Text>
                                    <View className="flex-row items-center">
                                        <Users size={14} color="#94a3b8" />
                                        <Text className="text-slate-400 text-sm ml-1">{table.seats} {t('seats')}</Text>
                                        <Text className="text-slate-300 dark:text-slate-600 mx-2">|</Text>
                                        <Text className="text-orange-500 font-bold">${table.price}</Text>
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={() => deleteTable(table._id)}
                                className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full"
                            >
                                <Trash2 size={18} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white dark:bg-slate-900 p-6 rounded-t-3xl">
                        <Text className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{t('add_new_table')}</Text>

                        <Text className="text-slate-600 dark:text-slate-400 mb-2">{t('table_name')}</Text>
                        <TextInput
                            className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl mb-4 text-slate-900 dark:text-white"
                            placeholder="e.g. Table 1"
                            value={tableName}
                            onChangeText={setTableName}
                        />

                        <View className="flex-row justify-between">
                            <View className="w-[48%]">
                                <Text className="text-slate-600 dark:text-slate-400 mb-2">{t('capacity')}</Text>
                                <TextInput
                                    className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl mb-4 text-slate-900 dark:white"
                                    placeholder="Seats"
                                    keyboardType="numeric"
                                    value={capacity}
                                    onChangeText={setCapacity}
                                />
                            </View>
                            <View className="w-[48%]">
                                <Text className="text-slate-600 dark:text-slate-400 mb-2">{t('price')}</Text>
                                <TextInput
                                    className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl mb-4 text-slate-900 dark:white"
                                    placeholder="$0.00"
                                    keyboardType="numeric"
                                    value={price}
                                    onChangeText={setPrice}
                                />
                            </View>
                        </View>


                        <Text className="text-slate-600 dark:text-slate-400 mb-2">{t('table_image')}</Text>
                        <TouchableOpacity
                            onPress={pickImage}
                            className="bg-orange-500 px-4 py-3 rounded-xl items-center justify-center"
                        >
                            <Text className="text-white font-semibold">{t('add_photo')}</Text>
                        </TouchableOpacity>
                        {image && (
                            <View className="mt-3 mb-6">
                                <Image source={{ uri: image.uri }} className="w-full h-32 rounded-xl" resizeMode="cover" />
                            </View>
                        )}

                        <View className="flex-row justify-between mt-4">
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                className="bg-slate-200 dark:bg-slate-800 p-4 rounded-xl w-[48%]"
                            >
                                <Text className="text-center font-bold text-slate-600 dark:text-slate-400">{t('cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={addTable}
                                className="bg-orange-500 p-4 rounded-xl w-[48%]"
                            >
                                <Text className="text-center font-bold text-white">{t('add_table')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default DineInScreen;

