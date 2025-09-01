// Importar os módulos necessários do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, collection } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAuf4-eFM-rGXlw4oXeeFErIXluLSgfMO8",
    authDomain: "folheto-digital-169b1.firebaseapp.com",
    projectId: "folheto-digital-169b1",
    storageBucket: "folheto-digital-169b1.firebasestorage.app",
    messagingSenderId: "777763357954",
    appId: "1:777763357954:web:8255e223cb7d3ceff52e1b",
    measurementId: "G-HW1FWPV48H"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const productsRef = collection(db, 'products');

export { db, productsRef };