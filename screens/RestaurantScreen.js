import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { AuthContext } from '../context/AuthContext';
import ip from '../config/ip';

const RestaurantScreen = () => {
  const { t } = useTranslation();
  const { userInfo, updateProfile, isLoading } = useContext(AuthContext);
  const baseUrl = `http://${ip}:5000`;

  const [photos, setPhotos] = useState([]);
  const [coordinates, setCoordinates] = useState(userInfo?.coordinates || null);
  const [mapVisible, setMapVisible] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);
  const [locLoading, setLocLoading] = useState(false);

  useEffect(() => {
    const initialPhotos = (userInfo?.restaurantImages || []).map((path) => {
      const normalizedPath = path.startsWith('/') ? path : `/${path}`;
      return {
        uri: path.startsWith('http') ? path : `${baseUrl}${normalizedPath}`,
        path: normalizedPath,
        isLocal: false,
      };
    });
    setPhotos(initialPhotos);
    setCoordinates(userInfo?.coordinates || null);
  }, [userInfo, baseUrl]);

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
    }
    setMapVisible(false);
  };

  const handleSave = async () => {
    const result = await updateProfile({
      isRestaurantOpen: userInfo?.isRestaurantOpen,
      language: userInfo?.language,
      location: userInfo?.location,
      photos,
      coordinates,
    });
    if (result.success) {
      Alert.alert(t('success'), t('profile_updated'));
    } else {
      Alert.alert(t('error'), result.error || t('failed_update'));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
      <ScrollView className="flex-1 px-6 pt-4" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="mb-6">
          <Text className="text-gray-600 dark:text-gray-400 mb-2 ml-1">{t('restaurant_photos')}</Text>
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={handleAddPhotos}
              className="bg-orange-500 px-4 py-3 rounded-xl items-center justify-center mr-3"
            >
              <Text className="text-white font-semibold">{t('add_photos')}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mt-3">
            {photos.length === 0 ? (
              <View className="h-12 px-4 border border-slate-300 dark:border-slate-700 rounded-xl items-center justify-center">
                <Text className="text-slate-400 text-center">{t('no_photos_yet')}</Text>
              </View>
            ) : (
              photos.map((photo, index) => (
                <View key={`${photo.uri}-${index}`} className="mr-3">
                  <Image source={{ uri: photo.uri }} className="h-28 w-28 rounded-xl" />
                  <TouchableOpacity
                    onPress={() => removePhoto(index)}
                    className="mt-2 bg-red-50 dark:bg-red-900/30 px-3 py-1 rounded-lg border border-red-100 dark:border-red-800"
                  >
                    <Text className="text-red-500 dark:text-red-300 text-xs font-semibold">{t('remove')}</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>
        </View>

        <View>
          <Text className="text-gray-600 dark:text-gray-400 mb-2 ml-1">{t('restaurant_location')}</Text>
          <View className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <Text className="text-slate-600 dark:text-slate-300 text-sm">
              {coordinates?.lat && coordinates?.lng
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
            onPress={handleSave}
            disabled={isLoading}
            className="w-full bg-orange-500 p-4 rounded-xl items-center"
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold">{t('save')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Map Modal */}
      {mapVisible && (
        <View className="absolute inset-0 bg-white dark:bg-slate-900">
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
        </View>
      )}
    </SafeAreaView>
  );
};

export default RestaurantScreen;
