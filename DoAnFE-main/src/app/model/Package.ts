export class Package {
  id: number;
  type: number;
  price: number;

  constructor(id: number, type: number, price: number) {
    this.id = id;
    this.type = type;
    this.price = price;
  }
}
