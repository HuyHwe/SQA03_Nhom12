import { Pipe, PipeTransform } from '@angular/core';
 
@Pipe({ name: 'filterConditions', pure: true })
export class SearchConditionsPipe implements PipeTransform {
  transform(listData: any, filterConditions: any) {
      if (!listData) return;
      if (filterConditions == '' || filterConditions == null) return listData;
      // todo
    return listData.filter((object: any) => this.searching(object, filterConditions));
  }

  searching(object: any, filterConditions: any) {
    let keys = Object.keys(object);
    for (let i = 0; i < keys.length; i ++) {
      if (keys[i] == 'role' || keys[i] == 'rating') continue;
      let val = object[keys[i]] + '';
      if (val.includes(filterConditions)) {
        return true;
      }
    }
    return false;
  }
}