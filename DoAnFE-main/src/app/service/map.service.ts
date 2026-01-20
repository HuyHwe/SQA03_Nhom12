import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { UtilsService } from '../helper/service/utils.service';

@Injectable({
  providedIn: 'root'
})
export class MapService {
    mapData: any;
    coordinates: any;
    itemOrgGroupByLatLg: any | {};
    itemNearBy: any | [];
    public lat: any;
    public lng: any;
    constructor(
        private utilsService: UtilsService
    ) {
        this.mapData = new Subject<any>();
        this.itemNearBy = [];
        this.itemOrgGroupByLatLg = new Subject<any>();
    }

    buildCoordinateList() {
        let coordinateList: { lat: any; lng: any; }[] = [];
        this.itemNearBy = [];
        this.itemOrgGroupByLatLg = new Subject<any>();
        let itemOrg = this.mapData.itemOrg;
        this.coordinates = [];

        itemOrg.map((item: { [x: string]: any; }) => {
            if (!this.utilsService.isEmpty(item) && !this.utilsService.isEmpty(item['lat']) && !this.utilsService.isEmpty(item['lng'])) {
                coordinateList.push({
                    lat: item['lat'],
                    lng: item['lng']
                });
                let key =  item['lat'] + '' +  item['lng'];
                this.itemNearBy.push(item);
                this.itemOrgGroupByLatLg[key] = item;
            }
        })
        this.coordinates = coordinateList;
    }

    getPosition(): Promise<any> {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resp => {
                resolve({lng: resp.coords.longitude, lat: resp.coords.latitude});
            },
            err => {
                reject(err);
            });
        });
    }
}
