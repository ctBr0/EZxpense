import { Injectable } from '@angular/core';
import { doc, query, deleteDoc, getDocs, setDoc, collection, addDoc, limit, where ,updateDoc, getDoc, Firestore, orderBy } from '@angular/fire/firestore';
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
    
    try {

      const [day, month, year, time] = this.parseIsoDateString(date);

      await addDoc(collection(this.firestore, "users", user.uid, "expenses"), {
        name: name,
        amount: amount,
        year: year,
        month: month,
        day: day,
        time: time,
        category: category
      });

    } catch(e) {

    }
  }

  queryExpensesByMonth(amount:number, month:number, year:number) {

    const user:any = this.auth.currentUser;

    try {
      
      const col = collection(this.firestore, "users", user.uid, "expenses");
      const q = query(col, where("month", "==", month), where("year", "==", year), orderBy("day", "desc"), orderBy("time", "desc"), limit(amount));

      return q;

    } catch(e) {
      return null;
    }
  }

  /*
  async deleteExpense() {
    const user:any = this.auth.currentUser;

    await deleteDoc(doc(this.firestore, "users", user.uid, "expenses", ));
  }
  */

  parseIsoDateString(isoDateString: string): [number, number, number, string] {

    const [datePart, timePart] = isoDateString.split('T');
    const [year, month, day] = datePart.split('-');
    const time = timePart.slice(0, -1);

    return [Number(day), Number(month), Number(year), time];
  }

  parseIsoDateStringMonth(isoDateString: string): number {

    const [datePart, timePart] = isoDateString.split('T');
    const [year, month, day] = datePart.split('-');
    // const time = timePart.slice(0, -1);

    return Number(month);
  }

  parseIsoDateStringYear(isoDateString: string): number {

    const [datePart, timePart] = isoDateString.split('T');
    const [year, month, day] = datePart.split('-');
    // const time = timePart.slice(0, -1);

    return Number(year);
  }

}
