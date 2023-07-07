import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { collection } from '@firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private firestore: Firestore) { }

  /*
  getUserBillsDueInSameMonth(username)
  {
    const billRef = collection(this.firestore, 'bill'); 
    return collectionData(billRef);
  }
  */
}
