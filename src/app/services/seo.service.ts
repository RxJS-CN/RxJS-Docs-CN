import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Injectable()
export class SeoService {
  // This part is happended at the end of head>title
  private siteTitle = 'RxJS Documentation';

  // head>meta>description for common pages
  public homeDescription = 'The complete RxJS documentation...';
  public operatorsDescription = 'All the RxJS operators...';
  public companiesDescription = 'Companies that use RxJS...';
  public teamDescription = 'People behind the RxJS Documentation project...';

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
