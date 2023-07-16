import { Injectable } from '@angular/core';
import { doc, query, getDocs, setDoc, collection, addDoc, where ,updateDoc, getDoc, Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { serverTimestamp } from '@angular/fire/firestore';

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
    const docRef = doc(this.firestore, "users", user.uid);
    const expense_count:number = (await getDoc(docRef)).get('expensecount');
    
    try {

      await setDoc(doc(this.firestore, "users", user.uid, "expenses", (expense_count+1).toString()), {
        name: name,
        amount: amount,
        ISOstringDATE: date,
        year: this.parseISOString(date).getFullYear(),
        month: this.parseISOString(date).getMonth(), // January gives 0
        category: category
      });

      await updateDoc(docRef, {
        expensecount: expense_count + 1,
        updatedat: serverTimestamp()
      });

    } catch(e) {

    }
  }

  async getExpensesByMonth( month:number, year:number) {
    const user:any = this.auth.currentUser;

    try {

      const q = query(collection(this.firestore, "users", user.uid, "expenses"), where("month", "==", month), where("year", "==", year));

      const querySnapshot = await getDocs(q);
      
      querySnapshot.forEach((doc) => {
        console.log(doc.id, " => ", doc.data());
      });

    } catch(e) {

    }
  }

  parseISOString(s:string) {
    let b:any = s.split(/\D+/);
    return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
  }
  
  /*
  getUserExpensesDueInSameMonth(username)
  {
    const billRef = collection(this.firestore, 'bill'); 
    return collectionData(billRef);
  }
  */
}
