import { Directive, 
    ElementRef, 
    Inject, 
    Output, 
    EventEmitter,
    OnDestroy,
    AfterViewInit
} from "@angular/core";
// import { event } from "jquery";
import { filter, fromEvent, Subscription } from "rxjs";

@Directive({
    selector: '[clickOutside]'
})
export class ClickOutsideDirective implements AfterViewInit, OnDestroy {
    @Output() clickOutside = new EventEmitter<void>();
    documentClickSubscription: Subscription | undefined;
    constructor(private element: ElementRef, @Inject(Document) private document: Document) {}
    ngAfterViewInit(): void {
        // this.documentClickSubscription = fromEvent(this.document, 'click').pipe(filter(event) => {
        //     return !this.isInside(event?.target as HTMLElement);
        // }).subscribe(() => {
        //     this.clickOutside.emit();
        // })

        // this.documentClickSubscription = fromEvent(this.document, 'click').pipe(filter(event) => {
        //     return !this.isInside(event?.target as HTMLElement);
        // }).subscribe(() => {
        //     this.clickOutside.emit();
        // })
    }

    ngOnDestroy(): void {
        this.documentClickSubscription?.unsubscribe();
    }
    isInside(elementToCheck: HTMLElement): boolean {
        return (
            elementToCheck === this.element.nativeElement || this.element.nativeElement.contains(elementToCheck)
        );
    }
}