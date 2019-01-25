import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreDocument,
  AngularFirestoreCollection
} from '@angular/fire/firestore';

interface IUser {
  title: string;
  complete: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TodosService {
  userdoc: AngularFirestoreDocument<IUser>;
  usercol: AngularFirestoreCollection<IUser>;

  constructor(private afs: AngularFirestore) {}

  // add a new todo
  add(userid: string, title: string) {
    this.usercol = this.afs.collection<IUser>(`users/${userid}/todos`);
    return this.usercol.add({ title: title, complete: false });
  }

  // delete a todo
  delete(userid: string, todoid: string) {
    this.userdoc = this.afs.doc(`users/${userid}/todos/${todoid}`);
    return this.userdoc.delete();
  }

  // update title of a todo
  update(userid: string, todoid: string, title: string) {
    this.userdoc = this.afs.doc(`users/${userid}/todos/${todoid}`);
    return this.userdoc.update({ title: title });
  }

  // update the complete state of a todo
  updatestate(userid: string, todoid: string, state: boolean) {
    this.userdoc = this.afs.doc(`users/${userid}/todos/${todoid}`);
    return this.userdoc.update({ complete: state });
  }
}
