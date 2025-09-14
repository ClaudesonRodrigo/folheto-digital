// js/config.js

// Importar os módulos necessários do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, collection } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// A configuração agora lê as variáveis de um objeto global injetado pelo Netlify.
// Este objeto é criado pelo recurso "Snippet Injection" que configuramos no painel do Netlify.
const firebaseConfig = window.__FIREBASE_CONFIG__;

// Inicializar Firebase com a configuração recebida
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Definir a referência para a coleção 'lojas', que é a que você está usando nos scripts mais recentes.
const storesRef = collection(db, 'lojas');

// Exportar as variáveis para serem usadas em outros arquivos do projeto
export { db, storesRef, app };