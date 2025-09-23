import { db } from './config.js';
import { getDocs, addDoc, updateDoc, deleteDoc, doc, collection } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { initCategoryManager } from './categoryManager.js';

// --- CONFIGURAÇÃO DO CLOUDINARY ---
const CLOUDINARY_CLOUD_NAME = "dhzzvc3vl";
const CLOUDINARY_UPLOAD_PRESET = "folheto-digital";
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// --- Variáveis Globais de Produtos ---
const productSection = document.getElementById('productsSection');
const productForm = document.getElementById('productForm');
const productTableBody = document.querySelector('#productTable tbody');
const selectedStoreNameEl = document.getElementById('selectedStoreName');
const imagePreview = document.getElementById('imagePreview');
const imageFileInput = document.getElementById('imageFile');
const managementWrapper = document.getElementById('managementWrapper');

let editingProductId = null;
let selectedStoreId = null; 

// --- Funções de Upload ---
async function uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    try {
        const response = await fetch(CLOUDINARY_URL, { method: 'POST', body: formData });
        const data = await response.json();
        if (data.secure_url) {
            return data.secure_url;
        } else {
            console.error('Resposta do Cloudinary:', data);
            throw new Error('Falha no upload da imagem.');
        }
    } catch (error) {
        console.error('Erro no upload:', error);
        alert('Ocorreu um erro ao enviar a imagem.');
        return null;
    }
}

// --- Funções de Produtos ---
async function loadProducts() {
    if (!selectedStoreId) return;
    productTableBody.innerHTML = '';
    try {
        const productsRef = collection(db, 'lojas', selectedStoreId, 'produtos');
        const snapshot = await getDocs(productsRef);
        snapshot.forEach(doc => {
            const data = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${data.name}</td>
                <td>${data.description}</td>
                <td>R$ ${data.price.toFixed(2)}</td>
                <td>${data.categoryName || 'Sem Categoria'}</td>
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

function resetProductForm() {
    productForm.reset();
    editingProductId = null;
    imagePreview.style.display = 'none';
    imagePreview.src = '';
    imageFileInput.value = '';
    document.getElementById('cancelProductEdit').style.display = 'none';
    loadProducts();
}

// --- Eventos e Funções Globais de Produtos ---
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!selectedStoreId) return alert("Por favor, selecione uma loja primeiro.");
    
    const submitButton = productForm.querySelector('button[type="submit"]');
    submitButton.textContent = 'Salvando...';
    submitButton.disabled = true;

    let imageUrl = document.getElementById('imageUrl').value;
    const imageFile = imageFileInput.files[0];

    if (imageFile) {
        const newImageUrl = await uploadImage(imageFile);
        if (newImageUrl) imageUrl = newImageUrl;
        else {
            submitButton.textContent = 'Salvar Item';
            submitButton.disabled = false;
            return; 
        }
    }
    
    if (!imageUrl) {
        alert('Por favor, selecione uma imagem para o item.');
        submitButton.textContent = 'Salvar Item';
        submitButton.disabled = false;
        return;
    }

    const categorySelect = document.getElementById('productCategory');
    const selectedCategoryOption = categorySelect.options[categorySelect.selectedIndex];

    const productData = {
        name: document.getElementById('name').value,
        description: document.getElementById('description').value,
        price: parseFloat(document.getElementById('price').value),
        isPromotional: document.getElementById('isPromotional').checked,
        imageUrl: imageUrl,
        categoryId: selectedCategoryOption.value,
        categoryName: selectedCategoryOption.textContent
    };

    try {
        const productsRef = collection(db, 'lojas', selectedStoreId, 'produtos');
        if (editingProductId) {
            await updateDoc(doc(productsRef, editingProductId), productData);
        } else {
            await addDoc(productsRef, productData);
        }
        resetProductForm();
    } catch (error) {
        console.error('Erro ao salvar produto:', error);
    } finally {
        submitButton.textContent = 'Salvar Item';
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
    document.getElementById('productCategory').value = product.categoryId || '';
    imagePreview.src = product.imageUrl;
    imagePreview.style.display = 'block';
    document.getElementById('cancelProductEdit').style.display = 'inline-block';
    window.scrollTo(0, productSection.offsetTop);
};

window.deleteProduct = async (productId) => {
    if (confirm('Tem certeza que deseja excluir este item?')) {
        try {
            const productDocRef = doc(db, 'mercerias', selectedStoreId, 'produtos', productId);
            await deleteDoc(productDocRef);
            loadProducts();
        } catch (error) {
            console.error('Erro ao excluir produto:', error);
        }
    }
};

window.manageProducts = (storeId, storeName) => {
    selectedStoreId = storeId;
    
    // Mostra o container principal
    managementWrapper.style.display = 'block';

    // Define os títulos
    selectedStoreNameEl.textContent = `Gerenciando Itens para: ${storeName}`;
    document.getElementById('selectedStoreNameForCategories').textContent = `Gerenciando Categorias para: ${storeName}`;

    // Carrega os dados
    loadProducts();
    initCategoryManager(storeId);

    // Rola a tela para a área de gerenciamento
    managementWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

document.getElementById('cancelProductEdit').addEventListener('click', resetProductForm);

