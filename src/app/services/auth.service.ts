import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { delay, filter, map, switchMap } from 'rxjs/operators';

interface UserData {
  name: string;
  email: string;
  age: string;
  phoneNumber: string;
  password?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  userCollection: AngularFirestoreCollection<UserData>;
  public isAuthenticated$: Observable<boolean>;
  public isAuthenticatedWithDelay$: Observable<boolean>;
  private redirect = false;
  constructor(
    private auth: AngularFireAuth,
    private db: AngularFirestore,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.userCollection = db.collection<UserData>('users');
    this.isAuthenticated$ = auth.user.pipe(map((user) => !!user));
    this.isAuthenticatedWithDelay$ = this.isAuthenticated$.pipe(delay(1000));

    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        map((e) => this.route.firstChild),
        switchMap((route) => route?.data ?? of({}))
      )
      .subscribe((data) => {
        this.redirect = data.authOnly ?? false;
      });
  }

  public async createUser(userData: UserData) {
    if (!userData.password) {
      throw new Error('Password not provided');
    }
    const userCredentials = await this.auth.createUserWithEmailAndPassword(
      userData.email,
      userData.password
    );
    if (!userCredentials.user) {
      throw new Error("User can't be found");
    }
    await this.userCollection.doc(userCredentials.user.uid).set({
      name: userData.name,
      email: userData.email,
      age: userData.age,
      phoneNumber: userData.phoneNumber,
    });

    await userCredentials.user.updateProfile({
      displayName: userData.name,
    });
  }

  async login() {
    // this.auth.signInWithEmailAndPassword()
  }

  public async logout(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    await this.auth.signOut();
    if (this.redirect) {
      await this.router.navigateByUrl('/');
    }
  }
}
