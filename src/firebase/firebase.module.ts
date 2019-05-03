import { AngularFireFunctionsModule } from '@angular/fire/functions';
import { NgModule } from '@angular/core';
import { environment } from '../environments/environment.prod';
import { AngularFirestoreModule,  } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireModule } from '@angular/fire';

@NgModule({
  imports: [
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireFunctionsModule,
    AngularFireModule.initializeApp(environment.firebase)
  ]
})
export class FirebaseModule { }
