import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {HomeComponent} from './home.component';
import {AuthService} from '../auth.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import {MaterialModule} from '../material/material.module';
import {AngularFireModule} from '@angular/fire';
import {auth} from 'firebase/app';
import {environment} from '../../environments/environment';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MaterialModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
      ],
      declarations: [HomeComponent],
      providers: [AuthService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /* TODO Tests */
});
