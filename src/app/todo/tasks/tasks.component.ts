import { Component, OnDestroy } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { TodosService } from 'src/app/services/todos.service';
import { Subscription, Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnDestroy {

  uid: string;
  _task: Subscription;
  todoid: string;
  private todoDoc: AngularFirestoreDocument<any>;
  todo: Observable<any>;

  constructor(
    private alertController: AlertController,
    private ts: TodosService,
    private toastController: ToastController,
    public auth: AuthService,
    private activatedroute: ActivatedRoute,
    private router: Router,
    private afs: AngularFirestore
  ) {
    this.todoid = this.activatedroute.snapshot.paramMap.get('todoid');
    this._task = this.auth.user$.subscribe(user => {
      if (user) {
        this.uid = user.uid;
        this.todoDoc = this.afs.doc<any>(`users/${user.uid}/todos/${this.todoid}`);
        this.todo = this.todoDoc.snapshotChanges()
          .pipe(
            map(val => {
              const todo = val.payload.data();
              const tasks = val.payload.data().tasks || {};
              const array_tasks = Object.values(tasks);
              return { array_tasks, ...todo };
            })
          );
      }
    });
  }

  ngOnDestroy() {
    this._task.unsubscribe();
  }

  async confirmDelete() {
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
            await this.ts.delete(this.uid, this.todoid);
            await this.router.navigateByUrl('/todo');
            return this.presentToast('Todo Deleted');
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

  async addTask() {
    const alert = await this.alertController.create({
      header: 'New Task',
      inputs: [
        {
          name: 'task',
          type: 'text',
          placeholder: 'Task'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => { }
        }, {
          text: 'ADD',
          handler: async data => {
            if (data.task === undefined || data.task === '') {
              this.presentToast('Cannot add an Empty Task');
              return;
            }
            await this.ts.addTask(this.uid, this.todoid, data.task);
            return this.presentToast('Task Added');
          }
        }
      ]
    });

    await alert.present();
  }

  updateTitle(e: any) {
    if (e.detail.value === undefined || e.detail.value === '') {
      return;
    }
    return this.ts.update(this.uid, this.todoid, e.detail.value);
  }

  updateTaskState(e: any, taskid: string) {
    return this.ts.updateTaskState(this.uid, this.todoid, taskid, e.detail.checked);
  }

  updateTaskName(e: any, taskid: string) {
    const taskname = e.detail.value;
    if (taskname === '' || taskname === undefined) {
      return this.deleteTask(taskid);
    }
    return this.ts.updateTaskName(this.uid, this.todoid, taskid, taskname);
  }

  deleteTask(taskid: string) {
    return this.ts.deleteTask(this.uid, this.todoid, taskid);
  }
}
