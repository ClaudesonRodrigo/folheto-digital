// js/config.js

// Importar os módulos necessários do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, collection } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// A configuração agora lê as variáveis de ambiente
const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_APP_ID,
    measurementId: import.meta.env.VITE_MEASUREMENT_ID 
};

// O resto do arquivo permanece o mesmo
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storesRef = collection(db, 'lojas'); // Corrigido para a coleção mais genérica 'lojas'

export { db, storesRef, app };