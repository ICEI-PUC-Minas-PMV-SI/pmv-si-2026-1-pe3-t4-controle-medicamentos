if (!Auth.guard()) throw new Error('Sessão inválida');
Auth.populateHeader();


const ROLE_CONFIG = {
    admin:      { label: 'Administrador', cls: 'admin'      },
    pharmacist: { label: 'Farmacêutico',  cls: 'pharmacist' },
    doctor:     { label: 'Médico',        cls: 'doctor'     },
    nurse:      { label: 'Enfermeiro',    cls: 'nurse'      },
    technician: { label: 'Técnico',       cls: 'technician' },
};

const STATUS_CONFIG = {
    active:   { label: 'Ativo',    cls: 'active'   },
    inactive: { label: 'Inativo',  cls: 'inactive' },
    pending:  { label: 'Pendente', cls: 'pending'  },
};

function getInitials(name) {
    if (typeof Fmt?.initials === 'function') return Fmt.initials(String(name || ''));
    return String(name || '')
        .replace(/^Dr(a)?\.?\s*/i, '')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0])
        .join('')
        .toUpperCase();
}

function renderTable(list) {
    list = list !== undefined ? list : SCMUDB.user.findAll();
    const tbody = document.getElementById('tbody');
    tbody.innerHTML = '';

    list.forEach(user => {
        const roleKey = user.role || 'technician';
        const role = ROLE_CONFIG[roleKey] || { label: user.cargo || roleKey, cls: 'technician' };
        const statusKey = user.status || 'inactive';
        const status = STATUS_CONFIG[statusKey] || { label: statusKey, cls: 'inactive' };

        const tr = document.createElement('tr');
        tr.dataset.id = user.id;
        tr.innerHTML = `
      <td>
        <div class="user-cell">
          <div class="user-initials">${getInitials(user.nome)}</div>
          <div>
            <div class="user-name-cell">${user.nome}</div>
            <div class="user-dept">Depto: ${user.dept}</div>
          </div>
        </div>
      </td>
      <td class="email">${user.email}</td>
      <td><span class="badge ${role.cls}">${role.label}</span></td>
      <td><span class="status ${status.cls}">${status.label}</span></td>
      <td class="right">
        <div class="row-actions">
          <button class="row-btn edit" data-id="${user.id}" title="Editar">
            <span class="material-symbols-outlined">edit</span>
          </button>
          <button class="row-btn del" data-id="${user.id}" title="Remover" style="margin-left:4px;">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      </td>`;
        tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.row-btn.edit').forEach(btn =>
        btn.addEventListener('click', () => openEdit(+btn.dataset.id))
    );
    tbody.querySelectorAll('.row-btn.del').forEach(btn =>
        btn.addEventListener('click', () => requestDeleteConfirmation(+btn.dataset.id))
    );

    updateStats(list);
}

function updateStats(list) {
    const activeUsers = list.filter(user => user.status === 'active').length;
    const pendingUsers = list.filter(user => user.status === 'pending').length;
    document.getElementById('stat-total').textContent   = list.length;
    document.getElementById('stat-active').textContent  = activeUsers;
    document.getElementById('stat-pending').textContent = pendingUsers;
    document.getElementById('tbl-info').textContent =
        `Exibindo ${list.length} ${list.length === 1 ? 'resultado' : 'resultados'}`;
}

let isEditMode = false;
let editingId = null;

const modalForm  = new Modal('modal-form');
const modalTitle = document.getElementById('modal-title');
const submitBtn  = document.getElementById('btn-submit-form');
const formError  = document.getElementById('form-error');

const nameInput = document.getElementById('f-nome');
const departmentInput = document.getElementById('f-dept');
const emailInput = document.getElementById('f-email');
const roleInput = document.getElementById('f-role');
const statusInput = document.getElementById('f-status');

function clearForm() {
    nameInput.value = '';
    emailInput.value = '';

    departmentInput.selectedIndex = 0;
    roleInput.value = 'nurse';
    statusInput.value = 'active';
    formError.style.display = 'none';
}

function openCreateForm() {
    isEditMode = false; editingId = null;
    clearForm();
    modalTitle.textContent = 'Adicionar Usuário';
    submitBtn.textContent  = 'Adicionar Usuário';
    modalForm.open();
    nameInput.focus();
}

function openEdit(id) {
    const user = SCMUDB.user.findById(id);
    if (!user) return;
    isEditMode = true; editingId = id;
    clearForm();

    nameInput.value = user.nome || '';
    emailInput.value = user.email || '';

    // Se o dept do usuário não existir no <select>, cria uma opção
    if (user.dept) {
        const hasDeptOption = Array.from(departmentInput.options)
            .some(option => option.value === user.dept);
        if (!hasDeptOption) {
            const option = document.createElement('option');
            option.value = user.dept;
            option.textContent = user.dept;
            departmentInput.appendChild(option);
        }
        departmentInput.value = user.dept;
    }

    if (user.role) roleInput.value = user.role;
    if (user.status) statusInput.value = user.status;

    modalTitle.textContent = 'Editar Usuário';
    submitBtn.textContent  = 'Salvar Alterações';
    modalForm.open();
    nameInput.focus();
}

function saveUser() {
    const userData = {
        nome:   nameInput.value.trim(),
        dept:   departmentInput.value.trim(),
        email:  emailInput.value.trim(),
        role:   roleInput.value,
        status: statusInput.value,
    };
    if (!userData.nome || !userData.dept || !userData.email) {
        formError.textContent = 'Preencha todos os campos obrigatórios.';
        formError.style.display = 'block';
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
        formError.textContent = 'Por favor, insira um endereço de e-mail válido.';
        formError.style.display = 'block';
        return;
    }

    if (isEditMode) SCMUDB.user.update(editingId, userData);
    else            SCMUDB.user.insert(userData);
    modalForm.close();
    renderTable();
}

let pendingDeleteId = null;

const modalConfirm = new Modal('modal-confirm');
const confirmText  = document.getElementById('confirm-text');

function requestDeleteConfirmation(id) {
    const user = SCMUDB.user.findById(id);
    if (!user) return;
    pendingDeleteId = id;
    confirmText.textContent = `Tem certeza que deseja remover "${user.nome}"? Esta ação não pode ser desfeita.`;
    modalConfirm.open();
}

function confirmDelete() {
    if (pendingDeleteId !== null) {
        SCMUDB.user.delete(pendingDeleteId);
        renderTable();
    }
    pendingDeleteId = null;
    modalConfirm.close();
}

document.getElementById('search-input').addEventListener('input', function () {
    const query = this.value.toLowerCase().trim();
    const filteredUsers = SCMUDB.user.findAll().filter(user =>
        String(user.nome || '').toLowerCase().includes(query)  ||
        String(user.dept || '').toLowerCase().includes(query)  ||
        String(user.email || '').toLowerCase().includes(query) ||
        String(ROLE_CONFIG[user.role]?.label || user.cargo || user.role || '').toLowerCase().includes(query)
    );
    renderTable(filteredUsers);
});


document.getElementById('btn-novo-usuario').addEventListener('click', openCreateForm);
document.getElementById('btn-close-form').addEventListener('click',   () => modalForm.close());
document.getElementById('btn-cancel-form').addEventListener('click',  () => modalForm.close());
document.getElementById('btn-submit-form').addEventListener('click',  saveUser);
document.getElementById('btn-cancel-confirm').addEventListener('click', () => modalConfirm.close());
document.getElementById('btn-confirm-delete').addEventListener('click',  confirmDelete);


SCMUDB.ready.then(renderTable);
