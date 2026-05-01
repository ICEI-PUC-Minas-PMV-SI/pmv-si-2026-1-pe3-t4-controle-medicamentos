
if (!Auth.guard()) throw new Error('Sessão inválida');
Auth.populateHeader();


const TYPE_CONFIG = {
    entry: { label: 'Entrada', cls: 'entry', sinal: '+', icon: 'add_circle'    },
    exit:  { label: 'Saída',   cls: 'exit',  sinal: '-', icon: 'remove_circle' },
};

function getInitials(name) {
    if (!name) return '—';

    if (typeof Fmt !== 'undefined' && typeof Fmt.initials === 'function') return Fmt.initials(name);
    return String(name)
        .replace(/^Dr(a)?\.?\s*/i, '')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0])
        .join('')
        .toUpperCase();
}

function updateStats() {
    const movements = SCMUDB.movement.findAll();
    const batches = SCMUDB.batch.findAll();
    const criticalBatches = batches.filter(batch => batch.critico).length;
    const today = new Date().toISOString().slice(0, 10);
    const todayMovements = movements.filter(movement => movement.data === today).length;

    document.getElementById('stat-total').textContent    = movements.length.toLocaleString('pt-BR');
    document.getElementById('stat-criticos').textContent = criticalBatches;
    document.getElementById('stat-mov').textContent      = todayMovements || movements.length;
    document.getElementById('tbl-info').textContent =
        `Exibindo ${movements.length} ${movements.length === 1 ? 'resultado' : 'resultados'}`;
}

function renderTable(list) {
    list = list !== undefined ? list : SCMUDB.movement.findAll();
    const tbody = document.getElementById('tbody');
    tbody.innerHTML = '';

    list.forEach(movement => {
        const movementType = TYPE_CONFIG[movement.tipo];
        const medicineRef = SCMUDB.medicine.findById(movement.medId);
        const batchRef = SCMUDB.batch.findById(movement.loteId);

        // resolve nomes a partir das referências (sem strings duplicadas)
        const medicineName  = medicineRef ? medicineRef.nome : `(Med #${movement.medId})`;
        const medicineCategory = medicineRef ? medicineRef.categoria : '—';
        const unit = medicineRef ? medicineRef.unidade : '';
        const batchCode = batchRef ? batchRef.lote.codigo : `(Lote #${movement.loteId})`;
        const isCritical = batchRef ? batchRef.lote.critico : false;

        const tr = document.createElement('tr');
        tr.dataset.id = movement.id;
        tr.innerHTML = `
      <td>
        <span class="mov-datetime-primary">${Fmt.date(movement.data)}</span>
        <span class="mov-datetime-secondary">${movement.hora}</span>
      </td>
      <td>
        <span class="mov-med-name">${medicineName}</span>
        <span class="mov-med-cat">${medicineCategory}</span>
      </td>
      <td><span class="badge ${movementType.cls}">${movementType.label}</span></td>
      <td class="right">
        <span class="mov-qty ${movementType.cls}">
          ${movementType.sinal} ${movement.quantidade.toLocaleString('pt-BR')} ${unit}
        </span>
      </td>
      <td>
        <div class="mov-user">
          <div class="mov-user-initials">${getInitials(movement.responsavel)}</div>
          <span class="mov-user-name">${movement.responsavel}</span>
        </div>
      </td>
      <td class="center">
        <span class="lot-code ${isCritical ? 'critical' : ''}">${batchCode}</span>
      </td>
      <td class="right">
        <div class="row-actions" style="justify-content:flex-end;">
          <button class="quick-btn add" data-medid="${movement.medId}" data-loteid="${movement.loteId}" title="Nova Entrada">
            <span class="material-symbols-outlined">add</span>
          </button>
          <button class="quick-btn remove" data-medid="${movement.medId}" data-loteid="${movement.loteId}" title="Nova Saída">
            <span class="material-symbols-outlined">remove</span>
          </button>
        </div>
      </td>`;
        tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.quick-btn.add').forEach(btn =>
        btn.addEventListener('click', () =>
            openModal('entry', +btn.dataset.medid, +btn.dataset.loteid))
    );
    tbody.querySelectorAll('.quick-btn.remove').forEach(btn =>
        btn.addEventListener('click', () =>
            openModal('exit', +btn.dataset.medid, +btn.dataset.loteid))
    );

    updateStats();
}

function applyFilters() {
    const period = document.getElementById('f-periodo').value;
    const type = document.getElementById('f-tipo').value;
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    let list = SCMUDB.movement.findAll();

    if (type !== 'all') list = list.filter(movement => movement.tipo === type);

    if (period !== 'all') {
        const days = parseInt(period, 10);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        list = list.filter(movement => new Date(movement.data) >= cutoffDate);
    }

    if (query) {
        list = list.filter(movement => {
            const medicineRef = SCMUDB.medicine.findById(movement.medId);
            const batchRef = SCMUDB.batch.findById(movement.loteId);
            const medicineName = medicineRef ? medicineRef.nome.toLowerCase() : '';
            const medicineCategory = medicineRef ? medicineRef.categoria.toLowerCase() : '';
            const batchCode = batchRef ? batchRef.lote.codigo.toLowerCase() : '';
            const responsible = movement.responsavel.toLowerCase();
            return medicineName.includes(query) || medicineCategory.includes(query) || batchCode.includes(query) || responsible.includes(query);
        });
    }

    renderTable(list);
}

let activeType = 'entry';

const modal      = new Modal('modal-mov');
const modalTitle = document.getElementById('modal-title');
const submitBtn  = document.getElementById('btn-submit');
const formError  = document.getElementById('form-error');


const medicineSelect = document.getElementById('f-med');
const batchSelect = document.getElementById('f-lote');
const quantityInput = document.getElementById('f-qtd');
const responsibleInput = document.getElementById('f-resp');

function populateMedicines() {
    medicineSelect.innerHTML = '<option value="">Selecione o medicamento…</option>';
    SCMUDB.medicine.findAll().forEach(medicine => {
        const option = document.createElement('option');
        option.value = medicine.id;
        option.textContent = medicine.nome;
        medicineSelect.appendChild(option);
    });
}


medicineSelect.addEventListener('change', () => {
    const medicineId = parseInt(medicineSelect.value, 10);
    populateBatches(medicineId);
});

function populateBatches(medicineId) {
    batchSelect.innerHTML = '<option value="">Selecione o lote…</option>';
    batchSelect.disabled  = !medicineId;
    if (!medicineId) return;

    const batches = SCMUDB.batch.findByMedicine(medicineId);
    batches.forEach(batch => {
        const option = document.createElement('option');
        option.value = batch.id;
        option.textContent = `${batch.codigo} — val. ${Fmt.date(batch.validade)} (${batch.quantidade.toLocaleString('pt-BR')} em estoque)`;
        batchSelect.appendChild(option);
    });
}

function setType(type) {
    activeType = type;
    document.querySelectorAll('.tipo-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.tipo === type);
        b.classList.toggle(b.dataset.tipo, b.dataset.tipo === type);
    });
    modalTitle.textContent = type === 'entry' ? 'Registrar Entrada' : 'Registrar Saída';
    submitBtn.textContent  = type === 'entry' ? 'Confirmar Entrada' : 'Confirmar Saída';
    submitBtn.style.background = type === 'entry'
        ? 'linear-gradient(135deg, var(--primary), var(--primary-dim))'
        : 'linear-gradient(135deg, #9f403d, #7a302e)';
}

function clearForm() {
    medicineSelect.value = '';
    batchSelect.innerHTML = '<option value="">Selecione o lote…</option>';
    batchSelect.disabled = true;
    quantityInput.value = '';

    const session = Auth.getSession?.() || null;
    responsibleInput.value = session?.nome ? session.nome : '';

    formError.style.display = 'none';
}

function openModal(type, medicineId, batchId) {
    populateMedicines();
    clearForm();

    if (medicineId) {
        medicineSelect.value = medicineId;
        populateBatches(medicineId);
        if (batchId) batchSelect.value = batchId;
    }

    setType(type);
    modal.open();
    medicineSelect.focus();
}

function saveMovement() {
    const medicineId  = parseInt(medicineSelect.value, 10);
    const batchId = parseInt(batchSelect.value, 10);
    const quantity = parseInt(quantityInput.value, 10);
    const responsible = responsibleInput.value.trim();

    if (!medicineId || !batchId || isNaN(quantity) || quantity <= 0 || !responsible) {
        formError.style.display = 'block';
        return;
    }

    // valida saída: não pode retirar mais do que há no lote
    if (activeType === 'exit') {
        const batchRef = SCMUDB.batch.findById(batchId);
        if (batchRef && quantity > batchRef.lote.quantidade) {
            formError.textContent = `Quantidade insuficiente. Este lote tem apenas ${batchRef.lote.quantidade.toLocaleString('pt-BR')} ${SCMUDB.medicine.findById(medicineId)?.unidade || 'unidades'} em estoque.`;
            formError.style.display = 'block';
            return;
        }
    }

    SCMUDB.movement.insert({ medId: medicineId, loteId: batchId, tipo: activeType, quantidade: quantity, responsavel: responsible });
    modal.close();
    renderTable();
}

document.getElementById('btn-nova-entrada').addEventListener('click', () => openModal('entry'));
document.getElementById('btn-nova-saida').addEventListener('click',   () => openModal('exit'));
document.getElementById('btn-close').addEventListener('click',   () => modal.close());
document.getElementById('btn-cancel').addEventListener('click',  () => modal.close());
document.getElementById('btn-submit').addEventListener('click',  saveMovement);

document.querySelectorAll('.tipo-btn').forEach(btn =>
    btn.addEventListener('click', () => setType(btn.dataset.tipo))
);

document.getElementById('f-periodo').addEventListener('change', applyFilters);
document.getElementById('f-tipo').addEventListener('change',    applyFilters);
document.getElementById('search-input').addEventListener('input', applyFilters);

SCMUDB.ready.then(renderTable);
