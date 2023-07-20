import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { Chart } from 'chart.js/auto';
import { IonModal } from '@ionic/angular';
import { DataService } from '../services/data.service';
import { onSnapshot } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { LoadingController } from '@ionic/angular';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonDatetime } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ExploreContainerComponent, FormsModule, ReactiveFormsModule]
})
export class Tab2Page implements OnInit {

  constructor(
    // private fb: FormBuilder,
    private dataService: DataService,
    private loadingController: LoadingController
  ) {}
  
  month: any;
  year: any;
  currISOdate: any;

  expense_array: any;

  // monthForm: FormGroup;

  doughnutChart: any;

  @ViewChild('doughnutCanvas') private doughnutCanvas: ElementRef;
  // @ViewChild(IonModal) modal: IonModal;
  // @ViewChild(IonDatetime) datetime: IonDatetime;

  async ngOnInit() {

    this.currISOdate = this.dataService.getCurrIsoDate();

    // must be in ngoninit
    const loading = await this.loadingController.create();
		await loading.present();

    /*
    this.monthForm = this.fb.group({
      month: [this.currISOdate, [Validators.required]]
	  });
    */

    try {

      // recent expenses
      this.month = this.dataService.parseIsoDateStringMonth(this.currISOdate);
      this.year = this.dataService.parseIsoDateStringYear(this.currISOdate);
      this.expense_array = this.getExpenseArrayByMonth(5,this.month,this.year);
      
      // category chart
      await this.doughnutChartMethod();

      await loading.dismiss();
  
    } catch(e) {
      await loading.dismiss();
    }

  }

  /*
  async ionViewWillEnter() {
    const loading = await this.loadingController.create();
		await loading.present();

    try {

    } catch(e) {

    }

    await loading.dismiss()

  }
  */

  /*
  ionViewWillLeave() {
    // this.doughnutChart.destroy();
  }
  */
  
  // called by ionchange()
  async updateChart(ev: any) {
    console.log(this.currISOdate)
    this.doughnutChart.data.datasets[0].data = await this.dataService.queryExpenseCountByCategory(this.dataService.parseIsoDateStringMonth(ev.detail.value),this.dataService.parseIsoDateStringYear(ev.detail.value));
    this.doughnutChart.update();



    // this.datetime.confirm(true);
    /*
    console.log(this.monthForm.value.month)
    this.doughnutChart.data.datasets[0].data = await this.dataService.queryExpenseCountByCategory(this.dataService.parseIsoDateStringMonth(this.monthForm.value.month),this.dataService.parseIsoDateStringYear(this.monthForm.value.month));
    console.log(this.doughnutChart.data.datasets[0].data)

    await this.doughnutChart.update();
    */
  }

  async doughnutChartMethod() {
    // query values from database
    // const [groceriesC, diningC, suppliesC, transportationC, entertainmentC]:any = await this.dataService.queryExpenseCountByCategory(this.dataService.parseIsoDateStringMonth(this.monthForm.value.month),this.dataService.parseIsoDateStringYear(this.monthForm.value.month));
    const [groceriesC, diningC, suppliesC, transportationC, entertainmentC]:any = await this.dataService.queryExpenseCountByCategory(this.dataService.parseIsoDateStringMonth(this.currISOdate),this.dataService.parseIsoDateStringYear(this.currISOdate));

    // create the chart
    this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Groceries', 'Dining', 'Supplies', 'Transportation', 'Entertainment'],
        datasets: [{
          label: 'Amount',
          data: [groceriesC, diningC, suppliesC, transportationC, entertainmentC],
          backgroundColor: [
            'rgba(255, 159, 64, 0.2)',
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)'
          ],
          hoverBackgroundColor: [
            '#FFCE56',
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#FF6384'
          ]
        }]
      }
    });
  }

  getExpenseArrayByMonth(amount:number, month:number, year:number) {

    const q:any = this.dataService.queryExpensesByMonth(amount, month, year);
    const array:any = [];

    onSnapshot(q, (querySnapshot:any) => {

      querySnapshot.forEach((doc:any) => {
        array.push(doc.data());
      });

    });

    return array;

  }

  /*
  get month() {
    return this.monthForm.get('month');
  }
  */

  /*
  async deleteExpense() {

    const loading = await this.loadingController.create();
    await loading.present();

    try {
      await this.dataService.deleteExpense();
      await loading.dismiss();
    } catch(e) {
      await loading.dismiss();
    }

  }
  */

  /*
  async deleteAlert(item:any, slidingItem:any) {

    const alert = await this.alertController.create({
      // header: 
      message: "Are you sure you want to delete this entry?",
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Yes',
          role: 'confirm',
          handler: () => {
            this.deleteExpense();
            slidingItem.close();
          },
        }
      ],
      backdropDismiss: false
    });
    await alert.present();
  }
  */

  /*
  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal.dismiss(null, 'confirm');
  }
  */

}
