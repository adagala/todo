import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { TodoPage } from './todo.page';
import { AddtodoComponent } from './addtodo/addtodo.component';
import { UpdatetodoComponent } from './updatetodo/updatetodo.component';
import { ScrollingModule } from '@angular/cdk/scrolling';

const routes: Routes = [
  {
    path: '',
    component: TodoPage
  },
  {
    path: 'add',
    component: AddtodoComponent
  },
  {
    path: 'update',
    component: UpdatetodoComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ScrollingModule,
    RouterModule.forChild(routes)
  ],
  declarations: [TodoPage, AddtodoComponent, UpdatetodoComponent]
})
export class TodoPageModule {}
