import { Item } from './Item';

export class Inventory {
  private items: Item[] = [];

  constructor(items?: Item[]) {
    if (items) {
      this.items = items;
    }
  }

  agregar(item: Item): void {
    this.items.push(item);
  }

  eliminar(itemId: string): void {
    this.items = this.items.filter(item => item.id !== itemId);
  }

  listar(): Item[] {
    return this.items;
  }

  // Clonación superficial del inventario: comparte la misma referencia al arreglo
  cloneShallow(): Inventory {
    return new Inventory(this.items);
  }

  // Clonación profunda del inventario: crea un nuevo arreglo y clona cada ítem
  cloneDeep(): Inventory {
    return new Inventory(this.items.map(item => item.clone()));
  }
}
