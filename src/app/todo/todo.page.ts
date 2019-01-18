import { Component, OnInit } from '@angular/core';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.page.html',
  styleUrls: ['./todo.page.scss'],
})
export class TodoPage implements OnInit {
  constructor(
    public actionSheetCtrl: ActionSheetController,
    private router: Router,
    public alertController: AlertController) {}

  ngOnInit() {}

  async todoActionSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Todo Actions',
      buttons: [
        {
          text: 'Complete',
          icon: 'done-all',
          handler: () => {
            console.log('Complete');
          }
        },
        {
          text: 'Pending',
          icon: 'refresh',
          handler: () => {
            console.log('Pending');
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
            this.confirmDelete();
          }
        }
      ]
    });
    await actionSheet.present();
  }

  gotoAddTodo() {
    this.router.navigateByUrl('todo/add');
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
        }, {
          text: 'Delete',
          handler: () => {
            console.log('Deleted todo');
          }
        }
      ]
    });

    await alert.present();
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: 'Logout',
          handler: () => {
            this.router.navigateByUrl('login');
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

}
