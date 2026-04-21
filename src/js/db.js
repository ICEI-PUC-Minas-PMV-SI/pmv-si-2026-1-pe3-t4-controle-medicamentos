 const SCMUDB = (() => {

    const LS_KEY  = 'scmu_db';
    const SEED_URL = '../data/db.json';

    let _state = null;

    function _save() {
      localStorage.setItem(LS_KEY, JSON.stringify(_state));
    }
  
    function _loadFromLocalStorage() {
      try {
        const raw = localStorage.getItem(LS_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    }
  
    async function _loadSeed() {
      const response = await fetch(SEED_URL);
      const seed = await response.json();
      localStorage.setItem(LS_KEY, JSON.stringify(seed));
      return seed;
    }
  
  
    const ready = (async () => {
      _state = _loadFromLocalStorage();
  
 
      if (_state?._meta?.versao) {
        try {
          const seed = await (await fetch(SEED_URL, { cache: 'no-store' })).json();
          if (seed?._meta?.versao && seed._meta.versao !== _state._meta.versao) {
            _state = seed;
            localStorage.setItem(LS_KEY, JSON.stringify(_state));
          }
        } catch {
          // se falhar, mantém o estado atual do localStorage
        }
      }
  
      if (!_state) {
        _state = await _loadSeed();
      }
    })();
  

    function _findMed(id) {
      return _state.medicamentos.find(m => m.id === id);
    }
  
    function _findGlobalBatch(batchId) {
      for (const medicine of _state.medicamentos) {
        const batch = medicine.lotes.find(item => item.id === batchId);
        if (batch) return { batch, medicine };
      }
      return null;
    }
  
    function _nextId(entity) {
      const id = _state._meta.nextIds[entity];
      _state._meta.nextIds[entity]++;
      _save();
      return id;
    }
  

    const medicine = {
  
      findAll() {
        return _state.medicamentos.map(m => ({ ...m, lotes: m.lotes.map(l => ({ ...l })) }));
      },
  
      findById(id) {
        const m = _findMed(id);
        return m ? { ...m, lotes: m.lotes.map(l => ({ ...l })) } : undefined;
      },
  
    
      insert(data) {
        const newMedicine = { id: _nextId('medicamento'), lotes: [], ...data };
        _state.medicamentos.push(newMedicine);
        _save();
        return { ...newMedicine };
      },
  

      update(id, data) {
        const medicine = _findMed(id);
        if (!medicine) return null;
        const { lotes: _, ...fields } = data;
        Object.assign(medicine, fields);
        _save();
        return { ...medicine, lotes: medicine.lotes.map(batch => ({ ...batch })) };
      },
  
      delete(id) {
        const index = _state.medicamentos.findIndex(m => m.id === id);
        if (index === -1) return false;
        _state.medicamentos.splice(index, 1);
        _save();
        return true;
      },
  
      totalStock(id) {
        const medicine = _findMed(id);
        return medicine ? medicine.lotes.reduce((sum, batch) => sum + batch.quantidade, 0) : 0;
      },
  
      getNearestBatch(id) {
        const medicine = _findMed(id);
        if (!medicine || medicine.lotes.length === 0) return null;
        return medicine.lotes.reduce((nearestBatch, batch) => batch.validade < nearestBatch.validade ? batch : nearestBatch);
      },
    };
  

    const batch = {
  
      findAll() {
        return _state.medicamentos.flatMap(m => m.lotes.map(l => ({ ...l })));
      },
  
      findByMedicine(medicineId) {
        const medicineItem = _findMed(medicineId);
        return medicineItem ? medicineItem.lotes.map(l => ({ ...l })) : [];
      },
  
      findById(batchId) {
        const result = _findGlobalBatch(batchId);
        if (!result) return null;
        return {
          lote: { ...result.batch },
          med: { ...result.medicine, lotes: result.medicine.lotes.map(item => ({ ...item })) },
        };
      },
  
      // dados: { codigo, validade, quantidade, critico }
      insert(medicineId, data) {
        const medicine = _findMed(medicineId);
        if (!medicine) return null;
        const newBatch = { id: _nextId('lote'), medicamentoId: medicineId, ...data };
        medicine.lotes.push(newBatch);
        _save();
        return { ...newBatch };
      },
  
      update(batchId, data) {
        const result = _findGlobalBatch(batchId);
        if (!result) return null;
        Object.assign(result.batch, data);
        _save();
        return { ...result.batch };
      },
  
      _adjustQuantity(batchId, delta) {
        const result = _findGlobalBatch(batchId);
        if (!result) return;
        result.batch.quantidade = Math.max(0, result.batch.quantidade + delta);
        _save();
      },
  
      delete(batchId) {
        for (const m of _state.medicamentos) {
          const index = m.lotes.findIndex(l => l.id === batchId);
          if (index !== -1) {
            m.lotes.splice(index, 1);
            _save();
            return true;
          }
        }
        return false;
      },
    };

    const movement = {
  
      findAll() {
        return [..._state.movimentacoes].reverse();
      },
  
      findByMedicine(medicineId) {
        return _state.movimentacoes.filter(m => m.medId === medicineId).reverse();
      },
  
      findByBatch(batchId) {
        return _state.movimentacoes.filter(m => m.loteId === batchId).reverse();
      },
  

      insert(data) {
        const now = new Date();
        const newMovement  = {
          id:   _nextId('movimentacao'),
          data: now.toISOString().slice(0, 10),
          hora: now.toTimeString().slice(0, 5),
          ...data,
        };
        _state.movimentacoes.push(newMovement);
  
        const delta = newMovement.tipo === 'entry' ? +newMovement.quantidade : -newMovement.quantidade;
        batch._adjustQuantity(newMovement.loteId, delta);
  
        _save();
        return { ...newMovement };
      },
    };

    const user = {
  
      findAll() {
        return _state.usuarios.map(u => ({ ...u }));
      },
  
      findById(id) {
        const u = _state.usuarios.find(u => u.id === id);
        return u ? { ...u } : undefined;
      },
  
      findByEmail(email) {
        return _state.usuarios.find(u => u.email === email);
      },
  
      insert(data) {
        const newUser = { id: _nextId('usuario'), ...data };
        _state.usuarios.push(newUser);
        _save();
        return { ...newUser };
      },
  
      update(id, data) {
        const index = _state.usuarios.findIndex(u => u.id === id);
        if (index === -1) return null;
        Object.assign(_state.usuarios[index], data);
        _save();
        return { ..._state.usuarios[index] };
      },
  
      delete(id) {
        const index = _state.usuarios.findIndex(u => u.id === id);
        if (index === -1) return false;
        _state.usuarios.splice(index, 1);
        _save();
        return true;
      },
    };
  
    function exportData() {
      const blob = new Blob(
        [JSON.stringify(_state, null, 2)],
        { type: 'application/json' }
      );
      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');
      a.href     = url;
      a.download = 'db.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  

    async function resetData() {
      localStorage.removeItem(LS_KEY);
      _state = await _loadSeed();
    }
  
 
    return { ready, medicine, batch, movement, user, exportData, resetData };
  
  })();
  