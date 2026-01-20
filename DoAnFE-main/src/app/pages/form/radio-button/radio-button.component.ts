import { Component, OnInit, Input, Output, OnChanges } from "@angular/core";
import { EventEmitter } from "@angular/core";
import { Constants } from 'src/app/constant/Constants';

@Component({
    selector: 'app-radio-button',
    styleUrls: ['./radio-button.component.css'],
    templateUrl: './radio-button.component.html'
})
export class RadioButtonComponent implements OnInit, OnChanges{
    @Input() items: any;
    @Output() radioOnChecked = new EventEmitter();
    searchJobLbl = Constants.searchJobLbl;
    recruitLbl = Constants.recruitLbl;
    ngOnInit(): void {
        // console.log(JSON.stringify(this.items))
    }
    ngOnChanges(): void {
        // console.log(JSON.stringify(this.items))
    }
    onChecked(item: any): void {
        console.log('app-radio-button: ', item);
        this.radioOnChecked.emit(item);
    }
}
