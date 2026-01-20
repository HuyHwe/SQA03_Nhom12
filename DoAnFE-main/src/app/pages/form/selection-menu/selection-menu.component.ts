import {
    Component,
    OnInit,
    Input,
    Output,
    OnChanges,
    SimpleChanges,
  } from '@angular/core';
  import { EventEmitter } from '@angular/core';

  @Component({
    selector: 'app-selection-menu',
    styleUrls: ['./selection-menu.component.css'],
    templateUrl: './selection-menu.component.html',
  })
  export class SelectionMenu implements OnInit, OnChanges {
    /**
     * items = [{name, code}]
     */
    @Input() items: any;
    @Input() isDisable: any;
    @Input() selectedItem: any;
    @Input() isNotPadding: any;
    @Input() placeholder: any;
    @Output() onChangeSelected = new EventEmitter();

    constructor() {}

    ngOnInit(): void {
      // console.log(this.isNotPadding);
    }

    ngOnChanges(changes: SimpleChanges): void {
      console.log(this.selectedItem);
    }

    onSelected(event: any) {
      let code = event.target.value;
      this.onChangeSelected.emit(code);
    }

    isSelected(item: any) {
      if (!item || (!item.code && !item.id)) return false;
      if (!this.selectedItem) {
        this.selectedItem = this.items[0];
      }
      return item &&
        ((item.code && item.code == this.selectedItem.code)
          || (item.id && item.id == this.selectedItem.id));
    }
  }
