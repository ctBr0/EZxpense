import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, deleteUser, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: Auth) { }

  async register({ email, password }: any) {
    const user = await createUserWithEmailAndPassword(this.auth, email, password);
    return user;
  }

  async login({ email, password }: any) {
    const user = await signInWithEmailAndPassword(this.auth, email, password);
    return user;
  }

  async logout() {
    return signOut(this.auth);
  }

  async deleteaccount(user: any) {
    return deleteUser(user);
  }
}
