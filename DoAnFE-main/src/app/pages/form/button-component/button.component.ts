import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { filter, fromEvent, Subscription } from "rxjs";
import { UtilsService } from '../../../helper/service/utils.service';
import * as $ from 'jquery';

@Component({
    selector: 'app-button',
    styleUrls: ['./button.component.css'],
    templateUrl: './button.component.html'
})
export class ButtonComponent implements OnInit{
    @Input() item = '';
    @Output() btnClick = new EventEmitter();
    iconName = '';
    currentItem!: {
        val: '',
        placeholderVal: '',
        iconName: ''
    }
    constructor(private utilsService: UtilsService) {
        
    }

    ngOnInit(): void {
        
    }

    onChange(event: Event): void {
        this.btnClick.emit();
    }
}