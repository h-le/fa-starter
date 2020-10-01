import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {of} from 'rxjs';

import {LikesComponent} from './likes.component';
import {AuthService} from '../auth.service';

import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import {MaterialModule} from '../material/material.module';

import {AngularFireModule} from '@angular/fire';
import {auth} from 'firebase/app';

import {Like} from '../models/like.model';
import {environment} from '../../environments/environment';

describe('LikesComponent', () => {
  let component: LikesComponent;
  let fixture: ComponentFixture<LikesComponent>;

  let authService;
  let authenticateWithGoogleSpy;
  let getLikesSpy;

  const idToken: string = 'idToken';

  const likes: Like[] = [
    {uid: 'uid1', id: 0},
    {uid: 'uid1', id: 1},
  ];

  beforeEach(async(() => {
    authService = jasmine.createSpyObj('AuthService', [
      'authenticateWithGoogle',
      'getLikes',
    ]);

    authenticateWithGoogleSpy = authService.authenticateWithGoogle.and.returnValue(
      of(idToken)
    );

    getLikesSpy = authService.getLikes.and.returnValue(of(likes));

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MaterialModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
      ],
      declarations: [LikesComponent],
      providers: [{provide: AuthService, useValue: authService}],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LikesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should attempt to authenticate user then get their liked songs', async(() => {
    expect(authenticateWithGoogleSpy.calls.any()).toBe(true);
    expect(getLikesSpy.calls.any()).toBe(true);
  }));

  it('should return liked songs', async(() => {
    component.likes$.subscribe(response => {
      expect(response).toEqual(likes);
    });
  }));

  it('should display the liked songs', async(() => {
    const mat_list = fixture.debugElement.queryAll(By.css('.mat-list'));
    expect(likes).not.toEqual([]);

    const mat_list_items = fixture.debugElement.queryAll(
      By.css('.mat-list-item')
    );

    expect(mat_list_items.length).toEqual(likes.length);

    const like_ids = likes.map(({id}) => id);
    const mat_list_item_ids = mat_list_items.map(
      list_item => +list_item.nativeElement.textContent
    );

    expect(like_ids).toEqual(mat_list_item_ids);

    for (let list_item of mat_list_items) {
      expect(list_item.classes['mat-list-item']).toBeTruthy();
    }
  }));
});
