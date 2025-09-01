import { db, productsRef } from './config.js';
import { getDocs, query, where, limit } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

const productList = document.getElementById('productList');

// Carregar apenas produtos promocionais (até 8)
async function loadPromotionalProducts() {
    try {
        productList.innerHTML = ''; // Limpa a lista
        const q = query(productsRef, where('isPromotional', '==', true), limit(8));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            productList.innerHTML = '<p>Nenhum produto promocional disponível no momento.</p>';
            return;
        }

        snapshot.forEach(doc => {
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
        console.error('Erro ao carregar produtos:', error);
    }
}

// Carregar produtos ao iniciar
loadPromotionalProducts();
