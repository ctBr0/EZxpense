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
    private dataService: DataService,
    private loadingController: LoadingController
  ) {}
  
  // local varaibles
  month: any;
  year: any;
  currISOdate: any;
  expense_array: any;
  doughnutChart: any;

  @ViewChild('doughnutCanvas') private doughnutCanvas: ElementRef;

  async ngOnInit() {

    this.currISOdate = this.dataService.getCurrIsoDate();

    const loading = await this.loadingController.create();
		await loading.present();

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

  async ionViewWillEnter() {

    this.currISOdate = this.dataService.getCurrIsoDate();

    const loading = await this.loadingController.create();
		await loading.present();

    try {

      // recent expenses
      this.month = this.dataService.parseIsoDateStringMonth(this.currISOdate);
      this.year = this.dataService.parseIsoDateStringYear(this.currISOdate);
      this.expense_array = this.getExpenseArrayByMonth(5,this.month,this.year);

      // update category chart
      this.doughnutChart.data.datasets[0].data = await this.dataService.queryExpensesByCategory(this.dataService.parseIsoDateStringMonth(this.currISOdate),this.dataService.parseIsoDateStringYear(this.currISOdate));
      this.doughnutChart.update();

      await loading.dismiss();

    } catch(e) {

    }

    await loading.dismiss()

  }

  // called by ionchange()
  async updateChart(ev: any) {
    // update category chart
    this.doughnutChart.data.datasets[0].data = await this.dataService.queryExpensesByCategory(this.dataService.parseIsoDateStringMonth(ev.detail.value),this.dataService.parseIsoDateStringYear(ev.detail.value));
    this.doughnutChart.update();
  }

  async doughnutChartMethod() {
    // query values from database
    const [groceriesC, diningC, suppliesC, transportationC, entertainmentC]:any = await this.dataService.queryExpensesByCategory(this.dataService.parseIsoDateStringMonth(this.currISOdate),this.dataService.parseIsoDateStringYear(this.currISOdate));
    
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

  async handleRefresh(event:any) {
    setTimeout(() => {
      this.ionViewWillEnter();
      event.target.complete();
    }, 2000);
  }

}
