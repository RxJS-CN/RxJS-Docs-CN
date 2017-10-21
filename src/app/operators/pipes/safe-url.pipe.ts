import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({name: 'safeUrl'})
export class SafeUrlPipe implements PipeTransform {
  constructor(private _sanitizer: DomSanitizer) {}

  transform(url: string) {
    if (!url) {
      return url;
    }
    return this._sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
