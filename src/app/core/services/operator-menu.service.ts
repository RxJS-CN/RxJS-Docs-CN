import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class OperatorMenuService {
  private _operatorMenuStatus = new Subject<boolean>();

  openOperatorMenu() {
    this._operatorMenuStatus.next(true);
  }

  closeOperatorMenu() {
    this._operatorMenuStatus.next(false);
  }

  menuStatus() {
    return this._operatorMenuStatus.asObservable();
  }
}
