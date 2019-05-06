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

  selection = false;
  todosSelected: Array<any> = new Array<any>();

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
                const isSelected = false;
                return { tid, isSelected, ...data };
              });
            })
          );
      }
    });
  }

  ngOnDestroy() {
    this._us.unsubscribe();
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
      header: 'New Todo',
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
          text: 'Add',
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
            await this.router.navigateByUrl('login');
            return this.auth.signOut();
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

  press(todo: any) {
    if (todo.isSelected) {
      for (let i = 0; i < this.todosSelected.length; i++) {
        if (this.todosSelected[i].tid === todo.tid) {
          this.todosSelected.splice(i, 1);
        }
      }
      todo.isSelected = false;
      this.selection = this.todosSelected.length < 1 ? false : true;
    } else {
      this.todosSelected.push(todo);
      todo.isSelected = true;
      this.selection = true;
    }
  }

  unSelect() {
    this.selection = false;
    this.todosSelected.forEach(todo => {
      todo.isSelected = false;
    });
    this.todosSelected.length = 0;
  }

  async deleteTodos() {
    this.selection = false;
    await this.todosSelected.forEach(todo => {
      todo.isSelected = false;
      this.ts.delete(this.uid, todo.tid);
    });
    this.todosSelected.length = 0;
    return this.presentToast('Todos Deleted');
  }

  async confirmDelete() {
    const msg = this.todosSelected.length === 1 ?
      'Delete this conversation?' :
      `Delete these ${this.todosSelected.length} conversations?`;
    const alert = await this.alertController.create({
      message: msg,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Delete',
          handler: async () => {
            this.deleteTodos();
          }
        }
      ]
    });

    await alert.present();
  }
}
