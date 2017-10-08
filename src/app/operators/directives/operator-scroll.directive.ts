import { Directive, OnInit, OnDestroy, Output, EventEmitter, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';

/*
 *  Modified version of Material Design Docs ToC
 */
interface OperatorHeader {
  id: string;
  active: boolean;
  name: string;
  top: number;
}

@Directive({
  selector: '[appOperatorScroll]'
})
export class OperatorScrollDirective implements OnInit, OnDestroy {
  @Output() activeOperator = new EventEmitter<string>();

  private _headers: OperatorHeader[] = [];
  private _scrollSubscription: Subscription;
  private _scrollContainer: any;
  private readonly scrollContainerSelector = '.mat-drawer-content';
  private readonly headerSelector = '.operator-header';

  constructor(
    @Inject(DOCUMENT) private _document: Document
  ) {}

  /** Gets the scroll offset of the scroll container */
  private getScrollOffset(): number {
    const {top} = this._scrollContainer.getBoundingClientRect();
    if (typeof this._scrollContainer.scrollTop !== 'undefined') {
      return this._scrollContainer.scrollTop + top;
    } else if (typeof this._scrollContainer.pageYOffset !== 'undefined') {
      return this._scrollContainer.pageYOffset + top;
    }
  }

  private createHeaderLinks(): OperatorHeader[] {
    const links: OperatorHeader[] = [];
    const headers =
        Array.from(this._document.querySelectorAll(this.headerSelector)) as HTMLElement[];

    if (headers.length) {
      for (const header of headers) {
        const name = header.id;
        const { top } = header.getBoundingClientRect();
        links.push({
          name,
          top: top,
          id: name,
          active: false
        });
      }
    }

    return links;
  }

  private determineActiveOperator(): string {
    // Use find to break out as soon as we find active header
    const { name } = this._headers
      .find((h, i) => this.isHeaderActive(this._headers[i], this._headers[i + 1]));

    return name;
  }

  private isHeaderActive(currentLink: any, nextLink: any): boolean {
    // switch slightly early to accomodate scrollIntoView from sidemenu
    const scrollOffset = this.getScrollOffset() + 5;
    return scrollOffset >= currentLink.top && !(nextLink && nextLink.top < scrollOffset);
  }

  ngOnInit(): void {
    // On init, the sidenav content element doesn't yet exist, so it's not possible
    // to subscribe to its scroll event until next tick (when it does exist).
      Promise.resolve().then(() => {
        this._headers = this.createHeaderLinks();
        this._scrollContainer = this.scrollContainerSelector ?
          document.querySelectorAll(this.scrollContainerSelector)[0] : window;

        this._scrollSubscription = fromEvent(this._scrollContainer, 'scroll')
          .map(_ => this.determineActiveOperator())
          .distinctUntilChanged()
          .subscribe((name: string) => this.activeOperator.emit(name));
      });
  }

  ngOnDestroy(): void {
    this._scrollSubscription.unsubscribe();
  }
}
