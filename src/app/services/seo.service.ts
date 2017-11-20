import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Injectable()
export class SeoService {
  // This part is happended at the end of head>title
  private siteTitle = 'RxJS Documentation';

  constructor(private _title: Title, private _meta: Meta) {}

  public setHeaders(titleParts: string[], description: string) {
    this._title.setTitle([...titleParts, this.siteTitle].join(' \u2022 '));
    if (description && description.length) {
      this._meta.updateTag({
        content: description,
        name: 'description'
      });
    }
  }
}
