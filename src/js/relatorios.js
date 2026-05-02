if (!Auth.guard()) throw new Error('Sessão inválida');
Auth.populateHeader();

function canAccessReports(session) {
  // Como o cookie armazena apenas `cargo`, usamos uma heurística. TODO (talvez passar cargo na função que simula login)
  // Perfis esperados: Gestor/Coordenador, Farmacêutico (e Admin por padrão).
  const cargo = String(session?.cargo || '').toLowerCase();
  return (
    cargo.includes('admin') ||
    cargo.includes('gestor') ||
    cargo.includes('coorden') ||
    cargo.includes('farmac')
  );
}

const session = Auth.getSession();
if (!canAccessReports(session)) {
  alert('Acesso restrito: você não tem permissão para acessar Relatórios.');
  window.location.href = 'medicamentos.html';
  throw new Error('Sem permissão para relatórios');
}

const TODAY = DateUtil.today();

function calculateBatchStatus(batch) {
  const expirationDate = new Date(batch.validade + 'T00:00:00');
  const dayDifference = (expirationDate - TODAY) / (1000 * 60 * 60 * 24);

  if (dayDifference < 0) return 'expired';
  if (batch.quantidade <= 10) return 'low-stock';
  if (dayDifference <= 90) return 'expiring';
  return 'in-stock';
}

const STATUS_LABEL = {
  'in-stock': 'Em Estoque',
  'expiring': 'A Vencer',
  'low-stock': 'Estoque Baixo',
  'expired': 'Vencido',
};

const TYPE_CONFIG = {
  entry: { label: 'Entrada', cls: 'entry', sinal: '+', icon: 'add_circle' },
  exit: { label: 'Saída', cls: 'exit', sinal: '-', icon: 'remove_circle' },
};

const periodSelect = document.getElementById('f-periodo');
const customRange = document.getElementById('custom-range');
const dateFromInput = document.getElementById('f-de');
const dateToInput = document.getElementById('f-ate');
const typeSelect = document.getElementById('f-tipo');
const userSelect = document.getElementById('f-usuario');
const medicineSelect = document.getElementById('f-med');
const onlyCriticalCheckbox = document.getElementById('f-only-critical');
const searchInput = document.getElementById('search-input');

const tbodyMov = document.getElementById('tbody-mov');
const tbodyAlerts = document.getElementById('tbody-alerts');

const statMov = document.getElementById('stat-mov');
const statInOut = document.getElementById('stat-inout');
const statAlerts = document.getElementById('stat-alerts');
const filtersHint = document.getElementById('filters-hint');

const tblInfoMov = document.getElementById('tbl-info-mov');
const tblInfoAlerts = document.getElementById('tbl-info-alerts');

const exportCsvBtn = document.getElementById('btn-export-csv');
const exportJsonBtn = document.getElementById('btn-export-json');
const exportAlertsBtn = document.getElementById('btn-export-alerts');

let currentMovements = [];
let currentAlerts = [];

function normalize(str) {
  return String(str || '').toLowerCase().trim();
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toCSV(rows, headers) {
  const escape = value => {
    const str = String(value ?? '');
    // CSV com aspas duplas
    return `"${str.replace(/"/g, '""')}"`;
  };
  const headLine = headers.map(h => escape(h.label)).join(',');
  const bodyLines = rows.map(row => headers.map(h => escape(row[h.key])).join(',')).join('\n');
  return [headLine, bodyLines].filter(Boolean).join('\n');
}

function getDateRangeFromUI() {
  const period = periodSelect.value;
  if (period === 'all') return { from: null, to: null, label: 'Todo o período' };

  if (period === 'custom') {
    const from = dateFromInput.value ? new Date(dateFromInput.value + 'T00:00:00') : null;
    const to = dateToInput.value ? new Date(dateToInput.value + 'T23:59:59') : null;

    let label = 'Período personalizado';
    if (from && to) label = `${Fmt.date(dateFromInput.value)} → ${Fmt.date(dateToInput.value)}`;
    else if (from) label = `A partir de ${Fmt.date(dateFromInput.value)}`;
    else if (to) label = `Até ${Fmt.date(dateToInput.value)}`;

    return { from, to, label };
  }

  const days = parseInt(period, 10);
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);
  return { from, to, label: `Últimos ${days} dias` };
}

function isMovementInRange(movement, from, to) {
  if (!from && !to) return true;
  const date = new Date(movement.data + 'T00:00:00');
  if (from && date < from) return false;
  return !(to && date > to);

}

function buildAlerts() {
  const alerts = [];
  const medicinesById = new Map(SCMUDB.medicine.findAll().map(m => [m.id, m]));

  SCMUDB.batch.findAll().forEach(batch => {
    const status = calculateBatchStatus(batch);
    const medicine = medicinesById.get(batch.medicamentoId);
    const medicineName = medicine?.nome || `(Med #${batch.medicamentoId})`;
    const unit = medicine?.unidade || '';

    const isAlert = status !== 'in-stock' || !!batch.critico;
    if (!isAlert) return;

    alerts.push({
      medicineName,
      batchCode: batch.codigo,
      validade: batch.validade,
      quantidade: batch.quantidade,
      unit,
      status,
      critico: !!batch.critico,
    });
  });

  // Ordena: vencido > baixo > a vencer > crítico (mantém previsível)
  const priority = { expired: 0, 'low-stock': 1, expiring: 2, 'in-stock': 3 };
  alerts.sort((a, b) => {
    const pa = priority[a.status] ?? 99;
    const pb = priority[b.status] ?? 99;
    if (pa !== pb) return pa - pb;
    if (a.critico !== b.critico) return a.critico ? -1 : 1;
    return String(a.medicineName).localeCompare(String(b.medicineName), 'pt-BR');
  });

  return alerts;
}

function renderAlertsTable(list) {
  tbodyAlerts.innerHTML = '';
  list.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <span class="mov-med-name">${item.medicineName}</span>
        <span class="mov-med-cat">${STATUS_LABEL[item.status] || item.status}</span>
      </td>
      <td><span class="lot-code ${item.critico ? 'critical' : ''}">${item.batchCode}</span></td>
      <td>${Fmt.date(item.validade)}</td>
      <td class="right"><span class="${item.status === 'expired' || item.status === 'low-stock' ? 'qty-danger' : ''}">${Number(item.quantidade).toLocaleString('pt-BR')} ${item.unit}</span></td>
      <td><span class="badge ${item.status}">${STATUS_LABEL[item.status] || item.status}</span></td>
      <td class="center">${item.critico ? '<span class="badge critical">Sim</span>' : '—'}</td>
    `;
    tbodyAlerts.appendChild(tr);
  });

  tblInfoAlerts.textContent = `Exibindo ${list.length} ${list.length === 1 ? 'alerta' : 'alertas'}`;
}


function buildMovements() {
  const medicinesById = new Map(SCMUDB.medicine.findAll().map(m => [m.id, m]));

  return SCMUDB.movement.findAll().map(movement => {
    const med = medicinesById.get(movement.medId);
    const medName = med?.nome || `(Med #${movement.medId})`;
    const medCat = med?.categoria || '—';
    const unit = med?.unidade || '';
    const batchRef = SCMUDB.batch.findById(movement.loteId);
    const batchCode = batchRef?.lote?.codigo || `(Lote #${movement.loteId})`;
    const critical = !!batchRef?.lote?.critico;
    return {
      ...movement,
      medName,
      medCat,
      unit,
      batchCode,
      critical,
    };
  });
}

function renderMovementsTable(list) {
  tbodyMov.innerHTML = '';
  list.forEach(movement => {
    const type = TYPE_CONFIG[movement.tipo] || { label: movement.tipo, cls: '', sinal: '' };
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <span class="mov-datetime-primary">${Fmt.date(movement.data)}</span>
        <span class="mov-datetime-secondary">${movement.hora || '—'}</span>
      </td>
      <td>
        <span class="mov-med-name">${movement.medName}</span>
        <span class="mov-med-cat">${movement.medCat}</span>
      </td>
      <td><span class="badge ${type.cls}">${type.label}</span></td>
      <td class="right">
        <span class="mov-qty ${type.cls}">${type.sinal} ${Number(movement.quantidade).toLocaleString('pt-BR')} ${movement.unit}</span>
      </td>
      <td>${movement.responsavel || '—'}</td>
      <td class="center"><span class="lot-code ${movement.critical ? 'critical' : ''}">${movement.batchCode}</span></td>
    `;
    tbodyMov.appendChild(tr);
  });

  tblInfoMov.textContent = `Exibindo ${list.length} ${list.length === 1 ? 'movimentação' : 'movimentações'}`;
}

function updateStats(filteredMovements, alerts) {
  const entries = filteredMovements.filter(m => m.tipo === 'entry').length;
  const exits = filteredMovements.filter(m => m.tipo === 'exit').length;

  statMov.textContent = filteredMovements.length.toLocaleString('pt-BR');
  statInOut.textContent = `${entries} / ${exits}`;
  statAlerts.textContent = alerts.length.toLocaleString('pt-BR');
}

function populateFilters(movements) {

  const users = Array.from(
    new Set(movements.map(m => m.responsavel).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, 'pt-BR'));

  userSelect.innerHTML = '<option value="all">Todos os usuários</option>';
  users.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    userSelect.appendChild(option);
  });

  const meds = SCMUDB.medicine.findAll().sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  medicineSelect.innerHTML = '<option value="all">Todos os medicamentos</option>';
  meds.forEach(med => {
    const option = document.createElement('option');
    option.value = String(med.id);
    option.textContent = med.nome;
    medicineSelect.appendChild(option);
  });
}

function applyFilters() {
  const { from, to, label } = getDateRangeFromUI();
  filtersHint.textContent = label;

  const type = typeSelect.value;
  const user = userSelect.value;
  const medicineId = medicineSelect.value;
  const onlyCritical = onlyCriticalCheckbox.checked;
  const query = normalize(searchInput.value);

  let list = buildMovements();

  list = list.filter(m => isMovementInRange(m, from, to));
  if (type !== 'all') list = list.filter(m => m.tipo === type);
  if (user !== 'all') list = list.filter(m => m.responsavel === user);
  if (medicineId !== 'all') list = list.filter(m => String(m.medId) === String(medicineId));
  if (onlyCritical) list = list.filter(m => m.critical);

  if (query) {
    list = list.filter(m => {
      const hay = [m.medName, m.medCat, m.responsavel, m.batchCode, m.tipo, m.data, m.hora]
        .map(normalize)
        .join(' ');
      return hay.includes(query);
    });
  }

  currentMovements = list;
  renderMovementsTable(list);


  let alerts = buildAlerts();
  if (query) {
    alerts = alerts.filter(a => {
      const hay = [a.medicineName, a.batchCode, a.status, a.validade].map(normalize).join(' ');
      return hay.includes(query);
    });
  }
  currentAlerts = alerts;
  renderAlertsTable(alerts);

  updateStats(list, alerts);
}


function exportMovementsCSV() {
  const headers = [
    { key: 'data', label: 'Data' },
    { key: 'hora', label: 'Hora' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'quantidade', label: 'Quantidade' },
    { key: 'unit', label: 'Unidade' },
    { key: 'medName', label: 'Medicamento' },
    { key: 'medCat', label: 'Categoria' },
    { key: 'batchCode', label: 'Lote' },
    { key: 'responsavel', label: 'Responsável' },
    { key: 'critical', label: 'Lote crítico' },
  ];
  const rows = currentMovements.map(m => ({
    ...m,
    critical: m.critical ? 'sim' : 'não',
  }));
  const csv = toCSV(rows, headers);
  downloadFile('relatorio_movimentacoes.csv', csv, 'text/csv;charset=utf-8');
}

function exportMovementsJSON() {
  downloadFile('relatorio_movimentacoes.json', JSON.stringify(currentMovements, null, 2), 'application/json');
}

function exportAlertsCSV() {
  const headers = [
    { key: 'medicineName', label: 'Medicamento' },
    { key: 'batchCode', label: 'Lote' },
    { key: 'validade', label: 'Validade' },
    { key: 'quantidade', label: 'Quantidade' },
    { key: 'unit', label: 'Unidade' },
    { key: 'status', label: 'Status' },
    { key: 'critico', label: 'Crítico' },
  ];
  const rows = currentAlerts.map(a => ({
    ...a,
    critico: a.critico ? 'sim' : 'não',
    status: STATUS_LABEL[a.status] || a.status,
  }));
  const csv = toCSV(rows, headers);
  downloadFile('relatorio_alertas.csv', csv, 'text/csv;charset=utf-8');
}

periodSelect.addEventListener('change', () => {
  const isCustom = periodSelect.value === 'custom';
  customRange.hidden = !isCustom;
  applyFilters();
});

[dateFromInput, dateToInput, typeSelect, userSelect, medicineSelect, onlyCriticalCheckbox].forEach(el =>
  el.addEventListener('change', applyFilters)
);

searchInput.addEventListener('input', applyFilters);

exportCsvBtn.addEventListener('click', exportMovementsCSV);
exportJsonBtn.addEventListener('click', exportMovementsJSON);
exportAlertsBtn.addEventListener('click', exportAlertsCSV);

SCMUDB.ready.then(() => {
  const movements = buildMovements();
  populateFilters(movements);
  applyFilters();
});

