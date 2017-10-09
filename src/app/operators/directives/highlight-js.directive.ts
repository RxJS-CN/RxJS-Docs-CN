import { Directive, ElementRef, Input, OnInit, AfterViewChecked, NgZone } from '@angular/core';

declare var hljs: any;

/*
 *  Modified from Angular2 Highlight Package
 *  (https://github.com/jaychase/angular2-highlight-js)
 */
@Directive({
    selector: '[appHighlightJs]'
})
export class HighlightJsDirective implements AfterViewChecked {
    private _done: boolean;

    constructor(
      private elementRef: ElementRef,
      private zone: NgZone
    ) {}

    ngAfterViewChecked() {
        if (!this._done) {
            if (this.elementRef.nativeElement.innerHTML && this.elementRef.nativeElement.querySelector) {
                const snippets = this.elementRef.nativeElement.querySelectorAll('pre');
                this.zone.runOutsideAngular(() => {
                    for (const snippet of snippets) {
                        hljs.highlightBlock(snippet);
                    }
                });
                this._done = true;
            }
        }
    }
}
