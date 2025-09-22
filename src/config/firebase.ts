import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAMsK0XzP1n1lYCaKNb08KP8Fio-Yw69D0",
  authDomain: "sihproject-700b0.firebaseapp.com",
  projectId: "sihproject-700b0",
  storageBucket: "sihproject-700b0.appspot.com",
  messagingSenderId: "233272893337",
  appId: "1:233272893337:web:abab052f829e9cf37abd08",
  measurementId: "G-LFQRBCJVGT"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;