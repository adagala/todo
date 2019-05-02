import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './../services/auth.service';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(
    private router: Router,
    public auth: AuthService,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
  }

  async login() {
    const loading = await this.loadingController.create({
      message: 'Loggin In...',
      backdropDismiss: false
    });
    await loading.present();
    await this.auth.googleSignin();
    await this.router.navigateByUrl('todo');
    return loading.dismiss();
  }

}
