import { Injectable } from '@angular/core';
import { doc, updateDoc, getDoc, Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  profile:any;

  constructor(
    private firestore: Firestore,
    private auth:Auth,
    ) { }

  async getUserRef() {
    const user:any = this.auth.currentUser;
    const docRef = doc(this.firestore, "users", user.uid);
    return docRef;
  }

  
  /*
  getUserExpensesDueInSameMonth(username)
  {
    const billRef = collection(this.firestore, 'bill'); 
    return collectionData(billRef);
  }
  */
}
