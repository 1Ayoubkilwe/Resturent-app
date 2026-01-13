import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import ip from '../config/ip';

const RegisterScreen = ({ navigation }) => {
    const [name, setName] = useState(null);
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const API_URL = `http://${ip}:5000/api/users`;
    const { login } = useContext(AuthContext);

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        setIsLoading(true);
        try {
            console.log("Attempting registration to:", `${API_URL}`);
            const res = await axios.post(
                `${API_URL}`,
                { name, email, password },
                { timeout: 10000 }
            );
            console.log("Registration success:", res.data);
            const result = await login(email, password);
            if (!result.success) {
                Alert.alert("Auto-Login Failed", result.error || "Please try logging in manually.");
            }
        } catch (e) {
            console.log(`Register error:`, e.response?.data || e.message);
            const errorMessage = e.response?.data?.message || "Registration failed. Please check your details and try again.";
            Alert.alert("Registration Failed", errorMessage);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-slate-950 p-6">
            <View className="w-full bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-slate-800">
                <Text className="text-3xl font-extrabold text-center text-gray-800 dark:text-white mb-2">Create Account</Text>
                <Text className="text-center text-gray-400 dark:text-gray-500 mb-8">Join our restaurant network</Text>

                <TextInput
                    className="w-full bg-gray-100 dark:bg-slate-800 p-4 rounded-xl mb-4 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200"
                    value={name}
                    placeholder="Restaurant Name"
                    placeholderTextColor="#94a3b8"
                    onChangeText={text => setName(text)}
                />

                <TextInput
                    className="w-full bg-gray-100 dark:bg-slate-800 p-4 rounded-xl mb-4 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200"
                    value={email}
                    placeholder="Email Address"
                    placeholderTextColor="#94a3b8"
                    onChangeText={text => setEmail(text)}
                    autoCapitalize="none"
                />

                <TextInput
                    className="w-full bg-gray-100 dark:bg-slate-800 p-4 rounded-xl mb-6 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200"
                    value={password}
                    placeholder="Password"
                    placeholderTextColor="#94a3b8"
                    onChangeText={text => setPassword(text)}
                    secureTextEntry
                />

                <TouchableOpacity
                    className={`w-full p-4 rounded-2xl shadow-md ${isLoading ? 'bg-orange-300' : 'bg-orange-500 active:bg-orange-600'}`}
                    onPress={handleRegister}
                    disabled={isLoading}
                >
                    <Text className="text-center text-white font-bold text-lg">
                        {isLoading ? 'Creating Account...' : 'Register'}
                    </Text>
                </TouchableOpacity>

                <View className="flex-row justify-center mt-6">
                    <Text className="text-gray-500 dark:text-gray-400">Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text className="text-orange-500 font-bold">Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default RegisterScreen;
