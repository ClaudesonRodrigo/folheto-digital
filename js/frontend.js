import { db } from './config.js';
import { getDoc, collection, getDocs, query, where, limit, doc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

// Elementos da página
const storeNameEl = document.getElementById('storeName');
const mapContainer = document.getElementById('mapContainer');
const productList = document.getElementById('productList');
const whatsappLink = document.getElementById('whatsappLink');
const footerText = document.getElementById('footerText');

// Função principal para carregar o folheto
async function loadFlyer() {
    // 1. Pega o ID da mercearia da URL (ex: ?id=xyz123)
    const params = new URLSearchParams(window.location.search);
    const storeId = params.get('id');

    if (!storeId) {
        storeNameEl.textContent = "Folheto não encontrado!";
        productList.innerHTML = "<p>Verifique o link e tente novamente.</p>";
        return;
    }

    try {
        // 2. Busca os dados da mercearia
        const storeDocRef = doc(db, 'mercerias', storeId);
        const storeSnapshot = await getDoc(storeDocRef);

        if (!storeSnapshot.exists()) {
            storeNameEl.textContent = "Mercearia não encontrada!";
            return;
        }

        const storeData = storeSnapshot.data();

        // 3. Atualiza as informações da página com os dados da mercearia
        document.title = `Folheto Digital - ${storeData.nome}`;
        storeNameEl.textContent = `${storeData.nome} - Folheto Digital`;
        
        // Insere o Iframe do mapa
        mapContainer.innerHTML = `<iframe src="${storeData.localizacao}" allowfullscreen="" loading="lazy"></iframe>`;

        // Atualiza o link do WhatsApp
        const whatsappMessage = encodeURIComponent('Olá! Gostaria de saber mais sobre as promoções.');
        whatsappLink.href = `https://wa.me/${storeData.whatsapp}?text=${whatsappMessage}`;
        
        // Atualiza o rodapé
        footerText.textContent = `© ${new Date().getFullYear()} ${storeData.nome}. Todos os direitos reservados.`;

        // 4. Busca os produtos promocionais da sub-coleção daquela mercearia
        const productsRef = collection(db, 'mercerias', storeId, 'produtos');
        const q = query(productsRef, where('isPromotional', '==', true), limit(8));
        const productsSnapshot = await getDocs(q);

        productList.innerHTML = ''; // Limpa a lista
        if (productsSnapshot.empty) {
            productList.innerHTML = '<p>Nenhum produto promocional disponível no momento.</p>';
            return;
        }

        productsSnapshot.forEach(doc => {
            const data = doc.data();
            const productDiv = document.createElement('div');
            productDiv.classList.add('product');
            productDiv.innerHTML = `
                <img src="${data.imageUrl}" alt="${data.name}">
                <h3>${data.name}</h3>
                <p>${data.description}</p>
                <span class="price">R$ ${data.price.toFixed(2)}</span>
            `;
            productList.appendChild(productDiv);
        });

    } catch (error) {
        console.error('Erro ao carregar o folheto:', error);
        storeNameEl.textContent = "Erro ao carregar folheto";
    }
}

// Inicia o carregamento
loadFlyer();