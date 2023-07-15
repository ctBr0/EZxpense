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
  
  ngOnInit() {

    let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    this.currISOdate = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);

    this.expenseDeets = this.fb.group({
      name: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(1)]],
      date: [this.currISOdate, [Validators.required]],
      category: ['', [Validators.required]]
	  });
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

  ngAfterViewInit() {
    this.doughnutChartMethod();
  }

  async doughnutChartMethod() {
    const loading = await this.loadingController.create();
		await loading.present();

    try {
      
      await this.getUserUid();
      await this.getUserFields();
      if (this.updatedat.toDate().getMonth() != this.parseISOString(this.currISOdate).getMonth()) {
        this.currenttotal = 0;
        await this.resetTotal();
      }

      this.status = this.currenttotal > this.monthlybudget ? "Budget exceeded" : "Within budget";

      this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels: ['Total expenses', 'Remaining balance'],
          datasets: [{
            label: 'Amount',
            data: [300,(this.monthlybudget-300)],
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
      await loading.dismiss();
    } catch(e) {
      await loading.dismiss();
    }

  }

  async getUserUid() {
    this.uid = await this.dataService.getUserUid();
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
      await loading.dismiss();
    } catch(e) {
      await loading.dismiss();
    }
  }

  parseISOString(s:string) {
    let b:any = s.split(/\D+/);
    return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal.dismiss(null, 'confirm');
  }

}

