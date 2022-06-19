import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';

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
  constructor(private auth: AngularFireAuth, private db: AngularFirestore) {
    this.userCollection = db.collection<UserData>('users');
    this.isAuthenticated$ = auth.user.pipe(map((user) => !!user));
    this.isAuthenticatedWithDelay$ = this.isAuthenticated$.pipe(delay(1000));
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
}
