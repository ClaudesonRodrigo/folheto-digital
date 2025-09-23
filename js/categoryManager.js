import { db } from './config.js';
import { getDocs, addDoc, deleteDoc, doc, collection, query, where } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

// --- Variáveis Globais de Categorias ---
const categoryForm = document.getElementById('categoryForm');
const categoryTableBody = document.querySelector('#categoryTable tbody');

let selectedStoreIdForCategories = null;

// --- Funções de Categorias ---

// Carrega e exibe as categorias na tabela
async function loadCategories() {
    if (!selectedStoreIdForCategories) return;
    categoryTableBody.innerHTML = '';
    const categoriesRef = collection(db, 'lojas', selectedStoreIdForCategories, 'categorias');
    try {
        const snapshot = await getDocs(categoriesRef);
        snapshot.forEach(doc => {
            const category = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${category.name}</td>
                <td class="actions">
                    <button class="delete-btn" onclick="deleteCategory('${doc.id}', '${category.name}')">Excluir</button>
                </td>
            `;
            categoryTableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Erro ao carregar categorias:", error);
    }
}

// Popula o dropdown de categorias no formulário de produto
async function populateCategoryDropdown() {
    if (!selectedStoreIdForCategories) return;
    const categorySelect = document.getElementById('productCategory');
    if (!categorySelect) return;
    
    categorySelect.innerHTML = '<option value="">-- Carregando Categorias... --</option>';
    const categoriesRef = collection(db, 'lojas', selectedStoreIdForCategories, 'categorias');
    
    try {
        const snapshot = await getDocs(categoriesRef);
        if (snapshot.empty) {
            categorySelect.innerHTML = '<option value="">-- Nenhuma categoria cadastrada --</option>';
            return;
        }

        categorySelect.innerHTML = '<option value="">-- Selecione uma Categoria --</option>';
        snapshot.forEach(doc => {
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = doc.data().name;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao popular dropdown de categorias:", error);
        categorySelect.innerHTML = '<option value="">-- Erro ao carregar --</option>';
    }
}

// Salva uma nova categoria
categoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!selectedStoreIdForCategories) return alert("Selecione uma loja primeiro.");

    const categoryNameInput = document.getElementById('categoryName');
    const categoryName = categoryNameInput.value.trim();
    if (!categoryName) return;

    const categoryData = { name: categoryName };
    const categoriesRef = collection(db, 'lojas', selectedStoreIdForCategories, 'categorias');

    try {
        await addDoc(categoriesRef, categoryData);
        categoryForm.reset();
        await loadCategories();
        await populateCategoryDropdown();
    } catch (error) {
        console.error("Erro ao salvar categoria:", error);
    }
});

// Exclui uma categoria
window.deleteCategory = async (categoryId, categoryName) => {
    if (!selectedStoreIdForCategories) return;
    
    // --- CORREÇÃO APLICADA AQUI ---
    // Em vez de 'getCountFromServer', usamos 'getDocs' e pegamos o tamanho do resultado.
    const productsRef = collection(db, 'lojas', selectedStoreIdForCategories, 'produtos');
    const q = query(productsRef, where("categoryId", "==", categoryId));
    
    const productsSnapshot = await getDocs(q);
    const productCount = productsSnapshot.size; // Usamos .size para contar

    if (productCount > 0) {
        alert(`Não é possível excluir a categoria "${categoryName}" pois ela está sendo usada por ${productCount} item(ns).`);
        return;
    }

    if (confirm(`Tem certeza que deseja excluir a categoria "${categoryName}"?`)) {
        try {
            const categoryDocRef = doc(db, 'mercerias', selectedStoreIdForCategories, 'categorias', categoryId);
            await deleteDoc(categoryDocRef);
            await loadCategories();
            await populateCategoryDropdown();
        } catch (error) {
            console.error('Erro ao excluir categoria:', error);
        }
    }
};

// Função de inicialização
export function initCategoryManager(storeId) {
    selectedStoreIdForCategories = storeId;
    loadCategories();
    populateCategoryDropdown();
}

