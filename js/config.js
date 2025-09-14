// js/config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, collection } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const firebaseConfig = window.__FIREBASE_CONFIG__;

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storesRef = collection(db, 'lojas');

export { db, storesRef, app };