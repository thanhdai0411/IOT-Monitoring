// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFunctions } from 'firebase/functions';

// import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: 'AIzaSyBCCYKcGwS2o97VuKuxrN7YideQKDKWIuE',
    appId: '1:451073259847:web:6dcaaeb42fff850cad3462',
    authDomain: 'weatherstationiotdaiviet.firebaseapp.com',
    databaseURL: 'https://iotdaiviet-realtime-db.asia-southeast1.firebasedatabase.app/',
    measurementId: 'G-LBNQTTL45P',
    messagingSenderId: '451073259847',
    projectId: 'weatherstationiotdaiviet',
    storageBucket: 'weatherstationiotdaiviet.appspot.com',
};
// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const functions = getFunctions(app, 'asia-east2');

// const analytics = getAnalytics(app);
