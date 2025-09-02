import { db, storesRef } from './config.js';
import { getDocs, query, limit, orderBy } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

const latestFlyersContainer = document.getElementById('latest-flyers');

async function loadLatestFlyers() {
    if (!latestFlyersContainer) return;

    try {
        // Cria uma consulta para buscar as mercearias,
        // ordenando pelas mais recentes (precisaremos de um campo de data)
        // Por agora, vamos buscar sem ordenação específica, mas limitando a 3.
        const q = query(storesRef, limit(3)); // Busca as 3 primeiras que encontrar

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            latestFlyersContainer.innerHTML = '<p>Nenhum folheto de exemplo disponível no momento.</p>';
            return;
        }

        latestFlyersContainer.innerHTML = ''; // Limpa o container

        snapshot.forEach(doc => {
            const store = doc.data();
            const flyerId = doc.id;

            const card = document.createElement('a');
            card.href = `/folheto.html?id=${flyerId}`;
            card.target = '_blank'; // Abrir em nova aba
            card.classList.add('flyer-card');

            // Tenta pegar a primeira imagem de produto como capa
            // (Esta é uma melhoria, por enquanto usamos uma cor)
            card.innerHTML = `
                <div class="flyer-card-image" style="background-color: #e9e9e9;">
                    </div>
                <div class="flyer-card-content">
                    <h3>${store.nome}</h3>
                    <p>${store.endereco.cidade}, ${store.endereco.estado}</p>
                    <span class="view-flyer">Ver Ofertas</span>
                </div>
            `;
            
            latestFlyersContainer.appendChild(card);
        });

    } catch (error) {
        console.error("Erro ao carregar folhetos de exemplo:", error);
        latestFlyersContainer.innerHTML = '<p>Erro ao carregar exemplos. Tente novamente mais tarde.</p>';
    }
}

// Inicia o carregamento dos exemplos
loadLatestFlyers();