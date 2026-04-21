   class Modal {
    constructor(overlayId) {
      this.overlay = document.getElementById(overlayId);
      if (!this.overlay) return;
  
      this.overlay.addEventListener('click', e => {
        if (e.target === this.overlay) this.close();
      });
    }
  
    open()  { this.overlay.classList.add('open');    }
    close() { this.overlay.classList.remove('open'); }
    get isOpen() { return this.overlay.classList.contains('open'); }
  }
  

  class Repository {
    constructor() {
      this._collection = [];
      this._nextId     = 1;
    }
  
    findAll() {
      return [...this._collection];
    }
  

    findById(id) {
      return this._collection.find(item => item.id === id);
    }
  
    insert(data) {
      const newRecord = { id: this._nextId++, ...data };
      this._collection.push(newRecord);
      return newRecord;
    }
  
    update(id, data) {
      const index = this._collection.findIndex(item => item.id === id);
      if (index === -1) return null;
      this._collection[index] = { ...this._collection[index], ...data };
      return this._collection[index];
    }

    delete(id) {
      const index = this._collection.findIndex(item => item.id === id);
      if (index === -1) return false;
      this._collection.splice(index, 1);
      return true;
    }
  }
  
 
  const Auth = {
    COOKIE_NAME: 'scmu_session',
    EXPIRES_MIN: 5,
    LOGIN_PAGE:  'login.html',

    login(user) {
      const payload = JSON.stringify({
        nome:  user.nome,
        cargo: user.cargo,
        email: user.email,
      });
      const maxAge = this.EXPIRES_MIN * 60;
      document.cookie =
        `${this.COOKIE_NAME}=${encodeURIComponent(payload)}` +
        `; max-age=${maxAge}; path=/; SameSite=Strict`;
    },
  

    logout() {
      document.cookie =
        `${this.COOKIE_NAME}=; max-age=0; path=/; SameSite=Strict`;
      window.location.href = this.LOGIN_PAGE;
    },
  
    getSession() {
      const match = document.cookie
        .split('; ')
        .find(c => c.startsWith(this.COOKIE_NAME + '='));
      if (!match) return null;
      try {
        return JSON.parse(
          decodeURIComponent(match.split('=').slice(1).join('='))
        );
      } catch {
        return null;
      }
    },
  
  
    guard() {
      if (!this.getSession()) {
        window.location.href = this.LOGIN_PAGE;
        return false;
      }
      return true;
    },
  
    populateHeader() {
      const session = this.getSession();
      if (!session) return;
  
      const userNameElement = document.querySelector('.user-name');
      const userRoleElement = document.querySelector('.user-role');
      if (userNameElement)  userNameElement.textContent  = session.nome;
      if (userRoleElement) userRoleElement.textContent = session.cargo;
  
      const userBlock = document.querySelector('.user-block');
      if (!userBlock) return;

      if (!userBlock.querySelector('.avatar-initials')) {
        const userInitials = session.nome
          .replace(/^Dr(a)?\.?\s*/i, '') // regex que desconsidera Dr, Dra para determinar as inicias do avatar
          .split(' ').slice(0, 2)
          .map(p => p[0]).join('').toUpperCase();
        const avatar = document.createElement('div');
        avatar.className   = 'avatar-initials';
        avatar.textContent = userInitials;
        userBlock.appendChild(avatar);
      }
  
      if (!userBlock.querySelector('.btn-logout')) {
        const logoutButton = document.createElement('button');
        logoutButton.className = 'btn-logout icon-btn';
        logoutButton.title     = 'Sair';
        logoutButton.innerHTML = '<span class="material-symbols-outlined">logout</span>';
        logoutButton.addEventListener('click', () => Auth.logout());
        userBlock.appendChild(logoutButton);
      }
    },
  };

  const Fmt = {
    // "2025-10-24" → "24 out 2025"
    date(iso) {
      if (!iso) return '—';
      const [year, month, day] = iso.split('-');
      const months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
      return `${day} ${months[+month - 1]} ${year}`;
    },
  

    qtd(quantity) {
      return Number(quantity).toLocaleString('pt-BR') + ' unidades';
    },
  
    // Exemplo: "Dr. João Silva" → "JS"
    initials(name) {
      return name
        .replace(/^Dr(a)?\.?\s*/i, '')
        .split(' ')
        .slice(0, 2)
        .map(part => part[0])
        .join('')
        .toUpperCase();
    },
  };

  const NotificationCenter = {
    notifications: [
      {
        id: 1,
        title: 'Insulina Glargina',
        time: 'Agora mesmo',
        message: 'Lote #4829A vence em menos de 48 horas. Revisão imediata recomendada.',
        level: 'critical',
        icon: 'warning',
        tag: 'Crítico',
        unread: true,
      },
      {
        id: 2,
        title: 'Atorvastatina com estoque baixo',
        time: 'Há 2 horas',
        message: 'O inventário caiu abaixo do mínimo definido. Restam 15 unidades na farmácia central.',
        level: 'warning',
        icon: 'inventory_2',
        tag: 'Alerta',
        unread: true,
      },
      {
        id: 3,
        title: 'Novo usuário cadastrado',
        time: 'Há 5 horas',
        message: 'Dra. Sarah Jenkins concluiu o onboarding e aguarda liberação de acesso ao sistema.',
        level: 'info',
        icon: 'person_add',
        tag: 'Info',
        unread: false,
      },
    ],
    panel: null,
    backdrop: null,
    list: null,
    triggers: [],
    initialized: false,
  
    init() {
      this.triggers = Array.from(document.querySelectorAll('[data-notification-toggle]'));
      if (!this.triggers.length || this.initialized) return;
  
      this.mount();
      this.render();
      this.bindEvents();
      this.syncTriggers();
      this.initialized = true;
    },
  
    mount() {
      if (document.getElementById('notifications-panel')) return;
  
      const backdrop = document.createElement('div');
      backdrop.className = 'notifications-backdrop';
      backdrop.id = 'notifications-backdrop';
      backdrop.setAttribute('hidden', '');
  
      const panel = document.createElement('section');
      panel.className = 'notifications-panel';
      panel.id = 'notifications-panel';
      panel.setAttribute('hidden', '');
      panel.setAttribute('aria-hidden', 'true');
      panel.setAttribute('aria-label', 'Central de notificações');
  
      panel.innerHTML = `
        <div class="notifications-head">
          <h2 class="notifications-title">Alertas e Notificações</h2>
          <button type="button" class="notifications-mark-read" data-notifications-mark-all>Ler todas</button>
        </div>
        <div class="notifications-list" data-notifications-list></div>
        <div class="notifications-footer">
          <button type="button" class="notifications-footer-btn">Ver histórico de alertas</button>
        </div>
      `;
  
      document.body.append(backdrop, panel);
      this.backdrop = backdrop;
      this.panel = panel;
      this.list = panel.querySelector('[data-notifications-list]');
    },
  
    bindEvents() {
      this.triggers.forEach(trigger => {
        trigger.addEventListener('click', event => {
          event.preventDefault();
          this.toggle();
        });
      });
  
      this.backdrop.addEventListener('click', () => this.close());
  
      this.panel.addEventListener('click', event => {
        const item = event.target.closest('[data-notification-id]');
        if (item) {
          this.markAsRead(Number(item.dataset.notificationId));
          return;
        }
  
        const markAll = event.target.closest('[data-notifications-mark-all]');
        if (markAll) {
          this.markAllAsRead();
        }
      });
  
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape') this.close();
      });
    },
  
    render() {
      if (!this.list) return;
  
      this.list.innerHTML = this.notifications.map(item => `
        <button
          type="button"
          class="notification-item notification-item--${item.level} ${item.unread ? 'is-unread' : 'read'}"
          data-notification-id="${item.id}">
          <span class="notification-icon">
            <span class="material-symbols-outlined">${item.icon}</span>
          </span>
          <span class="notification-content">
            <span class="notification-meta">
              <span class="notification-heading">${item.title}</span>
              <span class="notification-time">${item.time}</span>
            </span>
            <span class="notification-text">${item.message}</span>
            <span class="notification-tag notification-tag--${item.level}">${item.tag}</span>
          </span>
        </button>
      `).join('');
  
      this.syncTriggers();
    },
  
    hasUnread() {
      return this.notifications.some(item => item.unread);
    },
  
    syncTriggers() {
      const hasUnread = this.hasUnread();
      this.triggers.forEach(trigger => {
        trigger.classList.toggle('has-badge', hasUnread);
        trigger.classList.toggle('active', this.isOpen());
        trigger.setAttribute('aria-expanded', String(this.isOpen()));
      });
    },
  
    isOpen() {
      return this.panel?.classList.contains('open');
    },
  
    open() {
      if (!this.panel || !this.backdrop) return;
      this.panel.hidden = false;
      this.backdrop.hidden = false;
      this.panel.classList.add('open');
      this.backdrop.classList.add('open');
      this.panel.setAttribute('aria-hidden', 'false');
      this.syncTriggers();
    },
  
    close() {
      if (!this.panel || !this.backdrop) return;
      this.panel.classList.remove('open');
      this.backdrop.classList.remove('open');
      this.panel.setAttribute('aria-hidden', 'true');
      this.panel.hidden = true;
      this.backdrop.hidden = true;
      this.syncTriggers();
    },
  
    toggle() {
      if (this.isOpen()) this.close();
      else this.open();
    },
  
    markAsRead(id) {
      const item = this.notifications.find(entry => entry.id === id);
      if (!item || !item.unread) return;
      item.unread = false;
      this.render();
    },
  
    markAllAsRead() {
      this.notifications = this.notifications.map(item => ({ ...item, unread: false }));
      this.render();
    },
  };
  
  NotificationCenter.init();
  