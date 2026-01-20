import { Component, OnInit, Input, Output, OnChanges } from '@angular/core';
import { EventEmitter } from "@angular/core";

@Component({
    selector: 'app-dropdown',
    styleUrls: ['./dropdown.component.css'],
    templateUrl: './dropdown.component.html'
})
export class DropdownComponent {
    @Input() items: any;
    @Output() onChangeSelected = new EventEmitter();
    isDropdown: boolean = false;
    currentItems!:{};
    
    ngOnInit(): void {
        this.currentItems = this.items;
    }

    onDropdown(): void {
        // todo
        this.isDropdown = !this.isDropdown;
    }

    clickOutside(): void {
        this.isDropdown = false;
    }

    onSelected(item: any) {
        this.onChangeSelected.emit(item);
    }
}   