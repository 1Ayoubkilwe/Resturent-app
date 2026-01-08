import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Switch, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Package, Utensils, Clock } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

const ProfileScreen = ({ navigation }) => {
    const { t, i18n } = useTranslation();
    const { logout, userInfo, updateProfile, isLoading } = useContext(AuthContext);
    const { colorScheme, toggleColorScheme } = useColorScheme();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(userInfo?.name || '');
    const [phone, setPhone] = useState(userInfo?.phone || '');
    const [location, setLocation] = useState(userInfo?.location || '');
    const [isOpen, setIsOpen] = useState(userInfo?.isRestaurantOpen ?? true);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        updateProfile(name, phone, location, isOpen, lng);
    };

    const toggleOpenStatus = async (value) => {
        setIsOpen(value);
        const result = await updateProfile(name, phone, location, value, i18n.language);
        if (!result.success) {
            setIsOpen(!value);
            Alert.alert(t('error'), t('failed_update'));
        }
    };

    const handleUpdate = async () => {
        const result = await updateProfile(name, phone, location, isOpen, i18n.language);
        if (result.success) {
            Alert.alert(t('success'), t('profile_updated'));
            setIsEditing(false);
        } else {
            Alert.alert(t('error'), result.error || t('failed_update'));
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
            <ScrollView
                className="flex-1 px-6 pt-4"
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="items-center mb-8">
                    <View className="w-24 h-24 bg-orange-100 dark:bg-orange-950 rounded-full items-center justify-center mb-4">
                        <Text className="text-4xl text-orange-500">🏪</Text>
                    </View>
                    <Text className="text-2xl font-bold text-gray-800 dark:text-white">{userInfo?.name}</Text>
                    <Text className="text-gray-500 dark:text-gray-400">{userInfo?.email}</Text>
                </View>

                {/* Management Shortcuts */}
                {!isEditing && (
                    <View className="mb-6 flex-row justify-between">
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Products')}
                            className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 items-center justify-center w-[48%]"
                        >
                            <Package size={24} color="#f97316" />
                            <Text className="mt-2 font-bold text-slate-800 dark:text-white">{t('products')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Dine In')}
                            className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 items-center justify-center w-[48%]"
                        >
                            <Utensils size={24} color="#f97316" />
                            <Text className="mt-2 font-bold text-slate-800 dark:text-white">{t('dine_in')}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Working Hours / Status */}
                {!isEditing && (
                    <View className="mb-6">
                        <Text className="text-gray-400 text-xs uppercase font-bold mb-4 ml-1">{t('working_hours')}</Text>
                        <View className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex-row justify-between items-center">
                            <View className="flex-row items-center">
                                <Clock size={20} color="#f97316" />
                                <Text className="text-gray-800 dark:text-white font-medium ml-3">{isOpen ? t('open') : t('closed')}</Text>
                            </View>
                            <Switch
                                value={isOpen}
                                onValueChange={toggleOpenStatus}
                                trackColor={{ false: '#ef4444', true: '#22c55e' }}
                                thumbColor={'#ffffff'}
                            />
                        </View>
                    </View>
                )}

                {/* Language Selection */}
                {!isEditing && (
                    <View className="mb-6">
                        <Text className="text-gray-400 text-xs uppercase font-bold mb-4 ml-1">{t('language')}</Text>
                        <View className="bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl border border-slate-100 dark:border-slate-700 flex-row">
                            <TouchableOpacity
                                onPress={() => changeLanguage('en')}
                                className={`flex-1 p-3 rounded-xl items-center ${i18n.language === 'en' ? 'bg-orange-500' : ''}`}
                            >
                                <Text className={`font-bold ${i18n.language === 'en' ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>EN</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => changeLanguage('so')}
                                className={`flex-1 p-3 rounded-xl items-center ${i18n.language === 'so' ? 'bg-orange-500' : ''}`}
                            >
                                <Text className={`font-bold ${i18n.language === 'so' ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>SO</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => changeLanguage('ar')}
                                className={`flex-1 p-3 rounded-xl items-center ${i18n.language === 'ar' ? 'bg-orange-500' : ''}`}
                            >
                                <Text className={`font-bold ${i18n.language === 'ar' ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>AR</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Dark Mode */}
                {!isEditing && (
                    <View className="mb-8">
                        <Text className="text-gray-400 text-xs uppercase font-bold mb-4 ml-1">UI {t('settings')}</Text>
                        <View className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex-row justify-between items-center">
                            <View className="flex-row items-center">
                                <Text className="text-xl mr-3">{colorScheme === 'dark' ? '🌙' : '☀️'}</Text>
                                <Text className="text-gray-800 dark:text-white font-medium">Dark Mode</Text>
                            </View>
                            <Switch
                                value={colorScheme === 'dark'}
                                onValueChange={toggleColorScheme}
                                trackColor={{ false: '#cbd5e1', true: '#f97316' }}
                                thumbColor={'#ffffff'}
                            />
                        </View>
                    </View>
                )}

                {isEditing ? (
                    <View className="mb-10">
                        <View>
                            <Text className="text-gray-600 dark:text-gray-400 mb-2 ml-1">Restaurant Name</Text>
                            <TextInput
                                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-gray-800 dark:text-white"
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter restaurant name"
                                placeholderTextColor="#94a3b8"
                            />
                        </View>
                        <View className="mt-4">
                            <Text className="text-gray-600 dark:text-gray-400 mb-2 ml-1">Phone Number</Text>
                            <TextInput
                                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-gray-800 dark:text-white"
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="e.g. +1 234 567 890"
                                keyboardType="phone-pad"
                                placeholderTextColor="#94a3b8"
                            />
                        </View>
                        <View className="mt-4">
                            <Text className="text-gray-600 dark:text-gray-400 mb-2 ml-1">Location</Text>
                            <TextInput
                                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-gray-800 dark:text-white"
                                value={location}
                                onChangeText={setLocation}
                                placeholder="e.g. 123 Main St, New York"
                                placeholderTextColor="#94a3b8"
                            />
                        </View>

                        <View className="flex-row justify-between mt-8">
                            <TouchableOpacity
                                onPress={() => setIsEditing(false)}
                                className="w-[48%] bg-slate-100 dark:bg-slate-800 p-4 rounded-xl items-center"
                            >
                                <Text className="text-gray-600 dark:text-gray-400 font-semibold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleUpdate}
                                disabled={isLoading}
                                className="w-[48%] bg-orange-500 p-4 rounded-xl items-center"
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white font-semibold">Save</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View className="mb-20">
                        <TouchableOpacity
                            onPress={() => setIsEditing(true)}
                            className="w-full bg-orange-50 dark:bg-orange-950/30 p-4 rounded-2xl border border-orange-100 dark:border-orange-900/50 items-center mt-4"
                        >
                            <Text className="text-orange-500 dark:text-orange-400 font-bold text-lg">Edit Profile</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={logout}
                            className="w-full bg-red-50 dark:bg-red-950/30 p-4 rounded-2xl border border-red-100 dark:border-red-900/50 items-center mt-4"
                        >
                            <Text className="text-red-500 dark:text-red-400 font-bold text-lg">Log Out</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default ProfileScreen;
