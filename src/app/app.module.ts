import {NgModule} from '@angular/core';

import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {AppRoutingModule} from './app-routing.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MaterialModule} from './material/material.module';
import {AngularFireModule} from '@angular/fire';
import {SafePipeModule} from 'safe-pipe';

import {AppComponent} from './app.component';
import {HomeComponent} from './home/home.component';
import {LikesComponent} from './likes/likes.component';

import {AuthService} from './auth.service';

import {environment} from '../environments/environment';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS} from '@angular/material/form-field';

@NgModule({
  declarations: [AppComponent, HomeComponent, LikesComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    MaterialModule,
    HttpClientModule,
    SafePipeModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
  ],
  providers: [
    AuthService,
    {provide: Window, useValue: window},
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {appearance: 'fill'},
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
