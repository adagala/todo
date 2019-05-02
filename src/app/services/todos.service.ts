import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreDocument,
  AngularFirestoreCollection
} from '@angular/fire/firestore';
import * as firebase from 'firebase/app';

interface Todo {
  title?: string;
  timestamp?: any;
  taskcount: any;
  tasks?: any;
  taskid?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TodosService {
  tododoc: AngularFirestoreDocument<Todo>;
  todocol: AngularFirestoreCollection<Todo>;

  constructor(private afs: AngularFirestore) { }

  // add a new todo
  add(userid: string, title: string) {
    const now = firebase.firestore.Timestamp.now();
    this.todocol = this.afs.collection<Todo>(`users/${userid}/todos`);
    return this.todocol.add({ title: title, timestamp: now, taskcount: 0 });
  }

  // delete a todo
  delete(userid: string, todoid: string) {
    this.tododoc = this.afs.doc(`users/${userid}/todos/${todoid}`);
    return this.tododoc.delete();
  }

  // update title of a todo
  update(userid: string, todoid: string, title: string) {
    this.tododoc = this.afs.doc(`users/${userid}/todos/${todoid}`);
    return this.tododoc.update({ title: title });
  }

  // add a task for a todo
  addTask(userid: string, todoid: string, taskname: string) {
    const taskCount = firebase.firestore.FieldValue.increment(1);
    const taskid = this.afs.createId();
    this.tododoc = this.afs.doc(`users/${userid}/todos/${todoid}`);
    return this.tododoc.set(
      {
        taskcount: taskCount,
        'tasks': {
          [`${taskid}`]: {
            name: taskname,
            complete: false,
            taskid: `${taskid}`
          }
        }
      },
      { merge: true }
    );
  }
}
