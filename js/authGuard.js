import { app } from './config.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';

const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
    // Se não houver usuário logado (user é null)
    if (!user) {
        // Redireciona para a página de login
        console.log("Usuário não autenticado. Redirecionando para login...");
        window.location.replace('/login.html');
    } else {
        // Se houver usuário, permite que a página carregue
        console.log("Usuário autenticado:", user.email);
    }
});