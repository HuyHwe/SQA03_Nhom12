import { Component, OnInit, Input, Output, OnChanges, SimpleChanges } from "@angular/core";
import { EventEmitter } from "@angular/core";

@Component({
    selector: 'app-dropdown-list',
    styleUrls: ['./dropdown-list.component.css'],
    templateUrl: './dropdown-list.component.html'
})
export class DropdownListComponent implements OnInit, OnChanges {
    @Input() items: any;
    @Output() onChangeSelected = new EventEmitter();
    isDropdown: boolean = true;
    currentItems!:{};
    ngOnInit(): void {
        this.currentItems = this.items;
    }
    onSelected(item: any) {
        this.onChangeSelected.emit(item);
    }

    ngOnChanges() {
        this.currentItems = this.items;
    }
    onDropdown(val: any): void {
        if (val) {
            this.items = val;
        }
        this.isDropdown = !this.isDropdown;
    }
    closeDropdown(): void {
        this.isDropdown = false;
    }
//   ngAfterViewInit(): void {
//     document.onclick = (args: any) : void => {
//         let classList = args.target.classList;
//         let isTurnOn = classList.contains('dropdown-wrapper') && args.target.id == 'text-input-id';
//         // let isTurnOn = classList.contains('dropdown-wrapper') && classList.contains('list-items')  && classList.contains('list-items');
//         if(isTurnOn == false) {
//             this.closeDropdown();
//         }
//     }
//   }
}   