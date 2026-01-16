import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import ip from '../config/ip';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const { login } = useContext(AuthContext);

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

// Setup async storage for tokens - 3 days ago
