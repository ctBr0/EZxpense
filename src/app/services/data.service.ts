import { Injectable } from '@angular/core';
import { doc, query, getDocs, setDoc, collection, addDoc, limit, where, updateDoc, Firestore, orderBy, getCountFromServer } from '@angular/fire/firestore';
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

  getCurrIsoDate() {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    return (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
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

  async queryExpensesByCategory(month:number, year:number){

    const user:any = this.auth.currentUser;

    try {

      const col = collection(this.firestore, "users", user.uid, "expenses");
      const monthQ = query(col, where("month", "==", month), where("year", "==", year));
    
      let groceriesC:number = 0;
      let diningC:number = 0;
      let suppliesC:number = 0;
      let transportationC:number = 0;
      let entertainmentC:number = 0;

      const querySnapshot = await getDocs(monthQ);
      querySnapshot.forEach((doc:any) => {

        switch(doc.data().category) {

          case "Groceries": {
            groceriesC = groceriesC + doc.data().amount;
            break;
          }

          case "Dining": {
            diningC = diningC + doc.data().amount;
            break;
          }

          case "Supplies": {
            suppliesC = suppliesC + doc.data().amount;
            break;
          }

          case "Transportation": {
            transportationC = transportationC + doc.data().amount;
            break;
          }

          case "Entertainment": {
            entertainmentC = entertainmentC + doc.data().amount;
            break;
          }

        }

      });

      return [groceriesC, diningC, suppliesC, transportationC, entertainmentC];
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
