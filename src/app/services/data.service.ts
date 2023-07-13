import { Injectable } from '@angular/core';
import { doc, docData, addDoc, Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(
    private firestore: Firestore,
    private auth:Auth
    ) { }

  getUserProfile() {
    const user:any = this.auth.currentUser;
    const userDocRef = doc(this.firestore, `users/${user.uid}`);
    return docData(userDocRef);
  }
  
  /*
  getUserBillsDueInSameMonth(username)
  {
    const billRef = collection(this.firestore, 'bill'); 
    return collectionData(billRef);
  }
  */
}
