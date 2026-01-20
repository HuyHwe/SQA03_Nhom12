import { Component, OnInit, Output, ViewChild } from '@angular/core';
import { ConstantsApp } from 'src/app/constant/ConstantsApp';
import { environment } from 'src/environments/environment';
import { ApiNameConstants } from 'src/app/constant/ApiNameConstants';
import { CommonService } from 'src/app/service/common.service';
import { UtilsService } from 'src/app/helper/service/utils.service';
import { MapService } from 'src/app/service/map.service';
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import { AuthService } from 'src/app/core/auth/auth.service';
import {FormControl, FormGroup} from "@angular/forms";
import { filter } from 'rxjs';
import { ApiModel } from 'src/app/model/ApiModel';
@Component({
  selector: 'app-searching-job-result',
  templateUrl: './searching-job-result.component.html',
  styleUrls: ['./searching-job-result.component.scss'],
})
export class SearchingJobResultComponent implements OnInit {
  jobSuggest: any;
  jobDefaults: any;
  dataSource: any;
  itemsList: any;
  pageNum: any;
  detailedItem: any;
  bodyGetData: any;
  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  parentItem: any;
  parentId: number;
	nameType:string;
	keySearch: string = '';
	page:number;
  searchingForm: any;
  constructor(
    private utilsService: UtilsService,
		private authService: AuthService,
    private commonService: CommonService,
    private mapService: MapService,
    private route: ActivatedRoute,
    private router: Router) {
    this.route.params.subscribe(params => {
      this.parentId = params['parentId'];
			this.nameType=params['name']
      // Use the parentId parameter as needed
    });
    this.router.events.pipe(filter(e=>e instanceof NavigationEnd)).subscribe(e=>{
      let body = {
        ids: null,
        parentIds: this.parentId? [this.parentId] : null,
        keySearch: this.keySearch,
      };
      let params = this.route.snapshot.queryParams;
        // Access the "name" parameter
        body.parentIds = [params['parentId']];
        body.keySearch = params['keyword'];
        this.nameType=params['name']
      this.pageNum = 1;
      if(body.keySearch == '' || body.keySearch == null){
        this.keySearch = '';
      }
      else {
        this.keySearch = body.keySearch;
      }
      this.buildBodyGetData(body);
      this.getCurrentLocation();
    })
    // this.getPassedObject();
  }
  getPassedObject() {
    const navigation = this.router.getCurrentNavigation();
    // @ts-ignore
    if (navigation.extras.state) {
      // @ts-ignore
      this.parentItem = navigation.extras.state as any; // Adjust the type according to your object structure
      // Use the objParam object as needed
    }
  }

  ngOnInit(): void {
    this.searchingForm = new FormGroup({
      searchInput: new FormControl(this.keySearch)
    });
    this.init();
  }
  init() {
    this.getCurrentLocation();
  }
  get searchInput(): any {
    return this.searchingForm.get('searchInput');
  }
  getCurrentLocation() {
    try {
      this.mapService
        .getPosition()
        .then((pos) => {
          this.center = { lat: pos.lat, lng: pos.lng };
          this.getData();
        })
        .catch((err) => {
          this.getData();
          console.log('getCurrentLocation -> err: ', err);
        });
    } catch (e) {
      this.getData();
    }
  }

  buildBodyGetData(body: any) {
    this.bodyGetData = {
      parentIds: body != null ? body?.parentIds : this.bodyGetData.parentIds,
      keySearch: body != null ? body.keySearch : this.bodyGetData.keySearch,
      coordinates: {
        lat: ConstantsApp.LAT_DEFAULT,
        lng: ConstantsApp.LNG_DEFAULT,
      },
      paging: {
        page: this.pageNum,
        size: 12,
      },
      sortItem: {
        prop: ConstantsApp.ID,
        type: ConstantsApp.DESC,
      },
    };
  }

  getData() {
    let bodyGetJobDefault = {
      levels: [0],
      paging: {
        page: 1,
        size: 10,
      },
    };
    console.log(this.bodyGetData);

    const functionName = 'getData';
    const messageLog = 'get list jobs';
    const apiModels = [
      new ApiModel(
        'get list jobs',
        environment.API_URI + ApiNameConstants.BS_JOB_SEARCH,
        this.bodyGetData,
        ConstantsApp.POST
      ),
    ];
    if (!this.jobDefaults){
      apiModels.push(new ApiModel(
        'get list job default',
        environment.API_URI + ApiNameConstants.BS_JOB_DEFAULT_SEARCH,
        bodyGetJobDefault,
        ConstantsApp.POST
      ));
    }
    this.commonService.retrieveData(apiModels).subscribe(
      (res) => {
        if (res && res[0] && res[0].data) {
          this.itemsList = res[0].data;
          this.dataSource = res[0];
        } else {
          this.itemsList = [];
          this.dataSource = null;
        }
        if (res && res[1] && res[1].data) {
          this.jobDefaults = res[1].data;
          this.jobSuggest = this.shuffleArray();
          this.updateSuggestions();
        }
        if(this.jobDefaults.length>4){
          this.jobSuggest = this.shuffleArray();
          this.updateSuggestions();
        }
      },
      (error) => {
        this.dataSource = null;
        this.itemsList = [];
        console.error('API error:', error);
      }
    );
  }
  private shuffleArray() {
    console.log('Shuffle');

    const shuffledArray = this.jobDefaults.slice(); // Create a copy of the array to avoid modifying the original
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
  }
  private updateSuggestions() {
    const remainSuggest = this.jobSuggest.filter((item:any) => this.parentId !== item.id);
    this.jobSuggest = remainSuggest.slice(0, 4);
  }

  changePage(currentPage: any) {
    this.pageNum = currentPage;
		// this.router.navigate(['/job'], {
		// 	queryParams: { page: currentPage},
		// 	queryParamsHandling: 'merge'
		// });
    this.buildBodyGetData(null);
    this.getData();
  }
  showDetailItem(item: any) {
    this.detailedItem = item;
  }

	gotoOtherPage(item: any) {
		if (this.authService.isCandidate()) {
			this.router.navigate(['/job'], {
				queryParams: {name: item.name, parentId: item.id},
				// queryParamsHandling: 'merge'
			});
			 // change to slug
		} else {
			this.router.navigate(['/freelancer'], {
				queryParams: {name: item.name},
				queryParamsHandling: 'merge'
			});
		}
	}
	handleSearch() {
    this.router.navigate(['/job'], {
      queryParams: {keyword: this.keySearch},
      queryParamsHandling: 'merge'
    });
    this.init();
	}
}
