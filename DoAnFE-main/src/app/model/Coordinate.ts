import {ConstantsApp} from "../constant/ConstantsApp";

export class Coordinate {
  lat: number;
  lng: number;
  constructor(
    lat: number = ConstantsApp.LAT_DEFAULT,
    lg: number = ConstantsApp.LNG_DEFAULT
  ) {
    this.lat = lat;
    this.lng = lg;
  }
}
