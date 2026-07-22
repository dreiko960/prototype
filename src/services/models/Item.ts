export class Item {
  public id: string;
  public nombre: string;
  public tipo: string;
  public rareza: string;

  constructor(id: string, nombre: string, tipo: string, rareza: string) {
    this.id = id;
    this.nombre = nombre;
    this.tipo = tipo;
    this.rareza = rareza;
  }

  clone(): Item {
    return new Item(this.id, this.nombre, this.tipo, this.rareza);
  }
}
