export class Paging {
  page: number;
  size: number;
  constructor(
    page: number = 1,
    size: number = 100
  ) {
    this.page = page;
    this.size = size;
  }
}
