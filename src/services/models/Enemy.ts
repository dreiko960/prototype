import type { Prototype } from './Prototype';
import { Inventory } from './Inventory';

export type EnemyType = 'Orco' | 'Dragón' | 'Esqueleto' | 'Mago' | 'Demonio' | 'Troll';

export class Enemy implements Prototype<Enemy> {
  public id: string;
  public nombre: string;
  public tipo: EnemyType;
  public vida: number;
  public daño: number;
  public inventario: Inventory;
  public icono: string;
  public esClon: boolean;
  public tipoClonacion: 'SHALLOW' | 'DEEP' | 'ORIGINAL';
  public parentId: string | null;

  constructor(
    id: string,
    nombre: string,
    tipo: EnemyType,
    vida: number,
    daño: number,
    inventario: Inventory,
    icono: string,
    esClon: boolean = false,
    tipoClonacion: 'SHALLOW' | 'DEEP' | 'ORIGINAL' = 'ORIGINAL',
    parentId: string | null = null
  ) {
    this.id = id;
    this.nombre = nombre;
    this.tipo = tipo;
    this.vida = vida;
    this.daño = daño;
    this.inventario = inventario;
    this.icono = icono;
    this.esClon = esClon;
    this.tipoClonacion = tipoClonacion;
    this.parentId = parentId;
  }

  // Clonación Superficial: copia valores primitivos pero comparte la referencia del inventario
  cloneShallow(): Enemy {
    return new Enemy(
      crypto.randomUUID(),
      `${this.nombre} (Clon S)`,
      this.tipo,
      this.vida,
      this.daño,
      this.inventario, // Comparte la misma referencia del inventario
      this.icono,
      true,
      'SHALLOW',
      this.id
    );
  }

  // Clonación Profunda: copia todos los valores y crea un clon independiente del inventario
  cloneDeep(): Enemy {
    return new Enemy(
      crypto.randomUUID(),
      `${this.nombre} (Clon D)`,
      this.tipo,
      this.vida,
      this.daño,
      this.inventario.cloneDeep(), // Copia profunda e independiente del inventario
      this.icono,
      true,
      'DEEP',
      this.id
    );
  }
}
