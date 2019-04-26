import { Component, OnDestroy, ViewChild } from '@angular/core';
import {
  ActionSheetController,
  AlertController,
  ToastController
} from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PaginationService } from '../services/pagination.service';
import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import { TodosService } from '../services/todos.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { AngularFirestore } from '@angular/fire/firestore';
import { tap, map, throttleTime, mergeMap, scan } from 'rxjs/operators';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.page.html',
  styleUrls: ['./todo.page.scss']
})
export class TodoPage implements OnDestroy {
  _us: Subscription;

  uid: string;

  @ViewChild(CdkVirtualScrollViewport)
  viewport: CdkVirtualScrollViewport;

  batch = 20;
  theEnd = false;

  offset = new BehaviorSubject(null);
  infinite: Observable<any[]>;
  filter = false;

  constructor(
    private afs: AngularFirestore,
    public actionSheetCtrl: ActionSheetController,
    private router: Router,
    public alertController: AlertController,
    public auth: AuthService,
    public page: PaginationService,
    private ts: TodosService,
    public toastController: ToastController
  ) {
    this._us = this.auth.user$.subscribe(user => {
      this.uid = user.uid;
      this.initialBatch(user.uid);
    });
  }

  initialBatch(userid: string) {
    const batchMap = this.offset.pipe(
      throttleTime(500),
      mergeMap(n => this.getBatch(n, userid)),
      scan((acc, batch) => {
        return { ...acc, ...batch };
      }, {})
    );
    this.infinite = batchMap.pipe(map(v => Object.values(v)));
  }

  ngOnDestroy() {
    if (this._us) {
      this._us.unsubscribe();
    }
  }

  async todoActionSheet(todoId: string, todoTitle: string) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Todo Actions',
      buttons: [
        {
          text: 'Complete',
          icon: 'done-all',
          handler: async () => {
            await this.ts.updatestate(this.uid, todoId, true);
            return this.presentToast('Todo Completed');
          }
        },
        {
          text: 'Pending',
          icon: 'refresh',
          handler: async () => {
            await this.ts.updatestate(this.uid, todoId, false);
            return this.presentToast('Todo Pending');
          }
        },
        {
          text: 'Update',
          icon: 'create',
          handler: () => {
            this.todoUpdate(todoId, todoTitle);
          }
        },
        {
          text: 'Delete',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.confirmDelete(todoId);
          }
        }
      ]
    });
    await actionSheet.present();
  }

  async todoUpdate(todoId: string, todoTitle: string) {
    const alert = await this.alertController.create({
      header: 'Update Todo',
      inputs: [
        {
          name: 'todo',
          type: 'text',
          value: todoTitle,
          placeholder: 'Todo'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => { }
        }, {
          text: 'Update',
          handler: async data => {
            if (data.todo === undefined || data.todo === '') {
              this.presentToast('Cannot update an Empty Todo');
              return;
            }
            if (data.todo === todoTitle) { return; }
            await this.ts.update(this.uid, todoId, data.todo);
            return this.presentToast('Todo Updated');
          }
        }
      ]
    });

    await alert.present();
  }

  async todoAdd() {
    const alert = await this.alertController.create({
      header: 'Add Todo',
      inputs: [
        {
          name: 'todo',
          type: 'text',
          placeholder: 'Todo'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => { }
        }, {
          text: 'Ok',
          handler: async data => {
            if (data.todo === undefined || data.todo === '') {
              this.presentToast('Cannot add an Empty Todo');
              return;
            }
            this.infinite = undefined;
            this.offset = new BehaviorSubject(null);
            await this.ts.add(this.uid, data.todo);
            return this.initialBatch(this.uid);
          }
        }
      ]
    });

    await alert.present();
  }

  async confirmDelete(todoid: string) {
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: 'Are you sure you want to delete?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Delete',
          handler: async () => {
            await this.hideTodoOnDelete(todoid);
            await this.ts.delete(this.uid, todoid);
            return this.presentToast('Todo Deleted');
          }
        }
      ]
    });

    await alert.present();
  }

  hideTodoOnDelete(todoid: string) {
    return document.getElementById(todoid).style.display = 'none';
  }

  async filterActionSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'View Options',
      buttons: [
        {
          text: 'Complete Todos',
          icon: 'done-all',
          handler: () => {
            this.filter = true;
            this.infinite = undefined;
            this.offset = new BehaviorSubject(null);
            const batchMap = this.offset.pipe(
              throttleTime(500),
              mergeMap(n => this.getFilterBatch(n, this.uid, true)),
              scan((acc, batch) => {
                return { ...acc, ...batch };
              }, {})
            );
            this.infinite = batchMap.pipe(map(v => Object.values(v)));
          }
        },
        {
          text: 'Pending Todos',
          icon: 'refresh',
          handler: () => {
            this.filter = true;
            this.infinite = undefined;
            this.offset = new BehaviorSubject(null);
            const batchMap = this.offset.pipe(
              throttleTime(500),
              mergeMap(n => this.getFilterBatch(n, this.uid, false)),
              scan((acc, batch) => {
                return { ...acc, ...batch };
              }, {})
            );
            this.infinite = batchMap.pipe(map(v => Object.values(v)));
          }
        }
      ]
    });
    await actionSheet.present();
  }

  clearFilter() {
    this.filter = false;
    this.infinite = undefined;
    this.offset = new BehaviorSubject(null);
    this.initialBatch(this.uid);
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Logout',
          handler: async () => {
            await this.auth.signOut();
            return this.router.navigateByUrl('login');
          }
        }
      ]
    });

    await alert.present();
  }

  async presentToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 1500,
      position: 'bottom'
    });
    toast.present();
  }

  loadData(event: { target: { complete: () => void } }) {
    this.page.more();
    if (this.page.done) {
      event.target.complete();
    }
  }

  getBatch(offset: any, userid: string) {
    return this.afs
      .collection(`users/${userid}/todos`, ref =>
        ref
          .orderBy('title')
          .startAfter(offset)
          .limit(this.batch)
      )
      .snapshotChanges()
      .pipe(
        tap(arr => (arr.length ? null : (this.theEnd = true))),
        map(arr => {
          return arr.reduce((acc, cur) => {
            const id = cur.payload.doc.id;
            const data = cur.payload.doc.data();
            data['tid'] = id;
            return { ...acc, [id]: data };
          }, {});
        })
      );
  }

  getFilterBatch(offset: any, userid: string, filter: boolean) {
    return this.afs
      .collection(`users/${userid}/todos`, ref =>
        ref
          .orderBy('title')
          .startAfter(offset)
          .limit(this.batch)
          .where('complete', '==', filter)
      )
      .snapshotChanges()
      .pipe(
        tap(arr => (arr.length ? null : (this.theEnd = true))),
        map(arr => {
          return arr.reduce((acc, cur) => {
            const id = cur.payload.doc.id;
            const data = cur.payload.doc.data();
            data['tid'] = id;
            return { ...acc, [id]: data };
          }, {});
        })
      );
  }

  nextBatch(e: any, offset: any) {
    if (this.theEnd) {
      return;
    }

    const end = this.viewport.getRenderedRange().end;
    const total = this.viewport.getDataLength();
    if (end === total) {
      this.offset.next(offset);
    }
  }

  trackByIdx(i: any) {
    return i;
  }
}
