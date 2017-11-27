import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

export interface SeoData {
  title?: string[];
  description?: string;
}

@Injectable()
export class SeoService {
  // This part is happended at the end of head>title
  private siteTitle = 'RxJS Documentation';

  constructor(private _title: Title, private _meta: Meta) {}

  public setHeaders(data: SeoData) {
    this._title.setTitle([...data.title, this.siteTitle].join(' \u2022 '));
    if (data.description && data.description.length) {
      this._meta.updateTag({
        content: data.description,
        name: 'description'
      });
    }
  }
}
