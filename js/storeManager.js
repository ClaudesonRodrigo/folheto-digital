import { db, storesRef } from './config.js';
import { getDocs, addDoc, updateDoc, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { getAuth, signOut } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { app } from './config.js'; // Precisamos importar o 'app'

// --- CONFIGURAÇÃO DO CLOUDINARY (Duplicado para este módulo) ---
const CLOUDINARY_CLOUD_NAME = "dhzzvc3vl";
const CLOUDINARY_UPLOAD_PRESET = "folheto-digital";
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// --- Variáveis Globais de Mercearias ---
const storeForm = document.getElementById('storeForm');
const storeTableBody = document.querySelector('#storeTable tbody');
const productSection = document.getElementById('productsSection');
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


let editingStoreId = null;

// --- FUNÇÃO DE UPLOAD (Reutilizada do productManager) ---
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

// --- Funções de Mercearias ---
async function loadStores() {
    storeTableBody.innerHTML = '';
    try {
        const snapshot = await getDocs(storesRef);
        snapshot.forEach(doc => {
            const store = doc.data();
            const row = document.createElement('tr');
            const flyerLink = `${window.location.origin}/folheto.html?id=${doc.id}`;
            row.innerHTML = `
                <td><img src="${store.logoUrl || ''}" alt="Logo" style="width: 50px; border-radius: 4px;"/> ${store.nome}</td>
                <td><a href="${flyerLink}" target="_blank">${flyerLink}</a></td>
                <td class="actions">
                    <button onclick="manageProducts('${doc.id}', '${store.nome}')">Gerenciar Produtos</button>
                    <button class="edit-btn" onclick='editStore("${doc.id}", "${store.nome}", ${JSON.stringify(store.endereco)}, "${store.whatsapp}", "${store.logoUrl || ''}")'>Editar</button>
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
    logoPreview.style.display = 'none';
    logoPreview.src = '';
    logoFileInput.value = '';
    document.getElementById('cancelStoreEdit').style.display = 'none';
    loadStores();
}

// --- Eventos e Funções Globais ---
storeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitButton = storeForm.querySelector('button[type="submit"]');
    submitButton.textContent = 'Salvando...';
    submitButton.disabled = true;

    // Lógica de Upload da Logo
    let logoUrl = logoUrlInput.value;
    const logoFile = logoFileInput.files[0];
    if (logoFile) {
        const newLogoUrl = await uploadImage(logoFile);
        if (newLogoUrl) logoUrl = newLogoUrl;
        else {
            submitButton.textContent = 'Salvar Mercearia';
            submitButton.disabled = false;
            return;
        }
    }

    if (!logoUrl) {
        alert('Por favor, adicione uma logo para a mercearia.');
        submitButton.textContent = 'Salvar Mercearia';
        submitButton.disabled = false;
        return;
    }

    const fullAddress = `${streetInput.value}, ${numberInput.value} - ${neighborhoodInput.value}, ${cityInput.value} - ${stateInput.value}`;
    const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`;

    const storeData = {
        nome: document.getElementById('storeName').value,
        whatsapp: '55' + document.getElementById('storeWhatsapp').value.replace(/\D/g, ''),
        logoUrl: logoUrl, 
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
    } finally {
        submitButton.textContent = 'Salvar Mercearia';
        submitButton.disabled = false;
    }
});

window.editStore = (id, nome, endereco, whatsapp, logoUrl) => {
    editingStoreId = id;
    document.getElementById('storeId').value = id;
    document.getElementById('storeName').value = nome;
    
    logoUrlInput.value = logoUrl;
    logoPreview.src = logoUrl;
    logoPreview.style.display = logoUrl ? 'block' : 'none';

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
    if (confirm('Tem certeza que deseja excluir esta mercearia?')) {
        try {
            await deleteDoc(doc(db, 'mercerias', id));
            loadStores();
            if (window.selectedStoreId === id) productSection.style.display = 'none';
        } catch (error) {
            console.error("Erro ao excluir mercearia:", error);
        }
    }
};
// --- LÓGICA DE LOGOUT ---


logoutButton.addEventListener('click', () => {
    signOut(auth).then(() => {
        // Logout bem-sucedido, redireciona para a página de login
        window.location.href = '/login.html';
    }).catch((error) => {
        console.error('Erro ao fazer logout:', error);
    });
});

document.getElementById('cancelStoreEdit').addEventListener('click', resetStoreForm);

// --- Inicialização ---
loadStores();