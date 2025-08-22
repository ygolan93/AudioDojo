// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDcBrekf9u0nDGHr8190sIdPe5cwOqtW00",
  authDomain: "audio-dojo.firebaseapp.com",
  projectId: "audio-dojo",
  storageBucket: "audio-dojo.firebasestorage.app",
  messagingSenderId: "858581845318",
  appId: "1:858581845318:web:8fe142343258d7ad905147",
  measurementId: "G-JRXPC9D3CQ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
