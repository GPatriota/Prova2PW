const isLoggedIn = sessionStorage.getItem('isLoggedIn');
const logoutBtn = document.getElementById('logout-btn');

if (logoutBtn) {
  logoutBtn.addEventListener('click', e => {
    e.preventDefault();
    sessionStorage.removeItem('isLoggedIn');
    window.location.href = '/index.html';
  });
}

if (!isLoggedIn && !window.location.pathname.endsWith('index.html')) {
  window.location.href = '/index.html';
}

// ===== Usuário fixo =====
const fixedUser = {
  username: 'admin',
  password: 'admin'
};

// funcoes que leem o localstorage
function getRegisteredUsers() {
  const users = localStorage.getItem('registeredUsers');
  return users ? JSON.parse(users) : [];
}

function saveRegisteredUsers(users) {
  localStorage.setItem('registeredUsers', JSON.stringify(users));
}

// ===== Login =====
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (username === fixedUser.username && password === fixedUser.password) {
      sessionStorage.setItem('isLoggedIn', 'true');
      window.location.href = 'cadastro/index.html';
      return;
    }

    const users = getRegisteredUsers();
    const found = users.find(u => u.username === username && u.password === password);

    if (found) {
      sessionStorage.setItem('isLoggedIn', 'true');
      window.location.href = 'cadastro/index.html';
    } else {
      loginError.textContent = 'Usuário ou senha inválidos';
      setTimeout(() => loginError.textContent = '', 3000);
    }
  });
}

const registerForm = document.getElementById('register-form');
const registerError = document.getElementById('register-error');
const registerSuccess = document.getElementById('register-success');

if (registerForm) {
  registerForm.addEventListener('submit', e => {
    e.preventDefault();
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const cep = document.getElementById('register-cep').value;
    const street = document.getElementById('register-street').value;
    const city = document.getElementById('register-city').value;

    if (!username || !password || !confirmPassword) {
      registerError.textContent = 'Todos os campos são obrigatórios.';
      clearMessages();
      return;
    }

    if (password !== confirmPassword) {
      registerError.textContent = 'As senhas não conferem.';
      clearMessages();
      return;
    }

    if (username === fixedUser.username) {
      registerError.textContent = 'Este nome de usuário já está em uso.';
      clearMessages();
      return;
    }

    const users = getRegisteredUsers();
    if (users.some(u => u.username === username)) {
      registerError.textContent = 'Este nome de usuário já está cadastrado.';
      clearMessages();
      return;
    }

    users.push({
      username,
      password,
      address: { cep, street, city }
    });
    saveRegisteredUsers(users);

    registerSuccess.textContent = 'Cadastro realizado com sucesso! Você já pode fazer login.';
    registerError.textContent = '';
    registerForm.reset();
    clearAddressFields();
    clearMessages();
  });
}

function clearMessages() {
  setTimeout(() => {
    if (registerError) registerError.textContent = '';
    if (registerSuccess) registerSuccess.textContent = '';
  }, 3000);
}

const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const switchLinks = document.querySelectorAll('.switch-tab-link');

function switchTab(tabName) {
  tabButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabName));
  tabContents.forEach(tc => tc.classList.toggle('active', tc.id === 'tab-' + tabName));
}

tabButtons.forEach(button => {
  button.addEventListener('click', () => switchTab(button.dataset.tab));
});

switchLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    switchTab(link.dataset.tab);
  });
});

const cepInput = document.getElementById('register-cep');
const streetInput = document.getElementById('register-street');
const cityInput = document.getElementById('register-city');
const cepStatus = document.getElementById('cep-status');

if (cepInput) {
  cepInput.addEventListener('input', e => {
    let cep = e.target.value.replace(/\D/g, '');
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
}

function fetchAddressByCEP(cep) {
  fetch(`https://viacep.com.br/ws/${cep}/json/`)
    .then(res => {
      if (!res.ok) throw new Error('Erro ao buscar o CEP');
      return res.json();
    })
    .then(data => {
      if (data.erro) {
        cepStatus.textContent = 'CEP não encontrado';
        cepStatus.className = 'status-message error';
        clearAddressFields();
        return;
      }

      streetInput.value = data.logradouro;
      cityInput.value = data.localidade;
      cepStatus.textContent = 'Endereço encontrado';
      cepStatus.className = 'status-message success';
    })
    .catch(() => {
      cepStatus.textContent = 'Erro ao buscar o endereço';
      cepStatus.className = 'status-message error';
      clearAddressFields();
    });
}

function clearAddressFields() {
  if (streetInput) streetInput.value = '';
  if (cityInput) cityInput.value = '';
}
