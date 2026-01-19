
import React, { createContext, useState, useEffect } from 'react';

// AsyncStorage - Waxaan ku keydinaa xogta user-ka telefoonka gudihiisa (like cookies in web)
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import ip from '../config/ip';
import i18n from '../i18n';
import { Platform } from 'react-native';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [userToken, setUserToken] = useState(null);
    const [userInfo, setUserInfo] = useState(null);


    const API_URL = `http://${ip}:5000/api/users`;

    const login = async (email, password) => {
        setIsLoading(true);
        try {
            const res = await axios.post(`${API_URL}/login`, {
                email,
                password
            });
            console.log(res.data);
            let userInfo = res.data;
            setUserInfo(userInfo);
            setUserToken(userInfo.token);
            AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
            AsyncStorage.setItem('userToken', userInfo.token);
            if (userInfo.language) {
                i18n.changeLanguage(userInfo.language);
            }
            return { success: true };
        } catch (e) {
            console.log(`Login error ${e}`);
            return { success: false, error: e.response?.data?.message || "Login failed. Please check your credentials." };
        } finally {
            setIsLoading(false);
        }
    }


    const logout = () => {
        setIsLoading(true);
        setUserToken(null);
        setUserInfo(null);
        AsyncStorage.removeItem('userInfo');
        AsyncStorage.removeItem('userToken');
        setIsLoading(false);
    }

    // updateProfile - Waxaan ku bedelnaa xogta user-ka (name, phone, location, photos, iwm)
    const updateProfile = async ({ name, phone, location, isRestaurantOpen, language, coordinates, photos }) => {
        setIsLoading(true);
        try {
            // FormData - Waxaan u isticmaalnaa si aan u soo dirno sawirro iyo text labadaba
            const formData = new FormData();

            const baseUrl = `http://${ip}:5000`;

            // Sawirrada hore ee jira (existing images) soo qaad
            const existingImages = (photos || [])
                .filter((photo) => !photo.isLocal) // Sawirrada server-ka ku jira kaliya
                .map((photo) => photo.path || photo.uri.replace(baseUrl, ''));

            // Xogta cusub ku dar FormData-ga
            if (name !== undefined) formData.append('name', name);
            if (phone !== undefined) formData.append('phone', phone);
            if (location !== undefined) formData.append('location', location);
            if (isRestaurantOpen !== undefined) formData.append('isRestaurantOpen', isRestaurantOpen);
            if (language !== undefined) formData.append('language', language);

            // GPS coordinates (latitude iyo longitude) ku dar
            if (coordinates?.latitude && coordinates?.longitude) {
                formData.append('latitude', coordinates.latitude);
                formData.append('longitude', coordinates.longitude);
            }

            // Sawirrada hore ku dar
            formData.append('existingImages', JSON.stringify(existingImages));

            // Sawirrada cusub (local photos) soo qaad
            const localPhotos = (photos || []).filter((photo) => photo.isLocal);

            // Haddii platform-ku yahay web
            if (Platform.OS === 'web') {
                for (let index = 0; index < localPhotos.length; index++) {
                    const photo = localPhotos[index];
                    const response = await fetch(photo.uri);
                    const blob = await response.blob();
                    const fileName = photo.name || `photo-${index}.jpg`;
                    const fileType = photo.type || blob.type || 'image/jpeg';
                    const file = new File([blob], fileName, { type: fileType });
                    formData.append('images', file, fileName);
                }
            } else {
                // Haddii platform-ku yahay iOS ama Android
                localPhotos.forEach((photo, index) => {
                    formData.append('images', {
                        uri: Platform.OS === 'ios' ? photo.uri.replace('file://', '') : photo.uri,
                        name: photo.name || `photo-${index}.jpg`,
                        type: photo.type || 'image/jpeg',
                    });
                });
            }

            // Backend-ka xogta u dir (Send to backend)
            const response = await axios.put(
                `http://${ip}:5000/api/users/profile`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${userToken}`, // Token-ka ku dar
                        'Content-Type': 'multipart/form-data', // Sawirro iyo text
                    },
                }
            );

            // Xogta cusub keydso
            setUserInfo(response.data);
            AsyncStorage.setItem('userInfo', JSON.stringify(response.data));
            setIsLoading(false);
            return { success: true };

        } catch (e) {
            console.log(e);
            setIsLoading(false);
            const message = e.response?.data?.message || e.message || 'Something went wrong';
            return { success: false, error: message };
        }
    };

    // isLoggedIn - Waxaan hubineynaa in user-ku hore u login yahay (check AsyncStorage)
    const isLoggedIn = async () => {
        try {
            setIsLoading(true);

            // AsyncStorage-ka xogta ka soo qaad (Get data from phone storage)
            let userInfo = await AsyncStorage.getItem('userInfo');
            let userToken = await AsyncStorage.getItem('userToken');
            userInfo = JSON.parse(userInfo); // JSON string-ka u bedel JavaScript object

            // Haddii xogta jirto, user-ku wuu login yahay
            if (userInfo) {
                setUserToken(userToken);
                setUserInfo(userInfo);

                // Luqadda soo celi (Restore language preference)
                if (userInfo.language) {
                    i18n.changeLanguage(userInfo.language);
                }
            }

            setIsLoading(false);
        } catch (e) {
            console.log(`isLogged in error ${e}`);
        }
    }

    // useEffect - Waxaan isticmaalnaa si aan u hubino in user-ku login yahay markii app-ka bilowdo
    // Waxay dhacaysaa hal mar oo keliya (once) markii app-ka la furo
    useEffect(() => {
        isLoggedIn(); // Check haddii user-ku hore u login yahay
    }, []); // [] = Run once only

    // Context Provider - Waxaan ku wadaageynaa functions iyo state app-ka oo dhan
    // Screens kasta waxay heli karaan: login, logout, updateProfile, isLoading, userToken, userInfo
    return (
        <AuthContext.Provider value={{ login, logout, updateProfile, isLoading, userToken, userInfo }}>
            {children} {/* App-ka oo dhan (All screens) */}
        </AuthContext.Provider>
    );
}
