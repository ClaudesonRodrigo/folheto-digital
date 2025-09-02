import { db, storesRef } from './config.js';
import { getDocs, addDoc, updateDoc, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

// --- Variáveis Globais de Mercearias ---
const storeForm = document.getElementById('storeForm');
const storeTableBody = document.querySelector('#storeTable tbody');
const productSection = document.getElementById('productsSection');

// --- Campos do Formulário de Endereço ---
const cepInput = document.getElementById('storeCep');
const streetInput = document.getElementById('storeStreet');
const numberInput = document.getElementById('storeNumber');
const neighborhoodInput = document.getElementById('storeNeighborhood');
const cityInput = document.getElementById('storeCity');
const stateInput = document.getElementById('storeState');

let editingStoreId = null;

// --- NOVA FUNÇÃO: Buscar Endereço pelo CEP ---
async function fetchAddressFromCep(cep) {
    // Limpa o CEP para conter apenas números
    const cleanCep = cep.replace(/\D/g, '');

    if (cleanCep.length !== 8) {
        return; // Não faz nada se o CEP não tiver 8 dígitos
    }

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();

        if (data.erro) {
            alert('CEP não encontrado. Por favor, verifique e tente novamente.');
            return;
        }

        // Preenche os campos do formulário com os dados da API
        streetInput.value = data.logradouro;
        neighborhoodInput.value = data.bairro;
        cityInput.value = data.localidade;
        stateInput.value = data.uf;

        // Foca no campo de número para o usuário preencher
        numberInput.focus();

    } catch (error) {
        console.error("Erro ao buscar CEP:", error);
        alert("Não foi possível buscar o CEP. Tente novamente.");
    }
}

// Adiciona o evento ao campo de CEP para acionar a busca
cepInput.addEventListener('blur', (event) => {
    fetchAddressFromCep(event.target.value);
});


// --- Funções de Mercearias (Atualizadas) ---
async function loadStores() {
    storeTableBody.innerHTML = '';
    try {
        const snapshot = await getDocs(storesRef);
        snapshot.forEach(doc => {
            const store = doc.data();
            const row = document.createElement('tr');
            const flyerLink = `${window.location.origin}/folheto.html?id=${doc.id}`;
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

function resetStoreForm() {
    storeForm.reset();
    editingStoreId = null;
    document.getElementById('cancelStoreEdit').style.display = 'none';
    loadStores();
}

// --- Eventos e Funções Globais (Atualizadas) ---
storeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Constrói o endereço completo para a URL do mapa
    const fullAddress = `${streetInput.value}, ${numberInput.value} - ${neighborhoodInput.value}, ${cityInput.value} - ${stateInput.value}`;
    const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`;

    // Salva os dados de forma estruturada
    const storeData = {
        nome: document.getElementById('storeName').value,
        whatsapp: '55' + document.getElementById('storeWhatsapp').value.replace(/\D/g, ''),
        endereco: {
            cep: cepInput.value,
            rua: streetInput.value,
            numero: numberInput.value,
            bairro: neighborhoodInput.value,
            cidade: cityInput.value,
            estado: stateInput.value
        },
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
    
    // Preenche todos os campos de endereço ao editar
    cepInput.value = endereco.cep || '';
    streetInput.value = endereco.rua || '';
    numberInput.value = endereco.numero || '';
    neighborhoodInput.value = endereco.bairro || '';
    cityInput.value = endereco.cidade || '';
    stateInput.value = endereco.estado || '';

    document.getElementById('storeWhatsapp').value = whatsapp.startsWith('55') ? whatsapp.substring(2) : whatsapp;
    document.getElementById('cancelStoreEdit').style.display = 'inline-block';
};

window.deleteStore = async (id) => {
    if (confirm('Tem certeza que deseja excluir esta mercearia e TODOS os seus produtos?')) {
        try {
            await deleteDoc(doc(db, 'mercerias', id));
            loadStores();
            if (window.selectedStoreId === id) { 
                productSection.style.display = 'none';
            }
        } catch (error) {
            console.error("Erro ao excluir mercearia:", error);
        }
    }
};

document.getElementById('cancelStoreEdit').addEventListener('click', resetStoreForm);

// --- Inicialização ---
loadStores();