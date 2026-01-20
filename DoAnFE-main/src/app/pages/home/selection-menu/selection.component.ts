import {
    Component,
    OnInit,
    Input,
    Output,
    OnChanges,
    SimpleChanges,
    ViewChild,
    ElementRef,
  } from '@angular/core';
  import { EventEmitter } from '@angular/core';

  @Component({
    selector: 'app-selection',
    styleUrls: ['./selection.component.css'],
    templateUrl: './selection.component.html',
  })
  export class SelectionComponent implements OnInit, OnChanges {
    @ViewChild('searchInputField') searchInputField: ElementRef;
    /**
     * items = [{name, code}]
     */
    @Input() items: any;
    @Input() isDisable: any;
    @Input() selectedItem: any;
    @Input() isNotPadding: any;
    @Input() placeholder: any;
    @Input() pageMenu: any;
    @Output() onChangeSelected = new EventEmitter();
    @Output() refetchMenu = new EventEmitter();
    @Output() refetchScrollMenu = new EventEmitter();
    //=======================================
    @Output() optionSelected = new EventEmitter<string[]>();
    searchInput: string = '';
    isShowDropDown: boolean= false;
    blurTimeout: any;
    filteredItems: any[] = [];
    //=======================================


    constructor(
    ) {}

    ngOnInit(): void {
      console.log(this.isNotPadding);
      console.log(this.isShowDropDown);
    }
    ngOnChanges(changes: SimpleChanges): void {
      if (changes['items'] && this.items) {
        // Update filteredItems whenever items changes
        this.filteredItems = [...this.items];
        this.onInputChange(null);
        // if(this.items) {
        //   this.isShowDropDown = true;
        // }
      }
      if (changes['selectedItem']) {
        this.searchInput = this.selectedItem?.name ? this.selectedItem.name : '';
        if(this.selectedItem != null){
          this.isShowDropDown = false;
        }
      }
    }

    // onSelected(event: any) {
    //   let code = event.target.value;
    //   this.onChangeSelected.emit(code);
    // }

    // isSelected(item: any) {
    //   if (!item || !item.id) return false;
    //   if (!this.selectedItem) {
    //     this.selectedItem = this.items[0];
    //   }
    //   return item && (item.id == this.selectedItem.id);
    // }
    onInputChange(event: any): void {
      this.searchInput = event != null ? event.target.value : this.searchInput;
      if(this.searchInput == null || this.searchInput == '') {
        this.filteredItems=[...this.items];
      }
      else{
        this.filteredItems = this.items.filter((item: any) =>
          item.name.toLowerCase().includes(this.searchInput.toLowerCase())
        );
        if(this.filteredItems.length == 0) {
          this.refetchMenu.emit({searchInput: this.searchInput, filteredItems: this.filteredItems});
          this.filteredItems = this.items.filter((item: any) =>
          item.name.toLowerCase().includes(this.searchInput.toLowerCase())
        );
        }
      }
      // Show the dropdown if there are filtered items
      // this.isShowDropDown = this.filteredItems.length > 0;

      // Clear the blur timeout to prevent hiding the dropdown
      clearTimeout(this.blurTimeout);
    }
    onInputBlur(): void {
      // Delay hiding the dropdown to capture mousedown event on dropdown option
      this.blurTimeout = setTimeout(() => {
        this.isShowDropDown = false;
      }, 100);
    }
    selectOption(option: any): void {
      clearTimeout(this.blurTimeout); // Clear the blur timeout to prevent hiding the dropdown
      this.searchInput = option.name; // Update the searchInput with the selected item's name
      this.isShowDropDown = false;
      this.searchInputField.nativeElement.focus();
      this.onChangeSelected.emit(option);
    }
    clearSearchInput(){
      this.onChangeSelected.emit(null);
      this.searchInput = '';
      this.filteredItems = [];
      this.onInputChange(null);
    }

    onScroll(event:any) {
        const element = event.target;
        if (element.scrollTop + element.clientHeight >= element.scrollHeight) {
              this.pageMenu++;
              this.refetchScrollMenu.emit({paging:this.pageMenu});
            } 
          }
 }



