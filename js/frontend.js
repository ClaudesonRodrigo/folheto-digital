import { db } from './config.js';
import { getDoc, collection, getDocs, query, where, limit, doc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

// --- Elementos da Página ---
const storeNameEl = document.getElementById('storeName');
const storeLogoEl = document.getElementById('storeLogo');
const mapContainer = document.getElementById('mapContainer');
const productList = document.getElementById('productList');
const whatsappLink = document.getElementById('whatsappLink');
const footerText = document.getElementById('footerText');

// --- Elementos do Modal ---
const productModal = document.getElementById('productModal');
const modalImg = document.getElementById('modalImg');
const modalName = document.getElementById('modalName');
const modalDesc = document.getElementById('modalDesc');
const modalPrice = document.getElementById('modalPrice');
const modalWhatsappLink = document.getElementById('modalWhatsappLink');

// --- Variáveis Globais ---
let productsData = {}; // Objeto para guardar os dados de todos os produtos
let storeWhatsappNumber = ''; // Para guardar o WhatsApp da loja

// --- Funções do Modal ---
window.openProductModal = (productId) => {
    const product = productsData[productId]; // Pega os dados do produto clicado

    if (product) {
        // 1. Preenche o modal com os dados do produto
        modalImg.src = product.imageUrl;
        modalName.textContent = product.name;
        modalDesc.textContent = product.description;
        modalPrice.textContent = `R$ ${product.price.toFixed(2)}`;

        // 2. Cria a mensagem personalizada para o WhatsApp
        const message = encodeURIComponent(`Olá! Tenho interesse no produto: *${product.name}* - R$ ${product.price.toFixed(2)}`);
        modalWhatsappLink.href = `https://wa.me/${storeWhatsappNumber}?text=${message}`;

        // 3. Mostra o modal
        productModal.classList.remove('hidden');
    }
};

window.closeProductModal = () => {
    productModal.classList.add('hidden');
};

// Fecha o modal se o usuário clicar no fundo preto
productModal.addEventListener('click', (event) => {
    if (event.target === productModal) {
        closeProductModal();
    }
});


// --- Função Principal para Carregar o Folheto ---
async function loadFlyer() {
    const params = new URLSearchParams(window.location.search);
    const storeId = params.get('id');

    if (!storeId) {
        storeNameEl.textContent = "Folheto não encontrado!";
        return;
    }

    try {
        const storeDocRef = doc(db, 'mercerias', storeId);
        const storeSnapshot = await getDoc(storeDocRef);
        if (!storeSnapshot.exists()) {
            storeNameEl.textContent = "Mercearia não encontrada!";
            return;
        }

        const storeData = storeSnapshot.data();
        storeWhatsappNumber = storeData.whatsapp; // Guarda o número para usar no modal

        // --- Preenche as informações da loja ---
        document.title = `Folheto Digital - ${storeData.nome}`;
        storeNameEl.textContent = `${storeData.nome} - Folheto Digital`;
        if (storeData.logoUrl) {
            storeLogoEl.src = storeData.logoUrl;
            storeLogoEl.style.display = 'block';
        }
        mapContainer.innerHTML = `<iframe src="${storeData.localizacao}" allowfullscreen="" loading="lazy"></iframe>`;
        const generalMessage = encodeURIComponent('Olá! Gostaria de saber mais sobre as promoções.');
        whatsappLink.href = `https://wa.me/${storeWhatsappNumber}?text=${generalMessage}`;
        footerText.textContent = `© ${new Date().getFullYear()} ${storeData.nome}. Todos os direitos reservados.`;

        // --- Busca os produtos promocionais ---
        const productsRef = collection(db, 'mercerias', storeId, 'produtos');
        const q = query(productsRef, where('isPromotional', '==', true), limit(10));
        const productsSnapshot = await getDocs(q);

        productList.innerHTML = '';
        productsSnapshot.forEach(doc => {
            const productId = doc.id;
            const data = doc.data();
            productsData[productId] = data; // Guarda os dados do produto no nosso objeto

            const productDiv = document.createElement('div');
            productDiv.classList.add('product');
            // Adiciona o evento de clique que chama a função do modal
            productDiv.setAttribute('onclick', `openProductModal('${productId}')`);

            productDiv.innerHTML = `
                <img src="${data.imageUrl}" alt="${data.name}">
                <div class="product-info">
                    <h3>${data.name}</h3>
                    <p>${data.description}</p>
                    <div class="product-price-container">
                        <span class="price">R$ ${data.price.toFixed(2)}</span>
                    </div>
                </div>
            `;
            productList.appendChild(productDiv);
        });

    } catch (error) {
        console.error('Erro ao carregar o folheto:', error);
        storeNameEl.textContent = "Erro ao carregar folheto";
    }
}

// --- Inicia o Carregamento ---
loadFlyer();