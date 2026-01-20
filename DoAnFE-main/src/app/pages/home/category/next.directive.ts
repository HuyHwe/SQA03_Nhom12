import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appNext]'
})
export class NextDirective {
  constructor(private el: ElementRef) {
  }

  /**
   * can listen hover event
   */
  @HostListener('click')
  nextFunc() {
    let elm = this.el.nativeElement.parentElement.parentElement.children[0].children[1];
    let items = elm.getElementsByClassName('item');
    elm.append(items[0]);
  }
}
