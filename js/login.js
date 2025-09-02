import { app } from './config.js'; // Precisamos do app para o Auth
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';

const auth = getAuth(app);
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('errorMessage');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = emailInput.value;
    const password = passwordInput.value;
    
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Login bem-sucedido, redireciona para o painel
            window.location.href = '/admin.html';
        })
        .catch((error) => {
            // Exibe mensagem de erro
            errorMessage.textContent = 'E-mail ou senha incorretos.';
            console.error("Erro no login:", error);
        });
});