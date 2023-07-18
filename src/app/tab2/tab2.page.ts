import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { Chart } from 'chart.js/auto';
import { IonModal } from '@ionic/angular';
import { DataService } from '../services/data.service';
import { onSnapshot, getCountFromServer} from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { LoadingController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ExploreContainerComponent]
})
export class Tab2Page implements OnInit,AfterViewInit {

  @ViewChild('doughnutCanvas') private doughnutCanvas: ElementRef;

  constructor(
    private dataService: DataService,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {}

  month: number;
  year: number;

  expense_array: any;

  doughnutChart: any;

  @ViewChild(IonModal) modal: IonModal;

  ionViewWillEnter() {

    let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    let date = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);

    let month = this.dataService.parseIsoDateStringMonth(date);
    let year = this.dataService.parseIsoDateStringYear(date);

    this.expense_array = this.getExpenseArrayByMonth(5,month,year)
  }

  ngOnInit(): void {
    
  }

  ngAfterViewInit() {

    this.doughnutChartMethod();
  }

  doughnutChartMethod() {
    this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['BJP', 'Congress', 'AAP', 'CPM', 'SP'],
        datasets: [{
          label: '# of Votes',
          data: [20, 29, 15, 10, 7],
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

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal.dismiss(null, 'confirm');
  }

}
