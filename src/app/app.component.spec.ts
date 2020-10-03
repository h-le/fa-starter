import {TestBed, ComponentFixture, async, inject} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {AuthService} from './auth.service';

import {RouterTestingModule} from '@angular/router/testing';
import {MatIconModule} from '@angular/material/icon';

import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import {AngularFireModule} from '@angular/fire';

import {environment} from '../environments/environment';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  const mockWindow = {
    location: jasmine.createSpyObj('location', ['reload']),
  };

  const mockAuthService = jasmine.createSpyObj('AuthService', {
    signOut: Promise.resolve(() => {}),
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        MatIconModule,
        HttpClientTestingModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
      ],
      declarations: [AppComponent],
      providers: [
        {provide: AuthService, useValue: mockAuthService},
        {provide: Window, useValue: mockWindow},
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render route to the _home_ URL', () => {
    const expected_location = '/';

    const rendered_location = fixture.debugElement
      .query(By.css('a[title="Recommendation"]'))
      .nativeElement.getAttribute('href');

    expect(rendered_location).toEqual(expected_location);
  });

  it('should render route to the _likes_ URL', () => {
    const expected_location = '/likes';

    const rendered_location = fixture.debugElement
      .query(By.css('a[title="Likes"]'))
      .nativeElement.getAttribute('href');

    expect(rendered_location).toEqual(expected_location);
  });

  it('should sign the user out', () => {
    fixture.debugElement
      .query(By.css('a[title="Sign Out"]'))
      .nativeElement.click();

    expect(mockAuthService.signOut).toHaveBeenCalled();
  });
});
