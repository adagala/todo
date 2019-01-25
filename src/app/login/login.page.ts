import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(private router: Router, public auth: AuthService) { }

  ngOnInit() {
  }

  async login() {
    await this.auth.googleSignin();
    return this.router.navigateByUrl('todo');
  }

}
