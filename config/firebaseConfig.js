import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// TODO: Replace with your Firebase project config
export const firebaseConfig = {
  apiKey: 'AIzaSyBDJfk4CQnBpmkJs8iForXkhDJ8WYW0Mc',
  authDomain: 'resturentapp-cc744.firebaseapp.com',
  projectId: 'resturentapp-cc744',
  storageBucket: 'resturentapp-cc744.appspot.com',
  messagingSenderId: '210869819537',
  appId: '1:210869819537:web:5f7af1417c2042636e8730',
};

const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);
