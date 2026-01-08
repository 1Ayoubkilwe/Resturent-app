import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            "home": "Home",
            "dine_in": "Dine In",
            "products": "Products",
            "profile": "Profile",
            "add_food": "Add Food",
            "add_category": "Add Category",
            "logout": "Logout",
            "settings": "Settings",
            "language": "Language",
            "orders_overview": "Orders Overview",
            "food_management": "Food Management",
            "working_hours": "Working Hours",
            "closed": "Closed",
            "open": "Open"
        }
    },
    so: {
        translation: {
            "home": "Hoyga",
            "dine_in": "Cunista Gudaha",
            "products": "Badeecadaha",
            "profile": "Profile",
            "add_food": "Ku dar Cunto",
            "add_category": "Ku dar Qayb",
            "logout": "Ka bax",
            "settings": "Habsami u socodka",
            "language": "Luqadda",
            "orders_overview": "Guudmarka Dalabaadka",
            "food_management": "Maamulka Cuntada",
            "working_hours": "Saacadaha Shaqada",
            "closed": "Xiran",
            "open": "Furan"
        }
    },
    ar: {
        translation: {
            "home": "الرئيسية",
            "dine_in": "تناول الطعام في الداخل",
            "products": "المنتجات",
            "profile": "الحساب",
            "add_food": "إضافة طعام",
            "add_category": "إضافة فئة",
            "logout": "تسجيل الخروج",
            "settings": "الإعدادات",
            "language": "اللغة",
            "orders_overview": "نظرة عامة على الطلبات",
            "food_management": "إدارة الطعام",
            "working_hours": "ساعات العمل",
            "closed": "مغلق",
            "open": "مفتوح"
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
