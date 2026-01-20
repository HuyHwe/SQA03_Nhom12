import {Sort} from "./Sort";
import {Coordinate} from "./Coordinate";
import {Paging} from "./Paging";

export class InputSearch {
  sortItem: Sort;
  coordinates: Coordinate;
  paging: Paging;
  keySearch: any;
  parentIds: any;
  jobDefaultIds: any;
  constructor(
    sort: Sort = new Sort(),
    coordinates: Coordinate = new Coordinate(),
    paging: Paging = new Paging(),
    keySearch: any = null,
    parentIds: any = null,
    jobDefaultIds: any = null
  ) {
    this.sortItem = sort;
    this.coordinates = coordinates;
    this.paging = paging;
    this.keySearch = keySearch;
    this.parentIds = parentIds;
    this.jobDefaultIds = jobDefaultIds;
  }
}
