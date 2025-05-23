// Checa se usuario ta logado
const isLoggedIn = sessionStorage.getItem('isLoggedIn');
if (!isLoggedIn) {
    window.location.href = '../index.html';
}

// Elementos
const volunteersContainer = document.getElementById('volunteers-container');
const searchInput = document.getElementById('search-input');
const clearAllBtn = document.getElementById('clear-all-btn');
const volunteerCount = document.getElementById('volunteer-count');

// Le os voluntarios do site
let volunteers = JSON.parse(localStorage.getItem('volunteers')) || [];

function displayVolunteers(volunteersToDisplay) {
    updateVolunteerCount(volunteersToDisplay.length);
    
    volunteersContainer.innerHTML = '';
    
    if (volunteersToDisplay.length === 0) {
        volunteersContainer.innerHTML = `
            <div class="empty-state">
                <img src="../assets/empty.png" alt="Sem voluntários">
                <p>Nenhum voluntário cadastrado</p>
                <a href="../cadastro/index.html" class="btn-primary">Cadastrar Agora</a>
            </div>
        `;
        return;
    }
    
    volunteersToDisplay.forEach(volunteer => {
        const card = createVolunteerCard(volunteer);
        volunteersContainer.appendChild(card);
    });
}

// cria o card no html manipulando o DOM
function createVolunteerCard(volunteer) {
    const card = document.createElement('div');
    card.className = 'volunteer-card';
    card.dataset.id = volunteer.id;
    
    const address = volunteer.address;
    const fullAddress = `${address.street}, ${address.number}${address.complement ? `, ${address.complement}` : ''}, ${address.neighborhood}, ${address.city}/${address.state} - CEP: ${address.cep}`;
    
    card.innerHTML = `
        <div class="card-header">
            <div class="profile-pic">
                <img src="${volunteer.photo}" alt="${volunteer.name}">
            </div>
            <h3>${volunteer.name}</h3>
        </div>
        <div class="card-content">
            <div class="info-group">
                <div class="info-label">E-mail</div>
                <div class="info-value">${volunteer.email}</div>
            </div>
            <div class="info-group">
                <div class="info-label">Endereço</div>
                <div class="info-value">${fullAddress}</div>
            </div>
        </div>
        <div class="card-actions">
            <button class="btn-delete" data-id="${volunteer.id}">Excluir</button>
        </div>
    `;
    
    return card;
}

function updateVolunteerCount(count) {
    volunteerCount.textContent = count === 1 
        ? '1 voluntário encontrado' 
        : `${count} voluntários encontrados`;
}

function deleteVolunteer(id) {
    volunteers = volunteers.filter(volunteer => volunteer.id !== id);
    
    localStorage.setItem('volunteers', JSON.stringify(volunteers));
    
    const searchTerm = searchInput.value.toLowerCase();
    const filteredVolunteers = filterVolunteers(searchTerm);
    displayVolunteers(filteredVolunteers);
}

// Funcao que faz filtro de voluntario
function filterVolunteers(searchTerm) {
    if (!searchTerm) {
        return volunteers;
    }
    
    return volunteers.filter(volunteer => 
        volunteer.name.toLowerCase().includes(searchTerm)
    );
}

displayVolunteers(volunteers);

searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredVolunteers = filterVolunteers(searchTerm);
    displayVolunteers(filteredVolunteers);
});

volunteersContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-delete')) {
        const id = e.target.dataset.id;
        
        if (confirm('Tem certeza que deseja excluir este voluntário?')) {
            deleteVolunteer(id);
        }
    }
});

clearAllBtn.addEventListener('click', () => {
    if (volunteers.length === 0) {
        alert('Não há voluntários para excluir.');
        return;
    }
    
    if (confirm('Tem certeza que deseja excluir TODOS os voluntários? Esta ação não pode ser desfeita.')) {
        volunteers = [];
        localStorage.setItem('volunteers', JSON.stringify(volunteers));
        
        searchInput.value = '';
        displayVolunteers(volunteers);
    }
});

//parte que faz inatividade
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

