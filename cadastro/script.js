// Checa se usuário ta logado
const isLoggedIn = sessionStorage.getItem('isLoggedIn');
if (!isLoggedIn) {
    window.location.href = '../index.html';
}

// Elementos do formulário
const form = document.getElementById('volunteer-form');
const cepInput = document.getElementById('cep');
const cepStatus = document.getElementById('cep-status');
const streetInput = document.getElementById('street');
const neighborhoodInput = document.getElementById('neighborhood');
const cityInput = document.getElementById('city');
const stateInput = document.getElementById('state');

cepInput.addEventListener('input', (e) => {
    let cep = e.target.value;
    
    cep = cep.replace(/\D/g, '');
    
    e.target.value = cep;
    cepStatus.textContent = '';
    cepStatus.className = 'status-message';
    
    if (cep.length === 0) {
        clearAddressFields();
    }
    
    if (cep.length === 8) {
        cepStatus.textContent = 'Buscando endereço...';
        fetchAddressByCEP(cep);
    }
});

// Api de cep, busca endereço
function fetchAddressByCEP(cep) {
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao buscar o CEP');
            }
            return response.json();
        })
        .then(data => {
            if (data.erro) {
                cepStatus.textContent = 'CEP não encontrado';
                cepStatus.className = 'status-message error';
                clearAddressFields();
                return;
            }
            
            streetInput.value = data.logradouro;
            neighborhoodInput.value = data.bairro;
            cityInput.value = data.localidade;
            stateInput.value = data.uf;
            
            cepStatus.textContent = 'Endereço encontrado';
            cepStatus.className = 'status-message success';
        })
        .catch(error => {
            console.error('Error:', error);
            cepStatus.textContent = 'Erro ao buscar o endereço';
            cepStatus.className = 'status-message error';
            clearAddressFields();
        });
}

function clearAddressFields() {
    streetInput.value = '';
    neighborhoodInput.value = '';
    cityInput.value = '';
    stateInput.value = '';
}

// É o submit do form
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const message = document.getElementById('form-message');
    message.textContent = '';
    message.className = 'status-message';

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const cep = document.getElementById('cep').value;
    const street = document.getElementById('street').value;
    const number = document.getElementById('number').value;
    const complement = document.getElementById('complement').value;
    const neighborhood = document.getElementById('neighborhood').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;

    let volunteers = JSON.parse(localStorage.getItem('volunteers')) || [];

    const emailExists = volunteers.some(v => v.email.toLowerCase() === email.toLowerCase());

    if (emailExists) {
        message.textContent = 'Este e-mail já está cadastrado.';
        message.classList.add('error');
        return;
    }

    const randomImageNumber = Math.floor(Math.random() * 100);

    // Cria novo voluntário
    const volunteer = {
        id: Date.now().toString(),
        name,
        email,
        address: {
            cep,
            street,
            number,
            complement,
            neighborhood,
            city,
            state
        },
        photo: `https://randomuser.me/api/portraits/men/${randomImageNumber}.jpg`
    };

    volunteers.push(volunteer);
    localStorage.setItem('volunteers', JSON.stringify(volunteers));

    form.reset();
    clearAddressFields();

    message.textContent = 'Voluntário cadastrado com sucesso!';
    message.classList.add('success');

    setTimeout(() => {
        window.location.href = '../lista/index.html';
    }, 1500);
});

// Parte que faz inatividade
const INACTIVITY_LIMIT = 5 * 60 * 1000;

let inactivityTimer;

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        alert('Você foi redirecionado por inatividade.');
        window.location.href = '../index.html';
    }, INACTIVITY_LIMIT);
}

const activityEvents = ['mousemove', 'keydown', 'scroll', 'touchstart'];

activityEvents.forEach(event => {
    window.addEventListener(event, resetInactivityTimer, false);
});

resetInactivityTimer();

