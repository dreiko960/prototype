import { Enemy, type EnemyType } from '../models/Enemy';
import { Inventory } from '../models/Inventory';
import { Item } from '../models/Item';
import { Registry } from '../services/Registry';

export class Controller {
  private registry: Registry;
  private draftItems: Item[] = [];
  private selectedEnemyForModalId: string | null = null;

  // DOM Elements
  private enemyForm!: HTMLFormElement;
  private enemyNameInput!: HTMLInputElement;
  private healthInput!: HTMLInputElement;
  private healthValueLabel!: HTMLSpanElement;
  private damageInput!: HTMLInputElement;
  private damageValueLabel!: HTMLSpanElement;
  
  // Draft Items DOM
  private draftItemNameInput!: HTMLInputElement;
  private draftItemTypeSelect!: HTMLSelectElement;
  private draftItemRaritySelect!: HTMLSelectElement;
  private btnAddDraftItem!: HTMLButtonElement;
  private draftItemListElement!: HTMLUListElement;

  // Global Controls DOM
  private btnClone!: HTMLButtonElement;
  private btnReset!: HTMLButtonElement;
  private btnClearLog!: HTMLButtonElement;
  private logConsole!: HTMLDivElement;
  private ecosystemAlert!: HTMLDivElement;

  // Stats DOM
  private statBaseStatus!: HTMLSpanElement;
  private statTotalClones!: HTMLSpanElement;
  private statShallowClones!: HTMLSpanElement;
  private statDeepClones!: HTMLSpanElement;

  // Gallery DOM
  private enemiesGrid!: HTMLDivElement;
  private galleryCountBadge!: HTMLSpanElement;

  // Modal DOM
  private modalOverlay!: HTMLDivElement;
  private btnCloseModal!: HTMLButtonElement;
  private modalEnemyNameLabel!: HTMLSpanElement;
  private modalShareWarningBanner!: HTMLDivElement;
  private modalCustomItemForm!: HTMLFormElement;
  private modalItemNameInput!: HTMLInputElement;
  private modalItemTypeSelect!: HTMLSelectElement;
  private modalItemRaritySelect!: HTMLSelectElement;

  constructor() {
    this.registry = new Registry();
    this.initDOMElements();
    this.bindEvents();
    this.render();
    this.log('Consola de simulación inicializada con éxito.', 'info');
    
    // Si ya existen enemigos en LocalStorage, registrarlo en la consola
    const enemies = this.registry.obtenerEnemigos();
    if (enemies.length > 0) {
      this.log(`Se cargaron ${enemies.length} enemigos del almacenamiento local.`, 'success');
    }
  }

  private initDOMElements(): void {
    this.enemyForm = document.getElementById('enemy-form') as HTMLFormElement;
    this.enemyNameInput = document.getElementById('enemy-name') as HTMLInputElement;
    this.healthInput = document.getElementById('enemy-health') as HTMLInputElement;
    this.healthValueLabel = document.getElementById('health-value') as HTMLSpanElement;
    this.damageInput = document.getElementById('enemy-damage') as HTMLInputElement;
    this.damageValueLabel = document.getElementById('damage-value') as HTMLSpanElement;

    this.draftItemNameInput = document.getElementById('new-item-name') as HTMLInputElement;
    this.draftItemTypeSelect = document.getElementById('new-item-type') as HTMLSelectElement;
    this.draftItemRaritySelect = document.getElementById('new-item-rarity') as HTMLSelectElement;
    this.btnAddDraftItem = document.getElementById('btn-add-initial-item') as HTMLButtonElement;
    this.draftItemListElement = document.getElementById('draft-item-list') as HTMLUListElement;

    this.btnClone = document.getElementById('btn-clone') as HTMLButtonElement;
    this.btnReset = document.getElementById('btn-reset') as HTMLButtonElement;
    this.btnClearLog = document.getElementById('btn-clear-log') as HTMLButtonElement;
    this.logConsole = document.getElementById('log-console') as HTMLDivElement;
    this.ecosystemAlert = document.getElementById('ecosystem-alert') as HTMLDivElement;

    this.statBaseStatus = document.getElementById('stat-base-status') as HTMLSpanElement;
    this.statTotalClones = document.getElementById('stat-total-clones') as HTMLSpanElement;
    this.statShallowClones = document.getElementById('stat-shallow-clones') as HTMLSpanElement;
    this.statDeepClones = document.getElementById('stat-deep-clones') as HTMLSpanElement;

    this.enemiesGrid = document.getElementById('enemies-grid') as HTMLDivElement;
    this.galleryCountBadge = document.getElementById('gallery-count') as HTMLSpanElement;

    // Modal elements
    this.modalOverlay = document.getElementById('quick-item-modal') as HTMLDivElement;
    this.btnCloseModal = document.getElementById('btn-close-modal') as HTMLButtonElement;
    this.modalEnemyNameLabel = document.getElementById('modal-enemy-name') as HTMLSpanElement;
    this.modalShareWarningBanner = document.getElementById('modal-share-warning') as HTMLDivElement;
    this.modalCustomItemForm = document.getElementById('modal-custom-item-form') as HTMLFormElement;
    this.modalItemNameInput = document.getElementById('modal-item-name') as HTMLInputElement;
    this.modalItemTypeSelect = document.getElementById('modal-item-type') as HTMLSelectElement;
    this.modalItemRaritySelect = document.getElementById('modal-item-rarity') as HTMLSelectElement;
  }

  private bindEvents(): void {
    // Sliders
    this.healthInput.addEventListener('input', () => {
      this.healthValueLabel.textContent = this.healthInput.value;
    });

    this.damageInput.addEventListener('input', () => {
      this.damageValueLabel.textContent = this.damageInput.value;
    });

    // Enemy Type Selectors (Radio buttons styles)
    const typeOptions = document.querySelectorAll('.type-option');
    typeOptions.forEach(option => {
      option.addEventListener('click', () => {
        typeOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        const radio = option.querySelector('input[type="radio"]') as HTMLInputElement;
        if (radio) radio.checked = true;
      });
    });

    // Add draft item to enemy base
    this.btnAddDraftItem.addEventListener('click', () => this.handleAddDraftItem());

    // Submit Enemy Base Form
    this.enemyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleCreateEnemyBase();
    });

    // Clone Enemy Button
    this.btnClone.addEventListener('click', () => this.handleCloneEnemy());

    // Reset Button
    this.btnReset.addEventListener('click', () => this.handleReset());

    // Clear Logs Button
    this.btnClearLog.addEventListener('click', () => {
      this.logConsole.innerHTML = '';
      this.log('Historial limpiado.', 'info');
    });

    // Modal Close
    this.btnCloseModal.addEventListener('click', () => this.closeQuickItemModal());
    
    // Quick Item buttons inside modal
    const quickItemBtns = document.querySelectorAll('.quick-item-btn');
    quickItemBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLButtonElement;
        const name = target.getAttribute('data-name') || 'Objeto';
        const type = target.getAttribute('data-type') || 'Arma';
        const rarity = target.getAttribute('data-rarity') || 'Común';
        this.addQuickItemToSelected(name, type, rarity);
      });
    });

    // Modal custom item form submit
    this.modalCustomItemForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = this.modalItemNameInput.value.trim();
      const type = this.modalItemTypeSelect.value;
      const rarity = this.modalItemRaritySelect.value;
      if (name) {
        this.addQuickItemToSelected(name, type, rarity);
        this.modalItemNameInput.value = '';
      }
    });
  }

  // Logs inside the Virtual Terminal
  private log(message: string, type: 'info' | 'warning' | 'danger' | 'success' = 'info'): void {
    const time = new Date().toLocaleTimeString('es-ES', { hour12: false });
    const logItem = document.createElement('div');
    logItem.className = `log-item log-${type}`;
    logItem.innerHTML = `<span class="log-time">[${time}]</span> ${message}`;
    
    this.logConsole.appendChild(logItem);
    this.logConsole.scrollTop = this.logConsole.scrollHeight;
  }

  // Add Item to base enemy draft list before creation
  private handleAddDraftItem(): void {
    const name = this.draftItemNameInput.value.trim();
    const type = this.draftItemTypeSelect.value;
    const rarity = this.draftItemRaritySelect.value;

    if (!name) {
      this.log('Por favor escribe un nombre para el objeto.', 'warning');
      return;
    }

    const newItem = new Item(crypto.randomUUID(), name, type, rarity);
    this.draftItems.push(newItem);
    this.draftItemNameInput.value = '';

    this.renderDraftItems();
    this.log(`Objeto borrador "${name}" (${rarity}) agregado al inventario base.`, 'info');
  }

  private renderDraftItems(): void {
    this.draftItemListElement.innerHTML = '';
    this.draftItems.forEach(item => {
      const li = document.createElement('li');
      li.className = `rarity-${this.getRarityClass(item.rareza)}`;
      li.innerHTML = `
        <div class="item-text-container">
          <span>${this.getItemIcon(item.tipo)}</span>
          <span class="item-name">${item.nombre}</span>
          <span class="rarity-tag text-${this.getRarityClass(item.rareza)}">${item.rareza}</span>
        </div>
        <button type="button" class="btn-item-delete" data-id="${item.id}">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      `;

      // Event listener for delete draft item
      li.querySelector('.btn-item-delete')?.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLButtonElement).getAttribute('data-id');
        this.draftItems = this.draftItems.filter(i => i.id !== id);
        this.renderDraftItems();
        this.log('Objeto borrador removido.', 'info');
      });

      this.draftItemListElement.appendChild(li);
    });
  }

  // Create Enemy Base
  private handleCreateEnemyBase(): void {
    const name = this.enemyNameInput.value.trim();
    const activeTypeOption = document.querySelector('.type-option.active') as HTMLElement;
    const type = (activeTypeOption?.getAttribute('data-type') || 'Orco') as EnemyType;
    const health = parseInt(this.healthInput.value);
    const damage = parseInt(this.damageInput.value);
    
    // Get proper type icon
    const icon = this.getEnemyTypeIcon(type);

    // Create the Inventory instance and copy draft items
    const inventory = new Inventory([...this.draftItems]);

    // Create base enemy
    const baseEnemy = new Enemy(
      crypto.randomUUID(),
      name,
      type,
      health,
      damage,
      inventory,
      icon,
      false,
      'ORIGINAL',
      null
    );

    // If there is already a base enemy, we delete it and reset clones
    // because the specifications say: "Permitir construir un enemigo únicamente una vez."
    // So we clear the previous set of enemies and put the new base
    this.registry.limpiar();
    this.registry.agregarEnemigo(baseEnemy);
    this.draftItems = [];
    this.renderDraftItems();

    this.log(`¡Enemigo Base "${name}" (${type}) creado con éxito!`, 'success');
    this.render();
  }

  // Clone active Base Enemy
  private handleCloneEnemy(): void {
    // Find the original Base Enemy
    const enemies = this.registry.obtenerEnemigos();
    const baseEnemy = enemies.find(e => e.tipoClonacion === 'ORIGINAL');

    if (!baseEnemy) {
      this.log('No existe un enemigo base para clonar. Créalo primero.', 'danger');
      return;
    }

    // Get selected clone mode
    const selectedModeInput = document.querySelector('input[name="clone-type"]:checked') as HTMLInputElement;
    const cloneMode = selectedModeInput?.value || 'SHALLOW';

    let clone: Enemy;
    if (cloneMode === 'SHALLOW') {
      clone = baseEnemy.cloneShallow();
      this.registry.agregarEnemigo(clone);
      this.log(`Clon Superficial generado de "${baseEnemy.nombre}". ID: #${clone.id.substring(0, 4)}. Compartiendo referencias de inventario. ⚠`, 'warning');
    } else {
      clone = baseEnemy.cloneDeep();
      this.registry.agregarEnemigo(clone);
      this.log(`Clon Profundo generado de "${baseEnemy.nombre}". ID: #${clone.id.substring(0, 4)}. Inventario completamente independiente. ✔`, 'success');
    }

    // Trigger visual spawn animations (scale-up inside DOM is handled by CSS card-spawn class)
    this.render();
  }

  // Reset Sandbox
  private handleReset(): void {
    this.registry.limpiar();
    this.draftItems = [];
    this.renderDraftItems();
    this.log('Placa de pruebas restablecida por completo.', 'info');
    this.render();
  }

  // Add Quick Item from Modal to the targeted enemy card
  private addQuickItemToSelected(name: string, type: string, rarity: string): void {
    if (!this.selectedEnemyForModalId) return;

    const enemy = this.registry.obtenerEnemigo(this.selectedEnemyForModalId);
    if (!enemy) return;

    const newItem = new Item(crypto.randomUUID(), name, type, rarity);
    
    // Check which other enemies will be affected by this addition due to sharing references
    const sharedEnemies = this.registry.obtenerEnemigosCompartidos(enemy.inventario);
    
    // Add the item (it mutates the inventory reference)
    enemy.inventario.agregar(newItem);

    // Save state
    this.registry.saveToLocalStorage();

    // Log detail based on whether it is a shared inventory or not
    if (sharedEnemies.length > 1) {
      const affectedNames = sharedEnemies.map(e => `"${e.nombre}" (${e.tipoClonacion === 'ORIGINAL' ? 'Base' : 'Clon S'})`).join(', ');
      this.log(`Objeto "${name}" añadido al inventario. Ecosistema afectado ⚠: Modificados los inventarios de [ ${affectedNames} ] simultáneamente por compartir referencias de memoria.`, 'warning');
      this.triggerFlashEffectOnShared(enemy.inventario);
    } else {
      this.log(`Objeto "${name}" añadido al inventario de "${enemy.nombre}" con éxito (Independiente ✔).`, 'success');
    }

    this.closeQuickItemModal();
    this.render();
  }

  // Delete Item from a specific card
  private handleDeleteItem(enemyId: string, itemId: string, itemName: string): void {
    const enemy = this.registry.obtenerEnemigo(enemyId);
    if (!enemy) return;

    // Check which other enemies will be affected
    const sharedEnemies = this.registry.obtenerEnemigosCompartidos(enemy.inventario);

    // Delete item (it mutates the inventory reference)
    enemy.inventario.eliminar(itemId);

    // Save state
    this.registry.saveToLocalStorage();

    if (sharedEnemies.length > 1) {
      const affectedNames = sharedEnemies.map(e => `"${e.nombre}" (${e.tipoClonacion === 'ORIGINAL' ? 'Base' : 'Clon S'})`).join(', ');
      this.log(`Objeto "${itemName}" eliminado. Ecosistema afectado ⚠: Modificado el inventario de [ ${affectedNames} ] por compartir la misma referencia de memoria.`, 'warning');
      this.triggerFlashEffectOnShared(enemy.inventario);
    } else {
      this.log(`Objeto "${itemName}" eliminado del inventario de "${enemy.nombre}" (Independiente ✔).`, 'success');
    }

    this.render();
  }

  // Delete an Enemy Card from the gallery
  private handleDeleteEnemy(id: string): void {
    const enemy = this.registry.obtenerEnemigo(id);
    if (!enemy) return;

    this.registry.eliminarEnemigo(id);
    this.log(`Enemigo "${enemy.nombre}" (ID: #${id.substring(0, 4)}) eliminado de la galería.`, 'info');
    this.render();
  }

  // Flashing highlight on cards sharing the same inventory
  private triggerFlashEffectOnShared(inventory: Inventory): void {
    const sharedEnemies = this.registry.obtenerEnemigosCompartidos(inventory);
    sharedEnemies.forEach(enemy => {
      const cardElement = document.querySelector(`.enemy-card[data-id="${enemy.id}"]`);
      if (cardElement) {
        cardElement.classList.add('highlight-shared');
        setTimeout(() => {
          cardElement.classList.remove('highlight-shared');
        }, 3000); // Highlight flash for 3 seconds
      }
    });
  }

  // Open Quick Item Modal
  private openQuickItemModal(enemyId: string): void {
    this.selectedEnemyForModalId = enemyId;
    const enemy = this.registry.obtenerEnemigo(enemyId);
    if (!enemy) return;

    this.modalEnemyNameLabel.textContent = `${enemy.nombre} (${enemy.tipoClonacion === 'ORIGINAL' ? 'Base' : enemy.tipoClonacion})`;
    
    // Show/hide sharing warning banner
    const sharedEnemies = this.registry.obtenerEnemigosCompartidos(enemy.inventario);
    if (sharedEnemies.length > 1) {
      this.modalShareWarningBanner.classList.remove('hidden');
    } else {
      this.modalShareWarningBanner.classList.add('hidden');
    }

    this.modalOverlay.classList.remove('hidden');
  }

  private closeQuickItemModal(): void {
    this.modalOverlay.classList.add('hidden');
    this.selectedEnemyForModalId = null;
  }

  // Helper styles utilities
  private getRarityClass(rarity: string): string {
    switch (rarity.toLowerCase()) {
      case 'común': return 'common';
      case 'raro': return 'rare';
      case 'épico': return 'epic';
      case 'legendario': return 'legendary';
      default: return 'common';
    }
  }

  private getItemIcon(type: string): string {
    switch (type) {
      case 'Arma': return '⚔';
      case 'Escudo': return '🛡';
      case 'Armadura': return '👕';
      case 'Poción': return '🧪';
      case 'Amuleto': return '📿';
      default: return '📦';
    }
  }

  private getEnemyTypeIcon(type: EnemyType): string {
    switch (type) {
      case 'Orco': return 'fa-solid fa-mask';
      case 'Dragón': return 'fa-solid fa-dragon';
      case 'Esqueleto': return 'fa-solid fa-skull';
      case 'Mago': return 'fa-solid fa-wand-magic-sparkles';
      case 'Demonio': return 'fa-solid fa-ghost';
      case 'Troll': return 'fa-solid fa-mountain';
    }
  }

  // Main UI Redraw Engine
  private render(): void {
    const enemies = this.registry.obtenerEnemigos();
    const baseEnemy = enemies.find(e => e.tipoClonacion === 'ORIGINAL');

    // 1. Update stats in Central Panel
    if (baseEnemy) {
      this.statBaseStatus.textContent = 'Sí';
      this.statBaseStatus.className = 'stat-value text-deep';
      this.btnClone.disabled = false;
    } else {
      this.statBaseStatus.textContent = 'No';
      this.statBaseStatus.className = 'stat-value text-danger';
      this.btnClone.disabled = true;
    }

    const clones = enemies.filter(e => e.esClon);
    const shallowClones = clones.filter(e => e.tipoClonacion === 'SHALLOW');
    const deepClones = clones.filter(e => e.tipoClonacion === 'DEEP');

    this.statTotalClones.textContent = clones.length.toString();
    this.statShallowClones.textContent = shallowClones.length.toString();
    this.statDeepClones.textContent = deepClones.toString().length === 0 ? '0' : deepClones.length.toString();

    this.galleryCountBadge.textContent = enemies.length.toString();

    // 2. Update Ecosystem Alert Banner
    // Check if there are any shallow copies sharing references in the workspace
    let sharesExist = false;
    for (const enemy of enemies) {
      const shared = this.registry.obtenerEnemigosCompartidos(enemy.inventario);
      if (shared.length > 1) {
        sharesExist = true;
        break;
      }
    }

    if (sharesExist) {
      this.ecosystemAlert.className = 'ecosystem-alert-box warning';
      this.ecosystemAlert.innerHTML = `
        <i class="fa-solid fa-triangle-exclamation alert-icon"></i>
        <div class="alert-details">
          <h4 class="alert-title">Ecosistema Compartido</h4>
          <p class="alert-desc">⚠ Advertencia de Memoria: Existen clones superficiales compartiendo la misma referencia de inventario. Modificar uno alterará los demás.</p>
        </div>
      `;
    } else {
      this.ecosystemAlert.className = 'ecosystem-alert-box safe';
      this.ecosystemAlert.innerHTML = `
        <i class="fa-solid fa-circle-check alert-icon"></i>
        <div class="alert-details">
          <h4 class="alert-title">Ecosistema Seguro</h4>
          <p class="alert-desc">✔ Todo correcto: Todos los inventarios cargados en el mapa son independientes y aislados en memoria.</p>
        </div>
      `;
    }

    // 3. Render Grid Cards Gallery
    this.enemiesGrid.innerHTML = '';

    if (enemies.length === 0) {
      this.enemiesGrid.innerHTML = `
        <div class="empty-gallery-msg">
          <i class="fa-solid fa-dragon animate-float"></i>
          <p>Crea un Enemigo Base en el editor para iniciar la simulación</p>
        </div>
      `;
      return;
    }

    enemies.forEach(enemy => {
      const card = document.createElement('div');
      card.className = `enemy-card`;
      card.setAttribute('data-id', enemy.id);
      
      // Inline styles to pass colored theme variables
      let themeColor = 'var(--color-orc)';
      if (enemy.tipo === 'Dragón') themeColor = 'var(--color-dragon)';
      else if (enemy.tipo === 'Esqueleto') themeColor = 'var(--color-skeleton)';
      else if (enemy.tipo === 'Mago') themeColor = 'var(--color-mage)';
      else if (enemy.tipo === 'Demonio') themeColor = 'var(--color-demon)';
      else if (enemy.tipo === 'Troll') themeColor = 'var(--color-troll)';
      
      card.setAttribute('style', `--enemy-theme: ${themeColor};`);

      // Determine Badge
      let badgeLabel = 'BASE';
      let badgeClass = 'original';
      if (enemy.tipoClonacion === 'SHALLOW') {
        badgeLabel = 'SHALLOW CLONE';
        badgeClass = 'shallow';
      } else if (enemy.tipoClonacion === 'DEEP') {
        badgeLabel = 'DEEP CLONE';
        badgeClass = 'deep';
      }

      // Render Item List HTML
      let itemsHtml = '';
      enemy.inventario.listar().forEach(item => {
        itemsHtml += `
          <li class="rarity-${this.getRarityClass(item.rareza)}">
            <div class="item-text-container">
              <span>${this.getItemIcon(item.tipo)}</span>
              <span class="item-name" title="${item.nombre}">${item.nombre}</span>
            </div>
            <button type="button" class="btn-item-delete" data-enemy-id="${enemy.id}" data-item-id="${item.id}" data-item-name="${item.nombre}">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </li>
        `;
      });

      card.innerHTML = `
        <div class="enemy-card-header">
          <div class="enemy-avatar">
            <i class="${enemy.icono}"></i>
          </div>
          <div class="enemy-meta">
            <span class="enemy-card-title" title="${enemy.nombre}">${enemy.nombre}</span>
            <span class="enemy-card-subtitle">${enemy.tipo} (ID: #${enemy.id.substring(0, 4)})</span>
          </div>
          <span class="enemy-badge ${badgeClass}">${badgeLabel}</span>
        </div>

        <div class="enemy-card-body">
          <div class="card-stats">
            <div class="card-stat hp">
              <i class="fa-solid fa-heart"></i>
              <span>HP:</span>
              <span class="card-stat-val">${enemy.vida}</span>
            </div>
            <div class="card-stat atk">
              <i class="fa-solid fa-sword"></i>
              <span>ATK:</span>
              <span class="card-stat-val">${enemy.daño}</span>
            </div>
          </div>

          <div class="card-inventory">
            <div class="card-inventory-header">
              <span>Inventario (${enemy.inventario.listar().length})</span>
              <i class="fa-solid fa-box-open"></i>
            </div>
            <ul class="card-item-list">
              ${itemsHtml}
            </ul>
          </div>
        </div>

        <div class="enemy-card-actions">
          <button type="button" class="btn btn-secondary btn-block btn-quick-add" data-id="${enemy.id}">
            <i class="fa-solid fa-plus"></i> Objeto
          </button>
          <button type="button" class="btn btn-danger-outline btn-delete-enemy" data-id="${enemy.id}" title="Eliminar enemigo">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      `;

      // HOVER INTERACTION: Highlight shared references
      card.addEventListener('mouseenter', () => {
        const shared = this.registry.obtenerEnemigosCompartidos(enemy.inventario);
        if (shared.length > 1) {
          shared.forEach(shEnemy => {
            const el = this.enemiesGrid.querySelector(`.enemy-card[data-id="${shEnemy.id}"]`);
            if (el) el.classList.add('highlight-shared');
          });
        }
      });

      card.addEventListener('mouseleave', () => {
        const els = this.enemiesGrid.querySelectorAll('.enemy-card');
        els.forEach(el => el.classList.remove('highlight-shared'));
      });

      // Quick add item button on card action click
      card.querySelector('.btn-quick-add')?.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLButtonElement).getAttribute('data-id');
        if (id) this.openQuickItemModal(id);
      });

      // Delete enemy button click
      card.querySelector('.btn-delete-enemy')?.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLButtonElement).getAttribute('data-id');
        if (id) this.handleDeleteEnemy(id);
      });

      // Delete item buttons inside list click listener
      card.querySelectorAll('.btn-item-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const target = e.currentTarget as HTMLButtonElement;
          const eId = target.getAttribute('data-enemy-id');
          const iId = target.getAttribute('data-item-id');
          const iName = target.getAttribute('data-item-name');
          if (eId && iId && iName) {
            this.handleDeleteItem(eId, iId, iName);
          }
        });
      });

      this.enemiesGrid.appendChild(card);
    });
  }
}
