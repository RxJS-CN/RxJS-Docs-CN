import { Injectable } from "@angular/core";
import { AngularFireDatabase, AngularFireList } from "angularfire2/database";
import * as firebase from "firebase";
import { Observable } from "rxjs/Observable";

@Injectable()
export class CompanyService {
  constructor(private db: AngularFireDatabase) {}
  basePath = "uploads";
  uploadsRef: AngularFireList<any>;
  uploads: Observable<any[]>;
  // Executes the file uploading to firebase https://firebase.google.com/docs/storage/web/upload-files

  pushUpload(upload: any) {
    const storageRef = firebase.storage().ref();
    const uploadTask = storageRef
      .child(`${this.basePath}/${upload.name}`)
      .put(upload);
    return uploadTask;
  }
}
