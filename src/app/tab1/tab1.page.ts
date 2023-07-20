import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { Chart } from 'chart.js/auto';
import { IonModal } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { DataService } from '../services/data.service';
import { getDoc, serverTimestamp, updateDoc } from '@angular/fire/firestore';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonicModule, ExploreContainerComponent, FormsModule, ReactiveFormsModule],
})

export class Tab1Page implements OnInit {
  
  // user uid
  uid:string;

  // users document fields
  username:string;
  monthlyBudget:number;
  currentTotal:number;
  updatedAt:any;

  // local variables
  currISOdate: any;
  daysLeftInMonth:number;
  status:string;
  doughnutChart: any;
  expenseDeets: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private loadingController: LoadingController
  ) { }

  @ViewChild('doughnutCanvas') private doughnutCanvas: ElementRef;
  @ViewChild(IonModal) modal: IonModal;

  async ngOnInit() {

    this.currISOdate = this.dataService.getCurrIsoDate();
      
    this.expenseDeets = this.fb.group({
      name: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(1)]],
      date: [this.currISOdate, [Validators.required]],
      category: ['', [Validators.required]]
	  });

    const loading = await this.loadingController.create();
		await loading.present();

    try {

      // read data from firestore to initialize user field variables
      await this.getUserFields();

      // serverTimestamp must be converted to date to extract month
      // check if it is a new month
      if ((this.updatedAt.toDate().getMonth()+1) != this.dataService.parseIsoDateStringMonth(this.currISOdate)) {
        this.currentTotal = 0;
        await this.resetTotal();
      }

      // initialize doughnut chart
      this.doughnutChartMethod();

      // get remaining days in month
      this.daysLeftInMonth = this.getRemainingDays();

      // check for budget status
      this.status = this.currentTotal > this.monthlyBudget ? "Budget exceeded" : "Within budget";

      loading.dismiss();
    } catch(e) {
      loading.dismiss();
    }

  }

  // fires when the component routing to is about to animate into view
  async ionViewWillEnter() {
    const loading = await this.loadingController.create();
		await loading.present();

    try {
      await this.getUserFields();
      await this.updatePage();
      await loading.dismiss();
    } catch(e) {
      await loading.dismiss();
    }

  }

  async updatePage() {

    try {
      // update current ISO time
      this.currISOdate = this.dataService.getCurrIsoDate();
      console.log(this.currISOdate);

      // check if it is a new month
      if ((this.updatedAt.toDate().getMonth()+1) != this.dataService.parseIsoDateStringMonth(this.currISOdate)) {
        this.currentTotal = 0;
        await this.resetTotal();
      }

      // get remaining days in month
      this.daysLeftInMonth = this.getRemainingDays();

      // check for budget status
      this.status = this.currentTotal > this.monthlyBudget ? "Budget exceeded" : "Within budget";
    } catch(e){

    }

  }

  doughnutChartMethod(): void {
    this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Total expenses', 'Remaining balance'],
        datasets: [{
          label: 'Amount',
          data: [this.currentTotal,(this.monthlyBudget-this.currentTotal)],
          backgroundColor: [
            'rgba(255, 159, 64, 0.2)',
            'rgba(255, 99, 132, 0.2)',
          ],
          hoverBackgroundColor: [
            '#FFCE56',
            '#FF6384'
          ]
        }]
      }
    });
  }

  async getUserFields() {
    try {
      const docSnap = await getDoc(await this.dataService.getUserRef());
      this.username = docSnap.get('username');
      this.monthlyBudget= docSnap.get('monthlyBudget');
      this.currentTotal = docSnap.get('currentTotal');
      this.updatedAt = docSnap.get('updatedAt');
    } catch(e) {
    }
  }

  async resetTotal() {
    try {
      const docRef = await this.dataService.getUserRef();
      await updateDoc(docRef, {
        currentTotal: 0,
        updatedAt: serverTimestamp()
      });
    } catch(e) {
    }
  }

  getRemainingDays() {
    let currDate = new Date();
    let newDate = new Date(currDate.getTime());
    newDate.setMonth(currDate.getMonth() + 1);
    newDate.setDate(0);
    return newDate.getDate() > currDate.getDate() ? newDate.getDate() - currDate.getDate() : 0;
  }

  async handleRefresh(event:any) {
    setTimeout(() => {
      this.ionViewWillEnter();
      event.target.complete();
    }, 2000);
  }

  async addExpense() {
    const loading = await this.loadingController.create();
    await loading.present();

    try {
      
      // add expense to database
      await this.dataService.addExpense(this.expenseDeets.value);

      // update total expense amount
      if (this.dataService.parseIsoDateStringMonth(this.expenseDeets.value.date) == this.dataService.parseIsoDateStringMonth(this.currISOdate)) {
        await this.updateTotal(this.expenseDeets.value.amount);
        this.currentTotal = this.currentTotal + this.expenseDeets.value.amount;
      }

      this.confirm();

      await this.updatePage();
      this.expenseDeets.value.date = this.currISOdate;

      // update the chart
      this.doughnutChart.data.datasets[0].data = [this.currentTotal,(this.monthlyBudget-this.currentTotal)];
      await this.doughnutChart.update();

      await loading.dismiss();

    } catch(e) {
      await loading.dismiss();
    }
  }

  async updateTotal(amount:number) {
    try {
      const docRef = await this.dataService.getUserRef();
      await updateDoc(docRef, {
        currentTotal: this.currentTotal + amount,
        updatedAt: serverTimestamp()
      });
    } catch(e) {
    }
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal.dismiss(null, 'confirm');
  }

  get name() {
    return this.expenseDeets.get('name');
  }

  get amount() {
    return this.expenseDeets.get('amount');
  }

  get date() {
    return this.expenseDeets.get('date');
  }

  get category() {
    return this.expenseDeets.get('category');
  }

}

