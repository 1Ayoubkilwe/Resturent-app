import "./global.css";
import "./i18n";
import React, { useContext } from 'react';
import { View, ActivityIndicator, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';

import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProfileScreen from './screens/ProfileScreen';
import AddFoodScreen from './screens/AddFoodScreen';
import AddCategoryScreen from './screens/AddCategoryScreen';
import DineInScreen from './screens/DineInScreen';
import ProductsScreen from './screens/ProductsScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Utensils, Package, User } from 'lucide-react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

const MainTabs = () => {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
   const { t } = useTranslation();

  const labels = {
    Home: t('home'),
    'Dine In': t('dine_in'),
    Products: t('products'),
    Profile: t('profile'),
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') return <Home size={size} color={color} />;
          if (route.name === 'Dine In') return <Utensils size={size} color={color} />;
          if (route.name === 'Products') return <Package size={size} color={color} />;
          if (route.name === 'Profile') return <User size={size} color={color} />;
        },
        tabBarLabel: labels[route.name] || route.name,
        tabBarActiveTintColor: '#f97316',
        tabBarInactiveTintColor: colorScheme === 'dark' ? '#94a3b8' : '#64748b',
        tabBarStyle: {
          paddingBottom: insets.bottom > 0 ? insets.bottom + 5 : 15,
          paddingTop: 10,
          height: insets.bottom > 0 ? 65 + insets.bottom : 75,
          borderTopWidth: 1,
          borderTopColor: colorScheme === 'dark' ? '#1e293b' : '#e2e8f0',
          backgroundColor: colorScheme === 'dark' ? '#0f172a' : '#ffffff',
          position: 'absolute',
          elevation: 0,
        },
        headerShown: false
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Dine In" component={DineInScreen} />
      <Tab.Screen name="Products" component={ProductsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const AppStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="AddFood" component={AddFoodScreen} options={{ title: 'Add Food' }} />
      <Stack.Screen name="AddCategory" component={AddCategoryScreen} options={{ title: 'Add Category' }} />
    </Stack.Navigator>
  );
};

const AppNav = () => {
  const { isLoading, userToken } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size={'large'} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {userToken !== null ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNav />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

// Setup API configuration - 3 days ago

// Initialize http client - 3 days ago
