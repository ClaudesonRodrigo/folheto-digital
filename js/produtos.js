import { db } from './config.js';
import { getDoc, collection, getDocs, query, doc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

// --- Elementos da Página ---
const storeNameEl = document.getElementById('storeName');
const storeLogoEl = document.getElementById('storeLogo');
const productListEl = document.getElementById('allProductList');
const whatsappLink = document.getElementById('whatsappLink');
const footerText = document.getElementById('footerText');
const searchInput = document.getElementById('searchInput');
const noResultsMessage = document.getElementById('noResultsMessage');
const backToFlyerLink = document.getElementById('backToFlyerLink');


// --- Elementos do Modal ---
const productModal = document.getElementById('productModal');
const modalImg = document.getElementById('modalImg');
const modalName = document.getElementById('modalName');
const modalDesc = document.getElementById('modalDesc');
const modalPrice = document.getElementById('modalPrice');
const modalWhatsappLink = document.getElementById('modalWhatsappLink');

// --- Variáveis Globais ---
let allProductsData = []; // Array para guardar os dados de todos os produtos
let storeWhatsappNumber = ''; // Para guardar o WhatsApp da loja

// --- Funções do Modal (Idênticas ao frontend.js) ---
window.openProductModal = (productId) => {
    const product = allProductsData.find(p => p.id === productId);

    if (product) {
        modalImg.src = product.imageUrl;
        modalName.textContent = product.name;
        modalDesc.textContent = product.description;
        modalPrice.textContent = `R$ ${product.price.toFixed(2)}`;
        
        const message = encodeURIComponent(`Olá! Tenho interesse no produto: *${product.name}* - R$ ${product.price.toFixed(2)}`);
        modalWhatsappLink.href = `https://wa.me/${storeWhatsappNumber}?text=${message}`;
        
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


// --- Função para Renderizar Produtos ---
function renderProducts(productsToRender) {
    productListEl.innerHTML = '';
    if (productsToRender.length === 0) {
        noResultsMessage.classList.remove('hidden');
    } else {
        noResultsMessage.classList.add('hidden');
    }

    productsToRender.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('product');
        // Adiciona a classe 'promotional' se o produto estiver em promoção
        if (product.isPromotional) {
            productDiv.classList.add('promotional');
        }
        productDiv.setAttribute('onclick', `openProductModal('${product.id}')`);

        productDiv.innerHTML = `
            <img src="${product.imageUrl}" alt="${product.name}">
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="product-price-container">
                    <span class="price">R$ ${product.price.toFixed(2)}</span>
                </div>
            </div>
        `;
        productListEl.appendChild(productDiv);
    });
}


// --- Função de Busca ---
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredProducts = allProductsData.filter(product =>
        product.name.toLowerCase().includes(searchTerm)
    );
    renderProducts(filteredProducts);
});


// --- Função Principal para Carregar a Página ---
async function loadAllProductsPage() {
    const params = new URLSearchParams(window.location.search);
    const storeId = params.get('id');

    if (!storeId) {
        storeNameEl.textContent = "Página não encontrada!";
        return;
    }
    
    // Configura o link de "voltar"
    backToFlyerLink.href = `/folheto.html?id=${storeId}`;

    try {
        const storeDocRef = doc(db, 'lojas', storeId);
        const storeSnapshot = await getDoc(storeDocRef);
        if (!storeSnapshot.exists()) {
            storeNameEl.textContent = "Estabelecimento não encontrada!";
            return;
        }

        const storeData = storeSnapshot.data();
        storeWhatsappNumber = storeData.whatsapp;

        // --- Preenche as informações da loja ---
        document.title = `Todos os Produtos - ${storeData.nome}`;
        storeNameEl.textContent = `${storeData.nome}`;
        if (storeData.logoUrl) {
            storeLogoEl.src = storeData.logoUrl;
            storeLogoEl.style.display = 'block';
        }
        const generalMessage = encodeURIComponent('Olá! Gostaria de saber mais sobre os produtos.');
        whatsappLink.href = `https://wa.me/${storeWhatsappNumber}?text=${generalMessage}`;
        footerText.textContent = `© ${new Date().getFullYear()} ${storeData.nome}. Todos os direitos reservados.`;

        // --- Busca TODOS os produtos ---
        const productsRef = collection(db, 'lojas', storeId, 'produtos');
        const productsSnapshot = await getDocs(productsRef);

        allProductsData = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Ordena para que os promocionais apareçam primeiro
        allProductsData.sort((a, b) => b.isPromotional - a.isPromotional);

        renderProducts(allProductsData);

    } catch (error) {
        console.error('Erro ao carregar a página de produtos:', error);
        storeNameEl.textContent = "Erro ao carregar produtos";
    }
}

// --- Inicia o Carregamento ---
loadAllProductsPage();
