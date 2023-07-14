import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { Chart } from 'chart.js/auto';
import { IonModal } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { DataService } from '../services/data.service';
import { getDoc, serverTimestamp, Timestamp, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonicModule, ExploreContainerComponent],
})

export class Tab1Page implements AfterViewInit {

  username:string;
  email:string;
  monthlybudget:number;
  currenttotal:number;
  updatedat:any;

  daysleftinmonth:number = this.getRemainingDays();
  status:string;

  doughnutChart: any;

  constructor(
    private dataService: DataService,
    private loadingController: LoadingController
  ) { }

  @ViewChild('doughnutCanvas') private doughnutCanvas: ElementRef;
  @ViewChild(IonModal) modal: IonModal;

  ngAfterViewInit() {
    this.doughnutChartMethod();
  }

  async doughnutChartMethod() {
    const loading = await this.loadingController.create();
		await loading.present();

    try {

      await this.getUserFields();
      if (this.updatedat.toDate().getMonth() != (new Date()).getMonth()) {
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

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal.dismiss(null, 'confirm');
  }

}

