const DEFAULT_PASSWORD = '123456';


const ROLE_LABEL = {
  admin: 'Administrador',
  pharmacist: 'Farmacêutico',
  doctor: 'Médico',
  nurse: 'Enfermeiro',
  technician: 'Técnico',
};

function getRoleLabel(role) {
  return ROLE_LABEL[role] || role || 'Usuário';
}

function getLandingPageByRole(role) {
  // admin → Gestão de Usuários; outros → Registro de Medicamentos
  return role === 'admin' ? 'usuarios.html' : 'medicamentos.html';
}

// Se já existe sessão ativa, direciona para a tela destino
if (Auth.getSession()) {
  const session = Auth.getSession();
  const isAdmin = String(session?.cargo || '').toLowerCase().includes('admin');
  window.location.href = isAdmin ? 'usuarios.html' : 'medicamentos.html';
}


const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('senha');
const emailError = document.getElementById('email-error');
const passwordError = document.getElementById('senha-error');
const formError = document.getElementById('form-error');
const toggleBtn = document.getElementById('toggle-senha');
const toggleIcon = document.getElementById('toggle-icon');
const signinBtn = document.getElementById('btn-signin');
const form = document.getElementById('login-form');


toggleBtn.addEventListener('click', () => {
  const isVisible = passwordInput.type === 'text';
  passwordInput.type = isVisible ? 'password' : 'text';
  toggleIcon.textContent = isVisible ? 'visibility' : 'visibility_off';
});

emailInput.addEventListener('input', () => {
  emailInput.classList.remove('error');
  emailError.classList.remove('visible');
  formError.style.display = 'none';
});

passwordInput.addEventListener('input', () => {
  passwordInput.classList.remove('error');
  passwordError.classList.remove('visible');
  formError.style.display = 'none';
});

function validateForm() {
  let isValid = true;
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email) {
    emailInput.classList.add('error');
    emailError.textContent = 'Informe seu e-mail ou nome de usuário.';
    emailError.classList.add('visible');
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    emailInput.classList.add('error');
    emailError.textContent = 'Formato de e-mail inválido.';
    emailError.classList.add('visible');
    isValid = false;
  }

  if (!password) {
    passwordInput.classList.add('error');
    passwordError.textContent = 'Informe sua senha.';
    passwordError.classList.add('visible');
    isValid = false;
  } else if (password.length < 6) {
    passwordInput.classList.add('error');
    passwordError.textContent = 'A senha deve ter pelo menos 6 caracteres.';
    passwordError.classList.add('visible');
    isValid = false;
  }

  return isValid;
}

function showLoginError(message) {
  signinBtn.classList.remove('loading');
  emailInput.classList.add('error');
  passwordInput.classList.add('error');
  formError.textContent = message;
  formError.style.display = 'block';
}


form.addEventListener('submit', e => {
  e.preventDefault();
  formError.style.display = 'none';
  if (!validateForm()) return;

  signinBtn.classList.add('loading');

  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  // simula latência de rede
  setTimeout(async () => {
    try {
      await SCMUDB.ready;
      const user = SCMUDB.user.findByEmail(email);

      if (!user) {
        showLoginError('E-mail ou senha incorretos. Verifique suas credenciais.');
        return;
      }

      if (user.status && user.status !== 'active') {
        showLoginError('Usuário inativo/pendente. Entre em contato com o administrador.');
        return;
      }

      const expectedPassword = String(user.senha || DEFAULT_PASSWORD);
      if (password !== expectedPassword) {
        showLoginError('E-mail ou senha incorretos. Verifique suas credenciais.');
        return;
      }

      Auth.login({
        nome: user.nome,
        cargo: user.cargo || getRoleLabel(user.role),
        email,
      });

      window.location.href = user.destino || getLandingPageByRole(user.role);
    } catch {
      showLoginError('Não foi possível carregar os usuários. Tente novamente.');
    }
  }, 500);
});

emailInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    passwordInput.focus();
  }
});
