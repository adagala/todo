import { Component, OnDestroy } from '@angular/core';
import {
  ActionSheetController,
  AlertController,
  ToastController
} from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PaginationService } from '../services/pagination.service';
import { Subscription, Observable } from 'rxjs';
import { TodosService } from '../services/todos.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.page.html',
  styleUrls: ['./todo.page.scss']
})
export class TodoPage implements OnDestroy {
  _us: Subscription;

  uid: string;
  todos: Observable<any>;

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
      if (user) {
        this.uid = user.uid;
        this.todos = this.afs
          .collection<any>(`users/${user.uid}/todos`, ref => ref.orderBy('timestamp', 'desc'))
          .snapshotChanges()
          .pipe(
            map(actions => {
              return actions.map(a => {
                const data = a.payload.doc.data();
                const tid = a.payload.doc.id;
                return { tid, ...data };
              });
            })
          );
      }
    });
  }

  ngOnDestroy() {
    if (this._us) {
      this._us.unsubscribe();
    }
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
            await this.ts.add(this.uid, data.todo);
            return this.presentToast('Todo Added');
          }
        }
      ]
    });

    await alert.present();
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

  viewTasks(todoid: string) {
    this.router.navigateByUrl(`todo/${todoid}/tasks`);
  }
}
