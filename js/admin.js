import { db, storesRef } from './config.js';
import { getDocs, addDoc, updateDoc, deleteDoc, doc, collection, query, getDoc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

// --- CONFIGURAÇÃO DO CLOUDINARY ---
// PREENCHA COM AS SUAS INFORMAÇÕES!
const CLOUDINARY_CLOUD_NAME = "dhzvc3vl";          // SEU CLOUD NAME
const CLOUDINARY_UPLOAD_PRESET = "folheto-digital"; // SEU UPLOAD PRESET
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;


// --- Variáveis Globais ---
const storeForm = document.getElementById('storeForm');
const storeTableBody = document.querySelector('#storeTable tbody');
const productSection = document.getElementById('productsSection');
const productForm = document.getElementById('productForm');
const productTableBody = document.querySelector('#productTable tbody');
const selectedStoreNameEl = document.getElementById('selectedStoreName');
const imagePreview = document.getElementById('imagePreview');
const imageFileInput = document.getElementById('imageFile');

let editingStoreId = null;
let editingProductId = null;
let selectedStoreId = null; 

// --- Funções de Mercearia (permanecem as mesmas) ---
async function loadStores() {
    storeTableBody.innerHTML = '';
    try {
        const snapshot = await getDocs(storesRef);
        snapshot.forEach(doc => {
            const store = doc.data();
            const row = document.createElement('tr');
            const flyerLink = `${window.location.origin}/index.html?id=${doc.id}`;
            row.innerHTML = `
                <td>${store.nome}</td>
                <td><a href="${flyerLink}" target="_blank">${flyerLink}</a></td>
                <td class="actions">
                    <button onclick="manageProducts('${doc.id}', '${store.nome}')">Gerenciar Produtos</button>
                    <button class="edit-btn" onclick='editStore("${doc.id}", "${store.nome}", ${JSON.stringify(store.endereco)}, "${store.whatsapp}")'>Editar</button>
                    <button class="delete-btn" onclick="deleteStore('${doc.id}')">Excluir</button>
                </td>
            `;
            storeTableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Erro ao carregar mercearias:", error);
    }
}

storeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const streetAddress = document.getElementById('storeAddress').value;
    const cityState = document.getElementById('storeCityState').value;
    const fullAddress = `${streetAddress}, ${cityState}`;
    const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`;
    const storeData = {
        nome: document.getElementById('storeName').value,
        whatsapp: '55' + document.getElementById('storeWhatsapp').value.replace(/\D/g, ''),
        endereco: { rua: streetAddress, cidade: cityState },
        localizacao: mapUrl
    };

    try {
        if (editingStoreId) {
            await updateDoc(doc(db, 'mercerias', editingStoreId), storeData);
        } else {
            await addDoc(storesRef, storeData);
        }
        resetStoreForm();
    } catch (error) {
        console.error("Erro ao salvar mercearia:", error);
    }
});

window.editStore = (id, nome, endereco, whatsapp) => {
    editingStoreId = id;
    document.getElementById('storeId').value = id;
    document.getElementById('storeName').value = nome;
    document.getElementById('storeAddress').value = endereco.rua;
    document.getElementById('storeCityState').value = endereco.cidade;
    document.getElementById('storeWhatsapp').value = whatsapp.startsWith('55') ? whatsapp.substring(2) : whatsapp;
    document.getElementById('cancelStoreEdit').style.display = 'inline-block';
};

window.deleteStore = async (id) => {
    if (confirm('Tem certeza que deseja excluir esta mercearia e TODOS os seus produtos?')) {
        try {
            await deleteDoc(doc(db, 'mercerias', id));
            loadStores();
            if (selectedStoreId === id) {
                productSection.style.display = 'none';
                selectedStoreId = null;
            }
        } catch (error) {
            console.error("Erro ao excluir mercearia:", error);
        }
    }
};

function resetStoreForm() {
    storeForm.reset();
    editingStoreId = null;
    document.getElementById('cancelStoreEdit').style.display = 'none';
    loadStores();
}
document.getElementById('cancelStoreEdit').addEventListener('click', resetStoreForm);


// --- Funções de Produtos (AGORA COM UPLOAD) ---

// Função para fazer o upload da imagem para o Cloudinary
async function uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
        const response = await fetch(CLOUDINARY_URL, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (data.secure_url) {
            return data.secure_url;
        } else {
            // Adicionando mais detalhes ao erro
            console.error('Resposta do Cloudinary:', data);
            throw new Error('Falha no upload da imagem. Resposta do servidor não contém URL segura.');
        }
    } catch (error) {
        console.error('Erro no upload:', error);
        alert('Ocorreu um erro ao enviar a imagem.');
        return null;
    }
}


productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!selectedStoreId) {
        alert("Por favor, selecione uma mercearia primeiro.");
        return;
    }
    
    const submitButton = productForm.querySelector('button[type="submit"]');
    submitButton.textContent = 'Salvando...';
    submitButton.disabled = true;

    let imageUrl = document.getElementById('imageUrl').value;
    const imageFile = imageFileInput.files[0];

    if (imageFile) {
        const newImageUrl = await uploadImage(imageFile);
        if (newImageUrl) {
            imageUrl = newImageUrl;
        } else {
            submitButton.textContent = 'Salvar Produto';
            submitButton.disabled = false;
            return; 
        }
    }
    
    if (!imageUrl) {
        alert('Por favor, selecione uma imagem para o produto.');
        submitButton.textContent = 'Salvar Produto';
        submitButton.disabled = false;
        return;
    }

    const productData = {
        name: document.getElementById('name').value,
        description: document.getElementById('description').value,
        price: parseFloat(document.getElementById('price').value),
        isPromotional: document.getElementById('isPromotional').checked,
        imageUrl: imageUrl
    };

    try {
        const productsRef = collection(db, 'mercerias', selectedStoreId, 'produtos');
        if (editingProductId) {
            await updateDoc(doc(productsRef, editingProductId), productData);
        } else {
            await addDoc(productsRef, productData);
        }
        resetProductForm();
    } catch (error) {
        console.error('Erro ao salvar produto:', error);
    } finally {
        submitButton.textContent = 'Salvar Produto';
        submitButton.disabled = false;
    }
});


window.editProduct = (product) => {
    editingProductId = product.id;
    document.getElementById('productId').value = product.id;
    document.getElementById('name').value = product.name;
    document.getElementById('description').value = product.description;
    document.getElementById('price').value = product.price;
    document.getElementById('isPromotional').checked = product.isPromotional;
    
    document.getElementById('imageUrl').value = product.imageUrl;
    imagePreview.src = product.imageUrl;
    imagePreview.style.display = 'block';

    document.getElementById('cancelProductEdit').style.display = 'inline-block';
    window.scrollTo(0, productSection.offsetTop);
};


function resetProductForm() {
    productForm.reset();
    editingProductId = null;
    imagePreview.style.display = 'none';
    imagePreview.src = '';
    imageFileInput.value = '';
    document.getElementById('cancelProductEdit').style.display = 'none';
    loadProducts();
}
document.getElementById('cancelProductEdit').addEventListener('click', resetProductForm);


// As funções abaixo não precisam de alteração
window.manageProducts = async (storeId, storeName) => {
    selectedStoreId = storeId;
    selectedStoreNameEl.textContent = `Gerenciando Produtos para: ${storeName}`;
    productSection.style.display = 'block';
    loadProducts();
};

async function loadProducts() {
    if (!selectedStoreId) return;
    productTableBody.innerHTML = '';
    try {
        const productsRef = collection(db, 'mercerias', selectedStoreId, 'produtos');
        const snapshot = await getDocs(productsRef);
        snapshot.forEach(doc => {
            const data = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${data.name}</td>
                <td>${data.description}</td>
                <td>R$ ${data.price.toFixed(2)}</td>
                <td><img src="${data.imageUrl}" alt="${data.name}" style="width:50px;"></td>
                <td>${data.isPromotional ? 'Sim' : 'Não'}</td>
                <td class="actions">
                    <button class="edit-btn" onclick='editProduct(${JSON.stringify({id: doc.id, ...data})})'>Editar</button>
                    <button class="delete-btn" onclick="deleteProduct('${doc.id}')">Excluir</button>
                </td>
            `;
            productTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    }
}

window.deleteProduct = async (productId) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        try {
            const productDocRef = doc(db, 'mercerias', selectedStoreId, 'produtos', productId);
            await deleteDoc(productDocRef);
            loadProducts();
        } catch (error) {
            console.error('Erro ao excluir produto:', error);
        }
    }
};

// --- Inicialização ---
loadStores();