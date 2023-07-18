import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { Chart } from 'chart.js/auto';
import { IonModal } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { DataService } from '../services/data.service';
import { getDoc, serverTimestamp, Timestamp, updateDoc } from '@angular/fire/firestore';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonicModule, ExploreContainerComponent, FormsModule, ReactiveFormsModule],
})

export class Tab1Page implements AfterViewInit, OnInit {

  uid:string;
  username:string;
  email:string;
  monthlybudget:number;
  currenttotal:number;
  updatedat:any;

  currISOdate: any;
  daysleftinmonth:number = this.getRemainingDays();
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

  ionViewWillEnter() {
    let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    this.currISOdate = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);

    this.expenseDeets = this.fb.group({
      name: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(1)]],
      date: [this.currISOdate, [Validators.required]],
      category: ['', [Validators.required]]
	  });
  }
  
  ngOnInit() {
  }

  ngAfterViewInit() {
    this.start();
  }

  async start() {
    const loading = await this.loadingController.create();
		await loading.present();

    try {
      
      await this.getUserFields();

      // serverTimestamp must be converted to date to extract month
      if ((this.updatedat.toDate().getMonth()+1) != this.dataService.parseIsoDateStringMonth(this.currISOdate)) {
        this.currenttotal = 0;
        await this.resetTotal();
      }

      this.doughnutChartMethod();

      this.status = this.currenttotal > this.monthlybudget ? "Budget exceeded" : "Within budget";
      
      await loading.dismiss();
    } catch(e) {
      await loading.dismiss();
    }

  }

  async doughnutChartMethod() {
    this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Total expenses', 'Remaining balance'],
        datasets: [{
          label: 'Amount',
          data: [this.currenttotal,(this.monthlybudget-this.currenttotal)],
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

    const loading = await this.loadingController.create();
    await loading.present();

    try {
 
      const docSnap = await getDoc(await this.dataService.getUserRef());
      this.username = docSnap.get('username');
      this.email = docSnap.get('email');
      this.monthlybudget= docSnap.get('monthlybudget');
      this.currenttotal = docSnap.get('currenttotal');
      this.updatedat = docSnap.get('updatedat');

      await loading.dismiss();
    } catch(e) {
      await loading.dismiss();
    }

  }

  async resetTotal() {
    const docRef = await this.dataService.getUserRef();
    await updateDoc(docRef, {
      currenttotal: 0,
      updatedat: serverTimestamp()
    });
  }

  getRemainingDays() {
    let currDate = new Date();
    let newDate = new Date(currDate.getTime());
    newDate.setMonth(currDate.getMonth() + 1);
    newDate.setDate(0);
    return newDate.getDate() > currDate.getDate() ? newDate.getDate() - currDate.getDate() : 0;
  }

  handleRefresh(event:any) {
    setTimeout(() => {
      this.getUserFields();
      event.target.complete();
    }, 2000);
  }

  async addExpense() {
    const loading = await this.loadingController.create();
    await loading.present();

    try {

      await this.dataService.addExpense(this.expenseDeets.value);

      await this.updateTotal(this.expenseDeets.value.amount);
      this.currenttotal = this.currenttotal + this.expenseDeets.value.amount;
      this.confirm();

      // update page 1
      let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
      this.currISOdate = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
      this.daysleftinmonth = this.getRemainingDays();
      this.status = this.currenttotal > this.monthlybudget ? "Budget exceeded" : "Within budget";

      this.expenseDeets = this.fb.group({
        name: ['', [Validators.required]],
        amount: ['', [Validators.required, Validators.min(1)]],
        date: [this.currISOdate, [Validators.required]],
        category: ['', [Validators.required]]
      });

      // update the chart
      this.doughnutChart.data.datasets[0].data = [this.currenttotal,(this.monthlybudget-this.currenttotal)];
      await this.doughnutChart.update();

      await loading.dismiss();

    } catch(e) {
      await loading.dismiss();
    }
  }

  async updateTotal(amount:number) {
    const docRef = await this.dataService.getUserRef();
    await updateDoc(docRef, {
      currenttotal: this.currenttotal + amount,
      updatedat: serverTimestamp()
    });
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

