import {ConstantsApp} from "../constant/ConstantsApp";

export class Sort {
  prop: string;
  type: string;

  constructor(
    prop: string = ConstantsApp.ID,
    type: string = ConstantsApp.DESC
  ) {
    this.prop = prop;
    this.type = type;
  }
}
