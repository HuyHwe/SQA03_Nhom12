import { Component, OnInit, Input, Output, OnChanges, SimpleChanges } from "@angular/core";
import { EventEmitter } from "@angular/core";
import { UtilsService } from '../../../helper/service/utils.service';
import * as $ from 'jquery';

@Component({
    selector: 'app-text-input',
    styleUrls: ['./text-input.component.css'],
    templateUrl: './text-input.component.html'
})
export class TextInputComponent implements OnInit, OnChanges {
    @Input() item: any;
    @Input() isRequired: any;
    @Output() inputOnchange = new EventEmitter();
    @Output() inputOnChangePass = new EventEmitter();
    @Output() inputOnClick = new EventEmitter();

    @Input() inputVal: any = '';
    @Input() inputPasswordVal: any;
    iconName = '';
    currentItem = {
        val: '',
        placeholderVal: '',
        iconName: '',
        type: '',
        label:''
    }
    testval = '';
    constructor(private utilsService: UtilsService) {
        try {
            if (!this.utilsService.isEmpty(this.item)) {
                this.currentItem  = JSON.parse(this.item);
                this.iconName = this.currentItem.iconName;
            }
        } catch (error) {
            // console.log(error);
        }
    }
    ngOnChanges(changes: SimpleChanges): void {
        // console.log(changes);
    }
    ngOnInit(): void {
        try {
            if (!this.utilsService.isEmpty(this.item)) {
                this.currentItem  = JSON.parse(this.item);
                this.iconName = this.currentItem.iconName;
            }
        } catch (error) {
            // console.log(error);
        }
    }

    onClick(event:any) {
        let val = (event.target as HTMLInputElement).value;
        this.inputOnClick.emit(val);
    }
    // doStyle(iconName: string) {
    //     let input = $('.input-wrapper input');
    //     let iTag = $('.text-input i');
    //     switch(iconName) {
    //         case 'search': 
    //             input.removeClass('inputNoIcon');
    //             input.addClass('inputIcon'); 
    //             iTag.removeClass('fa-solid fa-location-dot');
    //             iTag.addClass('fa-solid fa-magnifying-glass');
    //             break;
    //         case 'address': 
    //             input.removeClass('inputNoIcon');
    //             input.addClass('inputIcon'); 
    //             iTag.removeClass('fa-solid fa-magnifying-glass');
    //             iTag.addClass('fa-solid fa-location-dot');
    //             break;
    //         default:
    //             input.removeClass('inputIcon');
    //             iTag.removeClass('fa-solid fa-magnifying-glass');
    //             iTag.removeClass('fa-solid fa-location-dot');
    //             input.addClass('inputNoIcon'); break;
    //     }
    // }

    onChangeText(event: Event): void {
        let val = (event.target as HTMLInputElement).value;
        this.inputVal = val;
        this.inputOnchange.emit(val);
    }
    onChangePass(event: Event): void {
        let val = (event.target as HTMLInputElement).value;
        this.inputPasswordVal = val;
        this.inputOnChangePass.emit(val);
    }
    getValue(event: Event): string {
        return (event.target as HTMLInputElement).value;
    }
    isRedBorderTxt() {
        if (this.isRequired == true && this.isEmpty(this.inputVal)) {
            return true;
        } 
        return false;
    }
    isRedBorderPass() {
        if (this.isRequired == true && this.isEmpty(this.inputPasswordVal)) {
            return true;
        } 
        return false;
    }
    
    isEmpty(val: any) {
        return val == null || val == '' || val == undefined;
    }
}