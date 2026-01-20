import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable, of, throwError, forkJoin, ObservableInput } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import {
  HttpClient,
  HttpParams,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { ApiNameConstants } from '../constant/ApiNameConstants';
import { UtilsService } from '../helper/service/utils.service';
import { ErrorHandlerService } from 'src/app/common/ErrorHandlerService';
import { AuthService } from 'src/app/core/auth/auth.service';
import { ApiModel } from "../model/ApiModel";
import { ConstantsApp } from "../constant/ConstantsApp";

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  constructor(
    private http: HttpClient,
    private utilsService: UtilsService,
    private authService: AuthService,
    private errorHandlerService: ErrorHandlerService
  ) {
  }

  public getData(
    apiUrl: any,
    functionName: any,
    messageLog: any
  ): Observable<any> {
    return this.http.get(apiUrl).pipe(
      tap((_) => this.errorHandlerService.log(messageLog, functionName)),
      catchError(
        this.errorHandlerService.handleError<any>(messageLog, [], functionName)
      )
    );
  }

  public getAllProvince(): Observable<any> {
    let apiUrl = environment.API_URI + ApiNameConstants.BS_GET_ALL_PROVINCES;
    return this.http.get<string>(apiUrl);
  }


  public getWardsByProvince(provinceCode: any): Observable<any> {
    let apiUrl =
      environment.API_URI +
      ApiNameConstants.BS_GET_WARDS_BY_PROVINCE +
      provinceCode;
    return this.http.get<string>(apiUrl);
  }

  // todo get current location for filling data to popup
  /*public retrieveData(): Observable<any> {
    let apiUrl = environment.VN_API + ApiNameConstants.BS_GET_ALL_PROVINCES;
    let call1 = this.http.get<string>(apiUrl).pipe(
      tap((_) =>
        this.errorHandlerService.log('get provinces ', 'retrieveData')
      ),
      catchError(
        this.errorHandlerService.handleError<any>(
          'retrieveData',
          [],
          'retrieveData'
        )
      )
    );

    let call2 = new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (resp) => {
          resolve({ lng: resp.coords.longitude, lat: resp.coords.latitude });
        },
        (err) => {
          reject(err);
        }
      );
    });
    return forkJoin([call1, call2]);
  }
*/
  geocodeAddress(address: string) {
    // API endpoint for the Geocoding API
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=AIzaSyDYp_QqhpBXUJ_qYDts8AQe5BWtIFO8dW8`;

    // Make an HTTP GET request to the API
    return this.http.get(url);
  }

  public postDatas(
    body: any,
    apiUrl: any,
    functionName: any,
    messageLog: any
  ): Observable<any> {
    return this.http.post<string>(apiUrl, JSON.stringify(body)).pipe(
      tap((_) => this.errorHandlerService.log(messageLog, functionName)),
      catchError(
        this.errorHandlerService.handleError<any>(messageLog, [], functionName)
      )
    );
  }
  public getFile(
    body: any,
    apiUrl: any,
    functionName: any,
    messageLog: any
  ): Observable<any> {
    const options = { responseType: 'arraybuffer' as 'json' };
    return this.http.post<string>(apiUrl, JSON.stringify(body), options).pipe(
      tap((_) => this.errorHandlerService.log(messageLog, functionName)),
      catchError(
        this.errorHandlerService.handleError<any>(messageLog, [], functionName)
      )
    );
  }

  public retrieveData(apiModels: ApiModel[]): Observable<any> {
    let arr: any = [];
    apiModels.forEach(item => {
      let call;
      if (item.method == ConstantsApp.GET) {
        call = this.http.get(item.uri).pipe(
          tap((_) => this.errorHandlerService.log(item.messageLog, null)),
          catchError(
            this.errorHandlerService.handleError<any>(item.messageLog, [], null)
          )
        );
      } else {
        call = this.http.post<string>(item.uri, JSON.stringify(item.body)).pipe(
          tap(_ => this.errorHandlerService.log(item.messageLog, 'retrieveData')),
          catchError(this.errorHandlerService.handleError<any>('retrieveData', [], 'retrieveData'))
        );
      }
      arr.push(call);
    })
    return forkJoin(arr);
    //return arr;
  }
  public retrieveDataWithHeaders(apiModels: ApiModel[], headers?: HttpHeaders): Observable<any> {
    const arr: any[] = [];
    apiModels.forEach((item) => {
      let call;
      const options = headers ? { headers } : {}; // Thêm header nếu được cung cấp

      if (item.method === ConstantsApp.GET) {
        console.log("Body gửi FE:", item.body)
        call = this.http.get(item.uri, options).pipe(
          tap((_) => this.errorHandlerService.log(item.messageLog, 'retrieveData')),
          catchError(
            this.errorHandlerService.handleError<any>(
              item.messageLog,
              [],
              'retrieveData'
            )
          )
        );
      } else {
        if (item.uri.includes(ApiNameConstants.BS_JOB_FREELANCER_SEARCH_V2)) {
          call = this.http.post(item.uri, item.body, options).pipe(
            tap((_) => this.errorHandlerService.log(item.messageLog, 'retrieveData')),
            catchError(
              this.errorHandlerService.handleError<any>(
                item.messageLog,
                [],
                'retrieveData'
              )
            )
          );
        } else {

          call = this.http.post(item.uri, JSON.stringify(item.body), options).pipe(
            tap((_) => this.errorHandlerService.log(item.messageLog, 'retrieveData')),
            catchError(
              this.errorHandlerService.handleError<any>(
                item.messageLog,
                [],
                'retrieveData'
              )
            )
          );
        }
        arr.push(call);
      }
    });

    return forkJoin(arr);
  }
  public downloadCv(item: any) {
    console.log('onDownloadCv item: ', item);
    // if (!item.cv) return;
    const body = {
      fileName: item.cv,
      freelancerId: item.freelancerId
    };
    const functionName = 'onDownloadCv';
    const messageLog = 'download cv';
    const apiUrl = environment.API_URI + ApiNameConstants.BS_USER_FILE_DOWNLOAD
    this.getFile(body, apiUrl, functionName, messageLog)
      .subscribe((res: any) => {
        if (res) {
          const blob = new Blob([res], { type: 'application/octet-stream' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = item.cv;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          // let temp: any[] = [];
          // let data = res.data;
          // data && data.map((item: any) => {
          //   item.expDate = this.utilsService.formatDate(item.expDate);
          //   temp.push(item);
          // });
        }
      });
  }

  getStandoutBrands(industry: string, page: number, size: number): Observable<any> {
  const params = {
    industry: industry,
    pageNumber: page.toString(),
    pageSize: size.toString()
  };
  // Đảm bảo ApiNameConstants.GET_STANDOUT_USERS trỏ tới '/users'
  return this.http.get<any>(`${environment.API_URI}${ApiNameConstants.GET_STANDOUT_USERS}`, { params });
}

}
