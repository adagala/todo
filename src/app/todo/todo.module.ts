import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { TodoPage } from './todo.page';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { TasksComponent } from './tasks/tasks.component';

const routes: Routes = [
  {
    path: '',
    component: TodoPage
  },
  {
    path: ':todoid/tasks',
    component:  TasksComponent
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
  declarations: [TodoPage, TasksComponent]
})
export class TodoPageModule {}
