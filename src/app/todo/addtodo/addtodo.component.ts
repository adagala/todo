import { Subscription } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { TodosService } from 'src/app/services/todos.service';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-addtodo',
  templateUrl: './addtodo.component.html',
  styleUrls: ['./addtodo.component.scss']
})
export class AddtodoComponent implements OnInit {

  addForm: FormGroup;
  us: Subscription;

  constructor(
    private ts: TodosService,
    public fb: FormBuilder,
    private auth: AuthService,
    private router: Router) {}

  ngOnInit() {
    this.addForm = this.fb.group({
      title: new FormControl('', [Validators.required, Validators.minLength(3)])
    });
  }

  gettitle() {
    return this.addForm.get('title').value;
  }

  addtodo() {
    this.us = this.auth.user$.subscribe(async(user) => {
      try {
        await this.ts.add(user.uid, this.gettitle());
        return console.log('done');
        // await this.us.unsubscribe();
        // return this.router.navigate(['/todos']);
      } catch (err) {
        console.log(err);
      }
      });
  }
}
