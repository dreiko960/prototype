import { Enemy, type EnemyType } from '../models/Enemy';
import { Inventory } from '../models/Inventory';
import { Item } from '../models/Item';

interface SerializedEnemy {
  id: string;
  nombre: string;
  tipo: EnemyType;
  vida: number;
  daño: number;
  esClon: boolean;
  tipoClonacion: 'SHALLOW' | 'DEEP' | 'ORIGINAL';
  parentId: string | null;
  inventarioItems: { id: string; nombre: string; tipo: string; rareza: string }[];
  icono: string;
}

export class Registry {
  private enemies: Enemy[] = [];
  private static STORAGE_KEY = 'prototype_game_enemies';

  constructor() {
    this.loadFromLocalStorage();
  }

  agregarEnemigo(enemy: Enemy): void {
    this.enemies.push(enemy);
    this.saveToLocalStorage();
  }

  eliminarEnemigo(id: string): void {
    this.enemies = this.enemies.filter(e => e.id !== id);
    this.saveToLocalStorage();
  }

  obtenerEnemigos(): Enemy[] {
    return this.enemies;
  }

  obtenerEnemigo(id: string): Enemy | undefined {
    return this.enemies.find(e => e.id === id);
  }

  limpiar(): void {
    this.enemies = [];
    this.saveToLocalStorage();
  }

  // Comprueba si un inventario está compartido por otros enemigos en el registro
  obtenerEnemigosCompartidos(inventario: Inventory): Enemy[] {
    return this.enemies.filter(e => e.inventario === inventario);
  }

  saveToLocalStorage(): void {
    const serialized: SerializedEnemy[] = this.enemies.map(e => ({
      id: e.id,
      nombre: e.nombre,
      tipo: e.tipo,
      vida: e.vida,
      daño: e.daño,
      esClon: e.esClon,
      tipoClonacion: e.tipoClonacion,
      parentId: e.parentId,
      inventarioItems: e.inventario.listar().map(item => ({
        id: item.id,
        nombre: item.nombre,
        tipo: item.tipo,
        rareza: item.rareza
      })),
      icono: e.icono
    }));
    localStorage.setItem(Registry.STORAGE_KEY, JSON.stringify(serialized));
  }

  loadFromLocalStorage(): void {
    const data = localStorage.getItem(Registry.STORAGE_KEY);
    if (!data) {
      this.enemies = [];
      return;
    }

    try {
      const parsed: SerializedEnemy[] = JSON.parse(data);
      const tempEnemies: Enemy[] = [];

      // Paso 1: Reconstruir primero los enemigos base y los clones profundos (inventarios independientes)
      for (const item of parsed) {
        if (item.tipoClonacion === 'ORIGINAL' || item.tipoClonacion === 'DEEP') {
          const itemsList = item.inventarioItems.map(i => new Item(i.id, i.nombre, i.tipo, i.rareza));
          const inv = new Inventory(itemsList);
          const enemy = new Enemy(
            item.id,
            item.nombre,
            item.tipo,
            item.vida,
            item.daño,
            inv,
            item.icono,
            item.esClon,
            item.tipoClonacion,
            item.parentId
          );
          tempEnemies.push(enemy);
        }
      }

      // Paso 2: Reconstruir los clones superficiales compartiendo la referencia de memoria correcta
      for (const item of parsed) {
        if (item.tipoClonacion === 'SHALLOW') {
          // Intentar buscar el ancestro original o el padre directo en los enemigos ya cargados
          let parent = tempEnemies.find(e => e.id === item.parentId);
          
          let sharedInventory: Inventory;
          if (parent) {
            sharedInventory = parent.inventario;
          } else {
            // Si el padre directo no existe, buscamos algún otro clon superficial que comparta el parentId
            const sibling = tempEnemies.find(e => e.parentId === item.parentId && e.tipoClonacion === 'SHALLOW');
            if (sibling) {
              sharedInventory = sibling.inventario;
            } else {
              // Si no encontramos nada con qué compartir, recreamos un inventario independiente
              const itemsList = item.inventarioItems.map(i => new Item(i.id, i.nombre, i.tipo, i.rareza));
              sharedInventory = new Inventory(itemsList);
            }
          }

          const enemy = new Enemy(
            item.id,
            item.nombre,
            item.tipo,
            item.vida,
            item.daño,
            sharedInventory,
            item.icono,
            item.esClon,
            item.tipoClonacion,
            item.parentId
          );
          tempEnemies.push(enemy);
        }
      }

      // Mantener el mismo orden secuencial original en el arreglo
      const idOrder = parsed.map(p => p.id);
      this.enemies = tempEnemies.sort((a, b) => idOrder.indexOf(a.id) - idOrder.indexOf(b.id));

    } catch (e) {
      console.error('Error deserializando del LocalStorage:', e);
      this.enemies = [];
    }
  }
}
