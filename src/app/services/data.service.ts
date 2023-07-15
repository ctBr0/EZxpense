import { Injectable } from '@angular/core';
import { doc, collection, addDoc ,updateDoc, getDoc, Firestore } from '@angular/fire/firestore';
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

  async getUserUid() {
    const user:any = this.auth.currentUser;
    return user.uid;
  }

  async getUserRef() {
    const user:any = this.auth.currentUser;
    const docRef = doc(this.firestore, "users", user.uid);
    return docRef;
  }

  async addExpense({ name, amount, date, category }: any) {
    const user:any = this.auth.currentUser;
    
    try{

      await addDoc(collection(this.firestore, "users", user.uid, "collection"), {
        name: name,
        amount: amount,
        date: date,
        category: category
      });

    } catch(e) {

    }
  }
  
  /*
  getUserExpensesDueInSameMonth(username)
  {
    const billRef = collection(this.firestore, 'bill'); 
    return collectionData(billRef);
  }
  */
}
