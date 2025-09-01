import { db, productsRef } from './config.js';
import { getDocs, addDoc, updateDoc, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

const form = document.getElementById('productForm');
const tableBody = document.querySelector('#productTable tbody');
const cancelEdit = document.getElementById('cancelEdit');
let editingId = null;

// Função para carregar produtos
async function loadProducts() {
    try {
        tableBody.innerHTML = '';
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
                    <button class="edit-btn" onclick="editProduct('${doc.id}', '${data.name}', '${data.description}', ${data.price}, '${data.imageUrl}', ${data.isPromotional})">Editar</button>
                    <button class="delete-btn" onclick="deleteProduct('${doc.id}')">Excluir</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    }
}

// Adicionar ou atualizar produto
form.addEventListener('submit', async e => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const description = document.getElementById('description').value;
    const price = parseFloat(document.getElementById('price').value);
    const imageUrl = document.getElementById('imageUrl').value;
    const isPromotional = document.getElementById('isPromotional').checked;

    try {
        if (editingId) {
            const productDoc = doc(db, 'products', editingId);
            await updateDoc(productDoc, { name, description, price, imageUrl, isPromotional });
        } else {
            await addDoc(productsRef, { name, description, price, imageUrl, isPromotional });
        }
        resetForm();
    } catch (error) {
        console.error('Erro ao salvar produto:', error);
    }
});

// Editar produto
window.editProduct = function(id, name, description, price, imageUrl, isPromotional) {
    editingId = id;
    document.getElementById('name').value = name;
    document.getElementById('description').value = description;
    document.getElementById('price').value = price;
    document.getElementById('imageUrl').value = imageUrl;
    document.getElementById('isPromotional').checked = isPromotional;
    cancelEdit.style.display = 'block';
};

// Excluir produto
window.deleteProduct = async function(id) {
    if (confirm('Tem certeza que deseja excluir?')) {
        try {
            const productDoc = doc(db, 'products', id);
            await deleteDoc(productDoc);
            loadProducts();
        } catch (error) {
            console.error('Erro ao excluir:', error);
        }
    }
};

// Resetar formulário
function resetForm() {
    form.reset();
    editingId = null;
    cancelEdit.style.display = 'none';
    loadProducts();
}

cancelEdit.addEventListener('click', resetForm);

// Carregar produtos iniciais
loadProducts();