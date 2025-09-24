import { db } from './config.js';
import { getDocs, query, where, limit, collection } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

const latestFlyersContainer = document.getElementById('latest-flyers');
// ATENÇÃO: Se você renomeou a coleção no Firebase para 'lojas', mude a linha abaixo.
// Se ainda estiver usando 'mercerias' para todos, mantenha como está.
const storesRef = collection(db, 'lojas'); 

async function loadLatestFlyers() {
    if (!latestFlyersContainer) return;

    try {
        // A mágica acontece aqui: filtramos para mostrar apenas o segmento "cardapio"
        const q = query(storesRef, where("segmento", "==", "servicos"), limit(3));

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            latestFlyersContainer.innerHTML = '<p>Nenhum cardápio de exemplo disponível no momento.</p>';
            return;
        }

        latestFlyersContainer.innerHTML = ''; // Limpa o container

        snapshot.forEach(doc => {
            const store = doc.data();
            const flyerId = doc.id;

            const card = document.createElement('a');
            card.href = `/folheto.html?id=${flyerId}`;
            card.target = '_blank';
            card.classList.add('flyer-card');

            const imageUrl = store.logoUrl || 'https://placehold.co/400x200/c82a34/ffffff?text=Sem+Logo';

            card.innerHTML = `
                <div class="flyer-card-image">
                    <img src="${imageUrl}" alt="Logo de ${store.nome}">
                </div>
                <div class="flyer-card-content">
                    <h3>${store.nome}</h3>
                    <p>${store.endereco.cidade}, ${store.endereco.estado}</p>
                    <span class="view-flyer">Ver Cardápio</span>
                </div>
            `;
            
            latestFlyersContainer.appendChild(card);
        });

    } catch (error) {
        console.error("Erro ao carregar cardápios de exemplo:", error);
        latestFlyersContainer.innerHTML = '<p>Erro ao carregar exemplos. Tente novamente mais tarde.</p>';
    }
}

loadLatestFlyers();

