import { db } from './config.js';
// Renomeamos a referência para 'lojas', que é mais genérico
import { getDocs, addDoc, updateDoc, deleteDoc, doc, collection } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { getAuth, signOut } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { app } from './config.js';

const storesRef = collection(db, 'lojas'); // Usando a coleção mais genérica 'lojas'

// --- CONFIGURAÇÃO DO CLOUDINARY ---
const CLOUDINARY_CLOUD_NAME = "dhzzvc3vl";
const CLOUDINARY_UPLOAD_PRESET = "folheto-digital";
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// --- Variáveis Globais ---
const storeForm = document.getElementById('storeForm');
const storeTableBody = document.querySelector('#storeTable tbody');
const auth = getAuth(app);
const logoutButton = document.getElementById('logoutButton');

// --- Campos do Formulário ---
const cepInput = document.getElementById('storeCep');
const streetInput = document.getElementById('storeStreet');
const numberInput = document.getElementById('storeNumber');
const neighborhoodInput = document.getElementById('storeNeighborhood');
const cityInput = document.getElementById('storeCity');
const stateInput = document.getElementById('storeState');
const logoFileInput = document.getElementById('storeLogoFile');
const logoPreview = document.getElementById('logoPreview');
const logoUrlInput = document.getElementById('storeLogoUrl');
const segmentSelect = document.getElementById('storeSegment'); // Novo campo

let editingStoreId = null;

// --- FUNÇÃO DE UPLOAD ---
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
            throw new Error('Falha no upload da imagem.');
        }
    } catch (error) {
        console.error('Erro no upload:', error);
        alert('Ocorreu um erro ao enviar a imagem.');
        return null;
    }
}

// --- Funções de Endereço (CEP) ---
async function fetchAddressFromCep(cep) {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        if (data.erro) return alert('CEP não encontrado.');
        streetInput.value = data.logradouro;
        neighborhoodInput.value = data.bairro;
        cityInput.value = data.localidade;
        stateInput.value = data.uf;
        numberInput.focus();
    } catch (error) {
        console.error("Erro ao buscar CEP:", error);
    }
}
cepInput.addEventListener('blur', (event) => fetchAddressFromCep(event.target.value));

// --- Funções de Lojas ---
async function loadStores() {
    storeTableBody.innerHTML = '';
    try {
        const snapshot = await getDocs(storesRef);
        snapshot.forEach(doc => {
            const store = doc.data();
            const row = document.createElement('tr');
            const flyerLink = `${window.location.origin}/folheto.html?id=${doc.id}`;
            
            // Escapando o objeto store para ser usado no HTML
            const storeDataString = JSON.stringify(store).replace(/"/g, '&quot;');

            row.innerHTML = `
                <td><img src="${store.logoUrl || ''}" alt="Logo" style="width: 50px; border-radius: 4px;"/> ${store.nome}</td>
                <td><a href="${flyerLink}" target="_blank">${flyerLink}</a></td>
                <td class="actions">
                    <button class="manage-btn" onclick="manageProducts('${doc.id}', '${store.nome}')">Gerenciar Itens</button>
                    <button class="edit-btn" onclick='editStore("${doc.id}", ${storeDataString})'>Editar</button>
                    <button class="delete-btn" onclick="deleteStore('${doc.id}')">Excluir</button>
                </td>
            `;
            storeTableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Erro ao carregar lojas:", error);
    }
}

function resetStoreForm() {
    storeForm.reset();
    editingStoreId = null;
    logoPreview.style.display = 'none';
    logoPreview.src = '';
    logoFileInput.value = '';
    document.getElementById('cancelStoreEdit').style.display = 'none';
}

// --- Eventos e Funções Globais ---
storeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitButton = storeForm.querySelector('button[type="submit"]');
    submitButton.textContent = 'Salvando...';
    submitButton.disabled = true;

    let logoUrl = logoUrlInput.value;
    const logoFile = logoFileInput.files[0];
    if (logoFile) {
        const newLogoUrl = await uploadImage(logoFile);
        if (newLogoUrl) {
            logoUrl = newLogoUrl;
        } else {
            submitButton.textContent = 'Salvar Loja';
            submitButton.disabled = false;
            return;
        }
    }

    if (!logoUrl) {
        alert('Por favor, adicione uma logo para a loja.');
        submitButton.textContent = 'Salvar Loja';
        submitButton.disabled = false;
        return;
    }

    const fullAddress = `${streetInput.value}, ${numberInput.value} - ${neighborhoodInput.value}, ${cityInput.value} - ${stateInput.value}`;
    const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`;

    const storeData = {
        nome: document.getElementById('storeName').value,
        whatsapp: '55' + document.getElementById('storeWhatsapp').value.replace(/\D/g, ''),
        logoUrl: logoUrl, 
        segmento: segmentSelect.value, // Salvando o segmento
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
            await updateDoc(doc(db, 'lojas', editingStoreId), storeData);
        } else {
            await addDoc(storesRef, storeData);
        }
        resetStoreForm();
        loadStores(); // Recarrega a lista após salvar
    } catch (error) {
        console.error("Erro ao salvar loja:", error);
    } finally {
        submitButton.textContent = 'Salvar Loja';
        submitButton.disabled = false;
    }
});

// FUNÇÃO CORRIGIDA
window.editStore = (id, storeData) => {
    editingStoreId = id;
    document.getElementById('storeId').value = id;
    document.getElementById('storeName').value = storeData.nome;
    
    logoUrlInput.value = storeData.logoUrl;
    logoPreview.src = storeData.logoUrl;
    logoPreview.style.display = storeData.logoUrl ? 'block' : 'none';

    // Preenche o segmento
    segmentSelect.value = storeData.segmento || '';

    // Preenche o endereço
    const endereco = storeData.endereco || {};
    cepInput.value = endereco.cep || '';
    streetInput.value = endereco.rua || '';
    numberInput.value = endereco.numero || '';
    neighborhoodInput.value = endereco.bairro || '';
    cityInput.value = endereco.cidade || '';
    stateInput.value = endereco.estado || '';

    const whatsapp = storeData.whatsapp || '';
    document.getElementById('storeWhatsapp').value = whatsapp.startsWith('55') ? whatsapp.substring(2) : whatsapp;
    
    document.getElementById('cancelStoreEdit').style.display = 'inline-block';
    storeForm.scrollIntoView({ behavior: 'smooth' }); // Rola a tela para o formulário
};

window.deleteStore = async (id) => {
    if (confirm('Tem certeza que deseja excluir esta loja e todos os seus itens?')) {
        try {
            await deleteDoc(doc(db, 'lojas', id));
            loadStores();
            // Esconde a seção de produtos se a loja excluída era a selecionada
            const managementWrapper = document.getElementById('managementWrapper');
            if (window.selectedStoreId === id) {
                managementWrapper.style.display = 'none';
            }
        } catch (error) {
            console.error("Erro ao excluir loja:", error);
        }
    }
};

logoutButton.addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = '/login.html';
    }).catch((error) => {
        console.error('Erro ao fazer logout:', error);
    });
});

document.getElementById('cancelStoreEdit').addEventListener('click', resetStoreForm);

// --- Inicialização ---
loadStores();

