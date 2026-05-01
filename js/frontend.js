import { db } from './config.js';
import { getDoc, collection, getDocs, query, where, limit, doc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

// --- Elementos da Página ---
const storeNameEl = document.getElementById('storeName');
const storeLogoEl = document.getElementById('storeLogo');
const mapContainer = document.getElementById('mapContainer');
const productList = document.getElementById('productList');
const whatsappLink = document.getElementById('whatsappLink');
const footerText = document.getElementById('footerText');
const viewAllProductsLink = document.getElementById('viewAllProductsLink');

// --- Elementos do Modal ---
const productModal = document.getElementById('productModal');
const modalImg = document.getElementById('modalImg');
const modalName = document.getElementById('modalName');
const modalDesc = document.getElementById('modalDesc');
const modalPrice = document.getElementById('modalPrice');
const modalWhatsappLink = document.getElementById('modalWhatsappLink');

// --- Variáveis Globais ---
let productsData = {};
let storeWhatsappNumber = '';

function formatPrice(value) {
    const numericValue = Number(value) || 0;
    return numericValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function safeMapUrl(url) {
    if (!url || typeof url !== 'string') return '';
    try {
        const parsed = new URL(url);
        const allowedHost = parsed.hostname.includes('google.com') || parsed.hostname.includes('googleusercontent.com');
        return allowedHost ? parsed.toString() : '';
    } catch {
        return '';
    }
}

// --- Funções do Modal ---
window.openProductModal = (productId) => {
    const product = productsData[productId];

    if (product) {
        modalImg.src = product.imageUrl;
        modalName.textContent = product.name;
        modalDesc.textContent = product.description;
        modalPrice.textContent = formatPrice(product.price);

        const message = encodeURIComponent(`Olá! Tenho interesse no produto: *${product.name}* - ${formatPrice(product.price)}`);
        modalWhatsappLink.href = `https://wa.me/${storeWhatsappNumber}?text=${message}`;

        modalWhatsappLink.textContent = 'Tenho Interesse';
        modalWhatsappLink.classList.remove('added');
        
        const handleInterestClick = () => {
            modalWhatsappLink.textContent = 'Adicionado!';
            modalWhatsappLink.classList.add('added');
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
// Em js/frontend.js

async function loadFlyer() {
    const params = new URLSearchParams(window.location.search);
    const storeId = params.get('id');

    if (!storeId) {
        storeNameEl.textContent = "Catálogo não encontrado!";
        return;
    }
    
    viewAllProductsLink.href = `/produtos.html?id=${storeId}`;

    try {
        const storeDocRef = doc(db, 'lojas', storeId);
        const storeSnapshot = await getDoc(storeDocRef);
        if (!storeSnapshot.exists()) {
            storeNameEl.textContent = "Estabelecimento não encontrado!";
            return;
        }

        const storeData = storeSnapshot.data();
        storeWhatsappNumber = storeData.whatsapp;

        // --- LÓGICA DE TEMAS E TÍTULOS ---
        const pageTitle = document.querySelector('.showcase h2');
        
        if (storeData.segmento === 'cardapio') {
            const themeLink = document.createElement('link');
            themeLink.rel = 'stylesheet';
            themeLink.href = 'css/cardapio-theme.css';
            document.head.appendChild(themeLink);
            pageTitle.textContent = '⭐ Nosso Cardápio Principal';
            document.title = `Cardápio - ${storeData.nome}`;

        } else if (storeData.segmento === 'servicos') {
            const themeLink = document.createElement('link');
            themeLink.rel = 'stylesheet';
            themeLink.href = 'css/servicos-theme.css';
            document.head.appendChild(themeLink);
            pageTitle.textContent = '✨ Nossos Serviços';
            document.title = `Serviços - ${storeData.nome}`;

        } else { // Padrão para mercearia
            pageTitle.textContent = '🔥 Promoções da Semana';
            document.title = `Folheto Digital - ${storeData.nome}`;
        }

        // --- PREENCHIMENTO DAS INFORMAÇÕES ---
        storeNameEl.textContent = `${storeData.nome}`;
        if (storeData.logoUrl) {
            storeLogoEl.src = storeData.logoUrl;
            storeLogoEl.style.display = 'block';
        }
        const mapUrl = safeMapUrl(storeData.localizacao);
        if (mapUrl) {
            const iframe = document.createElement('iframe');
            iframe.src = mapUrl;
            iframe.setAttribute('allowfullscreen', '');
            iframe.loading = 'lazy';
            mapContainer.replaceChildren(iframe);
        } else {
            mapContainer.textContent = 'Localização indisponível no momento.';
        }
        const generalMessage = encodeURIComponent(`Olá! Gostaria de saber mais sobre as promoções.`);
        whatsappLink.href = `https://wa.me/${storeWhatsappNumber}?text=${generalMessage}`;
        footerText.textContent = `© ${new Date().getFullYear()} ${storeData.nome}. Todos os direitos reservados.`;

        // --- BUSCA DOS PRODUTOS/SERVIÇOS EM DESTAQUE ---
        const productsRef = collection(db, 'lojas', storeId, 'produtos');
        const q = query(productsRef, where('isPromotional', '==', true), limit(12));
        const productsSnapshot = await getDocs(q);

        productList.innerHTML = ''; // Limpa os skeletons

        if (productsSnapshot.empty) {
            productList.textContent = 'Nenhum item promocional encontrado para este catálogo.';
            return;
        }

        productsSnapshot.forEach(doc => {
            const productId = doc.id;
            const data = doc.data();
            productsData[productId] = data;

            const productDiv = document.createElement('div');
            productDiv.classList.add('product');
            productDiv.addEventListener('click', () => openProductModal(productId));

            const productImg = document.createElement('img');
            productImg.src = data.imageUrl;
            productImg.alt = data.name;

            const infoWrapper = document.createElement('div');
            infoWrapper.classList.add('product-info');

            const title = document.createElement('h3');
            title.textContent = data.name;

            const priceContainer = document.createElement('div');
            priceContainer.classList.add('product-price-container');

            const price = document.createElement('span');
            price.classList.add('price');
            price.textContent = formatPrice(data.price);

            priceContainer.appendChild(price);
            infoWrapper.append(title, priceContainer);
            productDiv.append(productImg, infoWrapper);
            productList.appendChild(productDiv);
        });

    } catch (error) {
        console.error('Erro ao carregar o catálogo:', error);
        storeNameEl.textContent = "Erro ao carregar catálogo";
    }
}

// --- Inicia o Carregamento ---
loadFlyer();