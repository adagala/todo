import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'todo', pathMatch: 'full' },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module')
      .then(m => m.LoginPageModule)
  },
  {
    path: 'todo',
    loadChildren: () => import('./todo/todo.module')
      .then(m => m.TodoPageModule),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: 'todo', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
