
if (!Auth.guard()) throw new Error('Sessão inválida');
Auth.populateHeader();


const TODAY = (() => { const date = new Date(); date.setHours(0,0,0,0); return date; })();

function calculateBatchStatus(batch) {
    const expirationDate = new Date(batch.validade + 'T00:00:00');
    const dayDifference = (expirationDate - TODAY) / (1000 * 60 * 60 * 24);

    if (dayDifference < 0) return 'expired';
    if (batch.quantidade <= 10) return 'low-stock';
    if (dayDifference <= 90) return 'expiring';
    return 'in-stock';
}

function calculateMedicineStatus(medicine) {
    if (medicine.lotes.length === 0) return 'low-stock';
    const priority = { 'expired': 0, 'low-stock': 1, 'expiring': 2, 'in-stock': 3 };
    return medicine.lotes
        .map(batch => calculateBatchStatus(batch))
        .reduce((worstStatus, currentStatus) => priority[currentStatus] < priority[worstStatus] ? currentStatus : worstStatus);
}

const STATUS_LABEL = {
    'in-stock':  'Em Estoque',
    'expiring':  'A Vencer',
    'low-stock': 'Estoque Baixo',
    'expired':   'Vencido',
};


function renderTable(list) {
    list = list !== undefined ? list : SCMUDB.medicine.findAll();
    const tbody = document.getElementById('tbody');
    tbody.innerHTML = '';

    list.forEach(medicine => {
        const status = calculateMedicineStatus(medicine);
        const isExpiring = status === 'expiring';
        const isLowStock = status === 'low-stock';
        const totalQuantity = SCMUDB.medicine.totalStock(medicine.id);
        const nearestBatch = SCMUDB.medicine.getNearestBatch(medicine.id);
        const batchCode = nearestBatch ? nearestBatch.codigo : '—';
        const expirationDate = nearestBatch ? nearestBatch.validade : null;
        const batchCount = medicine.lotes.length;

        const tr = document.createElement('tr');
        tr.dataset.id = medicine.id;
        tr.innerHTML = `
      <td>
        <span class="med-name">${medicine.nome}</span>
        <span class="med-sub">${medicine.apresentacao}</span>
      </td>
      <td>
        <span class="batch-code">${batchCode}</span>
        ${batchCount > 1 ? `<span class="lotes-count">+${batchCount - 1} lote${batchCount - 1 > 1 ? 's' : ''}</span>` : ''}
      </td>
      <td class="${isExpiring ? 'expiring-date' : ''}">${Fmt.date(expirationDate)}</td>
      <td class="right">
        <span class="qty ${isLowStock ? 'danger' : ''}">${totalQuantity.toLocaleString('pt-BR')} ${medicine.unidade}</span>
      </td>
      <td><span class="badge ${status}">${STATUS_LABEL[status]}</span></td>
      <td class="center">
        <div class="row-actions">
          <button class="row-btn edit" data-id="${medicine.id}" title="Editar">
            <span class="material-symbols-outlined">edit</span>
          </button>
          <button class="row-btn del" data-id="${medicine.id}" title="Remover">
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
        btn.addEventListener('click', () => removeMedicine(+btn.dataset.id))
    );

    updateStats(list);
}

function updateStats(list) {
    // conta lotes com status expiring ou low-stock em todos os medicamentos
    const allBatches = SCMUDB.batch.findAll();
    const expiring = allBatches.filter(batch => calculateBatchStatus(batch) === 'expiring').length;
    const low = allBatches.filter(batch => calculateBatchStatus(batch) === 'low-stock').length;

    document.getElementById('stat-total').textContent    = list.length.toLocaleString('pt-BR');
    document.getElementById('stat-expiring').textContent = String(expiring).padStart(2, '0');
    document.getElementById('stat-low').textContent      = String(low).padStart(2, '0');
    document.getElementById('tbl-info').textContent =
        `Exibindo ${list.length} ${list.length === 1 ? 'medicamento' : 'medicamentos'}`;
}

let isEditMode = false;
let editingId = null;

const modal      = new Modal('modal');
const modalTitle = document.getElementById('modal-title');
const submitBtn  = document.getElementById('submitModal');
const formError  = document.getElementById('form-error');

const nameInput = document.getElementById('f-nome');
const categoryInput = document.getElementById('f-cat');
const presentationInput = document.getElementById('f-apres');
const unitInput = document.getElementById('f-unidade');

// campos do primeiro lote (só no cadastro)
const batchSection  = document.getElementById('lote-section');
const batchCodeInput  = document.getElementById('f-lote-codigo');
const batchExpirationInput     = document.getElementById('f-lote-val');
const batchQuantityInput     = document.getElementById('f-lote-qtd');
const criticalBatchCheckbox = document.getElementById('f-lote-critico');

function clearForm() {
    nameInput.value = categoryInput.value = presentationInput.value = '';
    unitInput.value = 'unidades';
    batchCodeInput.value = batchExpirationInput.value = batchQuantityInput.value = '';
    criticalBatchCheckbox.checked = false;
    formError.style.display = 'none';
}

function openCreateForm() {
    isEditMode = false; editingId = null;
    clearForm();
    batchSection.style.display = 'flex';  // mostra campos de lote inicial
    modalTitle.textContent = 'Adicionar Medicamento';
    submitBtn.textContent  = 'Registrar Medicamento';
    modal.open();
    nameInput.focus();
}

function openEdit(id) {
    const medicine = SCMUDB.medicine.findById(id);
    if (!medicine) return;
    isEditMode = true; editingId = id;
    clearForm();
    nameInput.value    = medicine.nome;
    categoryInput.value     = medicine.categoria;
    presentationInput.value   = medicine.apresentacao;
    unitInput.value = medicine.unidade;
    batchSection.style.display = 'none'; // edição de lotes é feita no estoque
    modalTitle.textContent = 'Editar Medicamento';
    submitBtn.textContent  = 'Salvar Alterações';
    modal.open();
    nameInput.focus();
}

function saveMedicine() {
    const medicineData = {
        nome:        nameInput.value.trim(),
        categoria:   categoryInput.value.trim(),
        apresentacao:presentationInput.value.trim(),
        unidade:     unitInput.value,
    };

    if (!medicineData.nome || !medicineData.categoria || !medicineData.apresentacao) {
        formError.style.display = 'block';
        return;
    }

    if (isEditMode) {
        SCMUDB.medicine.update(editingId, medicineData);
    } else {
        const batchQuantity = parseInt(batchQuantityInput.value, 10);
        if (!batchCodeInput.value.trim() || !batchExpirationInput.value || isNaN(batchQuantity)) {
            formError.style.display = 'block';
            return;
        }
        const newMedicine = SCMUDB.medicine.insert(medicineData);
        SCMUDB.batch.insert(newMedicine.id, {
            codigo:    batchCodeInput.value.trim(),
            validade:  batchExpirationInput.value,
            quantidade: batchQuantity,
            critico:   criticalBatchCheckbox.checked,
        });
    }

    modal.close();
    renderTable();
}

function removeMedicine(id) {
    const medicine = SCMUDB.medicine.findById(id);
    if (!medicine) return;
    pendingDeleteId = id;
    document.getElementById('delete-confirm-text').textContent =
        `Tem certeza que deseja remover "${medicine.nome}" e todos os seus lotes? Esta ação não pode ser desfeita.`;
    modalDelete.open();
}

let pendingDeleteId = null;
const modalDelete = new Modal('modal-delete');

document.getElementById('openModal').addEventListener('click', openCreateForm);
document.getElementById('closeModal').addEventListener('click', () => modal.close());
document.getElementById('cancelModal').addEventListener('click', () => modal.close());
submitBtn.addEventListener('click', saveMedicine);

document.getElementById('btn-cancel-delete').addEventListener('click', () => modalDelete.close());
document.getElementById('btn-confirm-delete').addEventListener('click', () => {
    if (pendingDeleteId !== null) {
        SCMUDB.medicine.delete(pendingDeleteId);
        pendingDeleteId = null;
        renderTable();
    }
    modalDelete.close();
});

document.getElementById('search-input').addEventListener('input', function () {
    const query = this.value.toLowerCase().trim();
    const filteredMedicines = SCMUDB.medicine.findAll().filter(medicine =>
        medicine.nome.toLowerCase().includes(query) ||
        medicine.categoria.toLowerCase().includes(query) ||
        medicine.apresentacao.toLowerCase().includes(query)
    );
    renderTable(filteredMedicines);
});

SCMUDB.ready.then(() => renderTable());
