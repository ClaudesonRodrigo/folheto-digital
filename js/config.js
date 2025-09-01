// Importar os módulos necessários do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, collection } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || "AIzaSyAuf4-eFM-rGXlw4oXeeFErIXluLSgfMO8",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "folheto-digital-169b1.firebaseapp.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "folheto-digital-169b1",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "folheto-digital-169b1.firebasestorage.app",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "777763357954",
    appId: process.env.FIREBASE_APP_ID || "1:777763357954:web:8255e223cb7d3ceff52e1b",
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-HW1FWPV48H"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const productsRef = collection(db, 'products');

export { db, productsRef };