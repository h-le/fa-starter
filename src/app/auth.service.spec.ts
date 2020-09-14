import {TestBed, inject} from '@angular/core/testing';
import {AuthService} from './auth.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import {AngularFireModule} from '@angular/fire';
import {auth} from 'firebase/app';
import {environment} from '../environments/environment';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
      ],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  /* TODO Tests */
});
