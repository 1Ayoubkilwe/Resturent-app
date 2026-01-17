import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Switch, ActivityIndicator, Alert, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Package, Utensils, Clock } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import MapView, { Marker } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import ip from '../config/ip';

const ProfileScreen = ({ navigation }) => {
    const { t, i18n } = useTranslation();
    const { logout, userInfo, updateProfile, isLoading } = useContext(AuthContext);
    const { colorScheme, toggleColorScheme } = useColorScheme();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(userInfo?.name || '');
    const [phone, setPhone] = useState(userInfo?.phone || '');
    const [location, setLocation] = useState(userInfo?.location || '');
    const [isOpen, setIsOpen] = useState(userInfo?.isRestaurantOpen ?? true);
    const [photos, setPhotos] = useState([]);
    const [coordinates, setCoordinates] = useState(userInfo?.coordinates || null);
    const [mapVisible, setMapVisible] = useState(false);
    const [selectedCoords, setSelectedCoords] = useState(null);
    const [mapRegion, setMapRegion] = useState(null);
    const [locLoading, setLocLoading] = useState(false);
    const baseUrl = `http://${ip}:5000`;

    useEffect(() => {
        setName(userInfo?.name || '');
        setPhone(userInfo?.phone || '');
        setLocation(userInfo?.location || '');
        setIsOpen(userInfo?.isRestaurantOpen ?? true);
        setCoordinates(userInfo?.coordinates || null);

        const initialPhotos = (userInfo?.restaurantImages || []).map((path) => {
            const normalizedPath = path.startsWith('/') ? path : `/${path}`;
            return {
                uri: path.startsWith('http') ? path : `${baseUrl}${normalizedPath}`,
                path: normalizedPath,
                isLocal: false,
            };
        });
        setPhotos(initialPhotos);
    }, [userInfo, baseUrl]);

    const changeLanguage = async (lng) => {
        i18n.changeLanguage(lng);
        await updateProfile({ name, phone, location, isRestaurantOpen: isOpen, language: lng, coordinates, photos });
    };

    const toggleOpenStatus = async (value) => {
        setIsOpen(value);
        const result = await updateProfile({ name, phone, location, isRestaurantOpen: value, language: i18n.language, coordinates, photos });
        if (!result.success) {
            setIsOpen(!value);
            Alert.alert(t('error'), t('failed_update'));
        }
    };

    const handleUpdate = async () => {
        const result = await updateProfile({
            name,
            phone,
            location,
            isRestaurantOpen: isOpen,
            language: i18n.language,
            coordinates,
            photos,
        });
        if (result.success) {
            Alert.alert(t('success'), t('profile_updated'));
            setIsEditing(false);
        } else {
            Alert.alert(t('error'), result.error || t('failed_update'));
        }
    };

    const ensureGalleryPermission = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(t('permission_denied'), t('gallery_permission_needed'));
            return false;
        }
        return true;
    };

    const handleAddPhotos = async () => {
        const allowed = await ensureGalleryPermission();
        if (!allowed) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.7,
        });

        if (result.canceled) return;

        const selected = (result.assets || []).map((asset, index) => ({
            uri: asset.uri,
            isLocal: true,
            name: asset.fileName || `photo-${Date.now()}-${index}.jpg`,
            type: asset.mimeType || 'image/jpeg',
        }));

        setPhotos((prev) => [...prev, ...selected]);
    };

    const removePhoto = (index) => {
        setPhotos((prev) => prev.filter((_, i) => i !== index));
    };

    const ensureLocationPermission = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(t('permission_denied'), t('location_permission_needed'));
            return false;
        }
        return true;
    };

    const openMap = async () => {
        const allowed = await ensureLocationPermission();
        if (!allowed) return;
        setLocLoading(true);
        try {
            let initialRegion = mapRegion;

            if (!initialRegion) {
                if (coordinates?.lat && coordinates?.lng) {
                    initialRegion = {
                        latitude: coordinates.lat,
                        longitude: coordinates.lng,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    };
                } else {
                    const current = await Location.getCurrentPositionAsync({});
                    initialRegion = {
                        latitude: current.coords.latitude,
                        longitude: current.coords.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    };
                }
            }

            setSelectedCoords({ latitude: initialRegion.latitude, longitude: initialRegion.longitude });
            setMapRegion(initialRegion);
            setMapVisible(true);
        } catch (err) {
            Alert.alert(t('error'), t('location_fetch_failed'));
        } finally {
            setLocLoading(false);
        }
    };

    const handleConfirmLocation = async () => {
        if (selectedCoords) {
            setCoordinates({ lat: selectedCoords.latitude, lng: selectedCoords.longitude });
            try {
                const address = await Location.reverseGeocodeAsync({
                    latitude: selectedCoords.latitude,
                    longitude: selectedCoords.longitude,
                });
                if (address && address.length > 0) {
                    const { street, city, region, country } = address[0];
                    const parts = [street, city, region, country].filter(Boolean);
                    if (parts.length > 0) {
                        setLocation(parts.join(', '));
                    }
                }
            } catch (err) {
                // best-effort: keep coordinates even if reverse geocode fails
            }
        }
        setMapVisible(false);
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
                            <Text className="text-gray-600 dark:text-gray-400 mb-2 ml-1">{t('restaurant_name')}</Text>
                            <TextInput
                                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-gray-800 dark:text-white"
                                value={name}
                                onChangeText={setName}
                                placeholder={t('restaurant_name_placeholder')}
                                placeholderTextColor="#94a3b8"
                            />
                        </View>
                        <View className="mt-4">
                            <Text className="text-gray-600 dark:text-gray-400 mb-2 ml-1">{t('phone_number')}</Text>
                            <TextInput
                                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-gray-800 dark:text-white"
                                value={phone}
                                onChangeText={setPhone}
                                placeholder={t('phone_placeholder')}
                                keyboardType="phone-pad"
                                placeholderTextColor="#94a3b8"
                            />
                        </View>
                        <View className="mt-6">
                            <Text className="text-gray-600 dark:text-gray-400 mb-2 ml-1">{t('restaurant_photos')}</Text>
                            <TouchableOpacity
                                onPress={handleAddPhotos}
                                className="bg-orange-500 px-4 py-3 rounded-xl items-center"
                            >
                                <Text className="text-white font-semibold">{t('add_photos')}</Text>
                            </TouchableOpacity>
                            <View className="mt-3 flex-row flex-wrap gap-3">
                                {photos.length === 0 ? (
                                    <Text className="text-slate-400 text-sm">{t('no_photos_yet')}</Text>
                                ) : (
                                    photos.map((photo, index) => (
                                        <View key={`${photo.uri}-${index}`} className="mr-1">
                                            <Image source={{ uri: photo.uri }} className="h-32 w-32 rounded-xl" />
                                            <TouchableOpacity
                                                onPress={() => removePhoto(index)}
                                                className="mt-2 bg-red-50 dark:bg-red-900/30 px-3 py-1 rounded-lg border border-red-100 dark:border-red-800"
                                            >
                                                <Text className="text-red-500 dark:text-red-300 text-xs font-semibold">{t('remove')}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))
                                )}
                            </View>
                        </View>

                        <View className="mt-6">
                            <Text className="text-gray-600 dark:text-gray-400 mb-2 ml-1">{t('restaurant_location')}</Text>
                            <View className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                                <Text className="text-slate-600 dark:text-slate-300 text-sm">
                                    {location?.length
                                        ? location
                                        : coordinates?.lat && coordinates?.lng
                                            ? `${t('current_coordinates')}: ${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`
                                            : t('no_location_set')}
                                </Text>
                                <TouchableOpacity
                                    onPress={openMap}
                                    disabled={locLoading}
                                    className="mt-3 bg-slate-900 dark:bg-white/10 px-4 py-3 rounded-xl items-center"
                                >
                                    <Text className="text-white dark:text-slate-900 font-semibold">
                                        {locLoading ? t('loading') : t('choose_on_map')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View className="flex-row justify-between mt-8">
                            <TouchableOpacity
                                onPress={() => setIsEditing(false)}
                                className="w-[48%] bg-slate-100 dark:bg-slate-800 p-4 rounded-xl items-center"
                            >
                                <Text className="text-gray-600 dark:text-gray-400 font-semibold">{t('cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleUpdate}
                                disabled={isLoading}
                                className="w-[48%] bg-orange-500 p-4 rounded-xl items-center"
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white font-semibold">{t('save')}</Text>
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

            <Modal visible={mapVisible} animationType="slide" onRequestClose={() => setMapVisible(false)}>
                <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
                    <View className="flex-1">
                        {mapRegion ? (
                            <MapView
                                style={{ flex: 1 }}
                                region={mapRegion}
                                onRegionChangeComplete={setMapRegion}
                                onPress={(e) => setSelectedCoords(e.nativeEvent.coordinate)}
                            >
                                {selectedCoords && (
                                    <Marker
                                        coordinate={selectedCoords}
                                        draggable
                                        onDragEnd={(e) => setSelectedCoords(e.nativeEvent.coordinate)}
                                    />
                                )}
                            </MapView>
                        ) : (
                            <View className="flex-1 items-center justify-center">
                                <ActivityIndicator size="large" color="#f97316" />
                            </View>
                        )}
                    </View>
                    <View className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <TouchableOpacity
                            onPress={handleConfirmLocation}
                            className="w-full bg-orange-500 p-4 rounded-xl items-center mb-3"
                        >
                            <Text className="text-white font-semibold">{t('confirm_location')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setMapVisible(false)}
                            className="w-full bg-slate-100 dark:bg-slate-800 p-4 rounded-xl items-center"
                        >
                            <Text className="text-slate-700 dark:text-slate-200 font-semibold">{t('cancel')}</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
};

export default ProfileScreen;

// Fetch user profile data - 2 days ago
