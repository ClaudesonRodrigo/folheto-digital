import { db } from './config.js';
import { getDoc, collection, getDocs, query, where, limit, doc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

// --- Elementos da Página ---
const storeNameEl = document.getElementById('storeName');
const storeLogoEl = document.getElementById('storeLogo');
const mapContainer = document.getElementById('mapContainer');
const productList = document.getElementById('productList');
const whatsappLink = document.getElementById('whatsappLink');
const footerText = document.getElementById('footerText');
const viewAllProductsLink = document.getElementById('viewAllProductsLink'); // Novo elemento

// --- Elementos do Modal ---
const productModal = document.getElementById('productModal');
const modalImg = document.getElementById('modalImg');
const modalName = document.getElementById('modalName');
const modalDesc = document.getElementById('modalDesc');
const modalPrice = document.getElementById('modalPrice');
const modalWhatsappLink = document.getElementById('modalWhatsappLink');

// --- Variáveis Globais ---
let productsData = {}; // Objeto para guardar os dados dos produtos promocionais
let storeWhatsappNumber = ''; // Para guardar o WhatsApp da loja

// --- Funções do Modal ---
window.openProductModal = (productId) => {
    const product = productsData[productId];

    if (product) {
        modalImg.src = product.imageUrl;
        modalName.textContent = product.name;
        modalDesc.textContent = product.description;
        modalPrice.textContent = `R$ ${product.price.toFixed(2)}`;

        const message = encodeURIComponent(`Olá! Tenho interesse no produto: *${product.name}* - R$ ${product.price.toFixed(2)}`);
        modalWhatsappLink.href = `https://wa.me/${storeWhatsappNumber}?text=${message}`;

        // Reseta o botão para o estado original
        modalWhatsappLink.textContent = 'Tenho Interesse';
        modalWhatsappLink.classList.remove('added');
        
        // Adiciona um listener para o clique
        const handleInterestClick = () => {
            modalWhatsappLink.textContent = 'Adicionado!';
            modalWhatsappLink.classList.add('added');

            // Remove o listener para não acumular múltiplos cliques
            modalWhatsappLink.removeEventListener('click', handleInterestClick);
        };
        modalWhatsappLink.addEventListener('click', handleInterestClick);

        productModal.classList.remove('hidden');
    }
};

window.closeProductModal = () => {
    productModal.classList.add('hidden');
};

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
    
    // Configura o link para a nova página de todos os produtos
    viewAllProductsLink.href = `/produtos.html?id=${storeId}`;

    try {
        const storeDocRef = doc(db, 'lojas', storeId);
        const storeSnapshot = await getDoc(storeDocRef);
        if (!storeSnapshot.exists()) {
            storeNameEl.textContent = "Mercearia não encontrada!";
            return;
        }

        const storeData = storeSnapshot.data();
        storeWhatsappNumber = storeData.whatsapp;

        const pageTitle = document.querySelector('.showcase h2');
        if (storeData.segmento === 'servicos') {
            pageTitle.textContent = '✨ Nossos Serviços em Destaque';
            document.title = `Serviços - ${storeData.nome}`;
        } else {
            pageTitle.textContent = '🔥 Promoções da Semana';
            document.title = `Folheto Digital - ${storeData.nome}`;
        }

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
        const productsRef = collection(db, 'lojas', storeId, 'produtos');
        const q = query(productsRef, where('isPromotional', '==', true), limit(12)); // Alterado para 12
        const productsSnapshot = await getDocs(q);

        productList.innerHTML = '';
        productsSnapshot.forEach(doc => {
            const productId = doc.id;
            const data = doc.data();
            productsData[productId] = data;

            const productDiv = document.createElement('div');
            productDiv.classList.add('product');
            productDiv.setAttribute('onclick', `openProductModal('${productId}')`);

            productDiv.innerHTML = `
                <img src="${data.imageUrl}" alt="${data.name}">
                <div class="product-info">
                    <h3>${data.name}</h3>
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
