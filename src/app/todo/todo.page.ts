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
  // us: Subscription; // User auth subscription
  _us: Subscription;

  uid: string;

  @ViewChild(CdkVirtualScrollViewport)
  viewport: CdkVirtualScrollViewport;

  batch = 20;
  theEnd = false;

  offset = new BehaviorSubject(null);
  infinite: Observable<any[]>;

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
      const batchMap = this.offset.pipe(
        throttleTime(500),
        mergeMap(n => this.getBatch(n, user.uid)),
        scan((acc, batch) => {
          return { ...acc, ...batch };
        }, {})
      );
      this.infinite = batchMap.pipe(map(v => Object.values(v)));
    });
  }

  ngOnDestroy() {
    // if (this.us) { this.us.unsubscribe(); }
    if (this._us) {
      this._us.unsubscribe();
    }
  }

  async todoActionSheet(todoid: string) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Todo Actions',
      buttons: [
        {
          text: 'Complete',
          icon: 'done-all',
          handler: async () => {
            await this.ts.updatestate(this.uid, todoid, true);
            return this.presentToast('Todo Completed');
          }
        },
        {
          text: 'Pending',
          icon: 'refresh',
          handler: async () => {
            await this.ts.updatestate(this.uid, todoid, false);
            return this.presentToast('Todo Pending');
          }
        },
        {
          text: 'Update',
          icon: 'create',
          handler: () => {
            this.router.navigateByUrl('todo/update');
          }
        },
        {
          text: 'Delete',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.confirmDelete(todoid);
          }
        }
      ]
    });
    await actionSheet.present();
  }

  gotoAddTodo() {
    this.router.navigateByUrl('todo/add');
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
            await this.ts.delete(this.uid, todoid);
            return this.presentToast('Todo Deleted');
          }
        }
      ]
    });

    await alert.present();
  }

  async filterActionSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'View Options',
      buttons: [
        {
          text: 'Complete Todos',
          icon: 'done-all',
          handler: () => {
            console.log('Complete filter');
          }
        },
        {
          text: 'Pending Todos',
          icon: 'refresh',
          handler: () => {
            console.log('Pending filter');
          }
        }
      ]
    });
    await actionSheet.present();
  }

  clearFilter() {
    console.log('Clear Filter');
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
          .orderBy('title', 'desc')
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
