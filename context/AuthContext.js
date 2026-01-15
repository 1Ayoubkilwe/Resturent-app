import React, { createContext, useState, useEffect } from 'react';
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



    // CHANGE THIS TO YOUR COMPUTER'S IP ADDRESS
    // Example: http://192.168.1.5:5000/api/users
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

    const googleLogin = async (email, name, googleId) => {
        setIsLoading(true);
        try {
            const res = await axios.post(`${API_URL}/google`, {
                email,
                name,
                googleId
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
            console.log(`Google Login error ${e}`);
            return { success: false, error: e.response?.data?.message || "Google Login failed." };
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

    const updateProfile = async ({ name, phone, location, isRestaurantOpen, language, coordinates, photos }) => {
        setIsLoading(true);
        try {
            const formData = new FormData();

            const baseUrl = `http://${ip}:5000`;
            const existingImages = (photos || [])
                .filter((photo) => !photo.isLocal)
                .map((photo) => photo.path || photo.uri.replace(baseUrl, ''));

            if (name !== undefined) formData.append('name', name);
            if (phone !== undefined) formData.append('phone', phone);
            if (location !== undefined) formData.append('location', location);
            if (isRestaurantOpen !== undefined) formData.append('isRestaurantOpen', isRestaurantOpen);
            if (language !== undefined) formData.append('language', language);
            if (coordinates?.latitude && coordinates?.longitude) {
                formData.append('latitude', coordinates.latitude);
                formData.append('longitude', coordinates.longitude);
            }

            formData.append('existingImages', JSON.stringify(existingImages));

            const localPhotos = (photos || []).filter((photo) => photo.isLocal);

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
                localPhotos.forEach((photo, index) => {
                    formData.append('images', {
                        uri: Platform.OS === 'ios' ? photo.uri.replace('file://', '') : photo.uri,
                        name: photo.name || `photo-${index}.jpg`,
                        type: photo.type || 'image/jpeg',
                    });
                });
            }

            const response = await axios.put(
                `http://${ip}:5000/api/users/profile`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${userToken}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
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

    const isLoggedIn = async () => {
        try {
            setIsLoading(true);
            let userInfo = await AsyncStorage.getItem('userInfo');
            let userToken = await AsyncStorage.getItem('userToken');
            userInfo = JSON.parse(userInfo);

            if (userInfo) {
                setUserToken(userToken);
                setUserInfo(userInfo);
                if (userInfo.language) {
                    i18n.changeLanguage(userInfo.language);
                }
            }

            setIsLoading(false);
        } catch (e) {
            console.log(`isLogged in error ${e}`);
        }
    }

    useEffect(() => {
        isLoggedIn();
    }, []);

    return (
        <AuthContext.Provider value={{ login, googleLogin, logout, updateProfile, isLoading, userToken, userInfo }}>
            {children}
        </AuthContext.Provider>
    );
}
