import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import Constants from 'expo-constants';
import { AuthContext } from '../context/AuthContext';
import ip from '../config/ip';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const { login, googleLogin } = useContext(AuthContext);

    const GOOGLE_CONFIG = {
        // expoClientId should use the Web OAuth client ID and have https://auth.expo.io/@<username>/<slug> whitelisted in Google console.
        expoClientId: '195557748903-hphfkfj8a4q4bgradb286s0cuj5p6rm5.apps.googleusercontent.com',
        webClientId: '195557748903-hphfkfj8a4q4bgradb286s0cuj5p6rm5.apps.googleusercontent.com',
        // TODO: replace these with your platform-specific OAuth client IDs from Google Cloud once generated.
        androidClientId:'195557748903-f7tld2rh7epjba4k3u5c4spmeiut5rhk.apps.googleusercontent.com',
        iosClientId: 'YOUR_IOS_CLIENT_ID_HERE',
    };

    const isExpoGo = Constants.appOwnership === 'expo';

    // Use Expo proxy in Expo Go; fall back to app scheme in a build/dev client.
    const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'restaurant-app',
        path: 'redirect',
        useProxy: isExpoGo,
    });

    const [request, response, promptAsync] = Google.useAuthRequest({
        expoClientId: GOOGLE_CONFIG.expoClientId,
        androidClientId: GOOGLE_CONFIG.androidClientId,
        iosClientId: GOOGLE_CONFIG.iosClientId,
        webClientId: GOOGLE_CONFIG.webClientId,
        redirectUri: redirectUri,
        scopes: ['profile', 'email'],
    });

    useEffect(() => {
        if (request) {
            console.log("Google Auth Request URL:", request.url);
            console.log("Redirect URI being used:", redirectUri);
            console.log("Full request config:", JSON.stringify(request, null, 2));
        }
    }, [request]);

    useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            fetchUserInfo(authentication.accessToken);
        } else if (response?.type === 'error') {
            Alert.alert("Google Auth Error", response.error?.message || "Something went wrong with Google Sign-In");
        }
    }, [response]);

    const handleGoogleSignIn = () => {
        const isWebConfigured = GOOGLE_CONFIG.webClientId && GOOGLE_CONFIG.webClientId !== 'YOUR_WEB_CLIENT_ID_HERE';
        const isIosConfigured = GOOGLE_CONFIG.iosClientId && GOOGLE_CONFIG.iosClientId !== 'YOUR_IOS_CLIENT_ID_HERE';
        const isAndroidConfigured = GOOGLE_CONFIG.androidClientId && GOOGLE_CONFIG.androidClientId !== 'YOUR_ANDROID_CLIENT_ID_HERE';

        if (!isWebConfigured && !isIosConfigured && !isAndroidConfigured) {
            Alert.alert(
                "Config Required",
                "Google Sign-In is not configured yet. You need to set at least one Client ID in LoginScreen.js"
            );
            return;
        }
        promptAsync({
            prompt: 'select_account',
            useProxy: isExpoGo,
        });
    };

    const fetchUserInfo = async (token) => {
        try {
            const response = await fetch(
                'https://www.googleapis.com/userinfo/v2/me',
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const user = await response.json();
            // Call backend google login
            const result = await googleLogin(user.email, user.name, user.id);
            if (!result.success) {
                Alert.alert("Google Login Failed", result.error);
            }
        } catch (error) {
            console.log(error);
            Alert.alert("Google Auth Error", "Failed to get user info");
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }
        console.log("Attempting login to:", `http://${ip}:5000/api/users/login`);
        const result = await login(email, password);
        if (!result.success) {
            Alert.alert("Login Failed", result.error);
        }
    }

    return (
        <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-slate-950 p-6">
            <View className="w-full bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-slate-800">
                <Text className="text-3xl font-extrabold text-center text-gray-800 dark:text-white mb-2">Welcome Back</Text>
                <Text className="text-center text-gray-400 dark:text-gray-500 mb-8">Login to your restaurant account</Text>

                <TextInput
                    className="w-full bg-gray-100 dark:bg-slate-800 p-4 rounded-xl mb-4 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200"
                    value={email}
                    placeholder="Enter email"
                    placeholderTextColor="#94a3b8"
                    onChangeText={text => setEmail(text)}
                    autoCapitalize="none"
                />

                <TextInput
                    className="w-full bg-gray-100 dark:bg-slate-800 p-4 rounded-xl mb-6 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200"
                    value={password}
                    placeholder="Enter password"
                    placeholderTextColor="#94a3b8"
                    onChangeText={text => setPassword(text)}
                    secureTextEntry
                />

                <TouchableOpacity
                    className="w-full bg-orange-500 p-4 rounded-2xl shadow-md active:bg-orange-600 mb-4"
                    onPress={handleLogin}
                >
                    <Text className="text-center text-white font-bold text-lg">Login</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-sm flex-row justify-center items-center active:scale-95 transition-all"
                    onPress={handleGoogleSignIn}
                    disabled={!request}
                >
                    <View className="mr-3 bg-white p-1 rounded-full items-center justify-center" style={{ width: 28, height: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1 }}>
                        <Text className="text-xl font-bold" style={{ color: '#4285F4' }}>G</Text>
                    </View>
                    <Text className="text-center text-slate-700 dark:text-slate-200 font-bold text-lg">Continue with Google</Text>
                </TouchableOpacity>

                <View className="flex-row justify-center mt-6">
                    <Text className="text-gray-500 dark:text-gray-400">Don't have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text className="text-orange-500 font-bold">Register</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default LoginScreen;
