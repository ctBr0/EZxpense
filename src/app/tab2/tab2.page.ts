import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { Chart } from 'chart.js/auto';
import { IonModal } from '@ionic/angular';
import { DataService } from '../services/data.service';
import { onSnapshot, getCountFromServer} from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { query } from 'firebase/firestore';

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
    private dataService: DataService
  ) {}

  month: number;
  year: number;

  expense_array: any;

  doughnutChart: any;

  @ViewChild(IonModal) modal: IonModal;

  ngOnInit(): void {
    
    let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    let date = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);

    let month = this.dataService.parseISOString(date).getMonth();
    let year = this.dataService.parseISOString(date).getFullYear();

    this.expense_array = this.getExpenseArrayByMonth(5,month,year)

    // this.expense_array = this.getExpenseArrayByMonth(2, month, year);
    
  }

  ngAfterViewInit() {

    // get current month and year by date()



    this.doughnutChartMethod();
  }

  doughnutChartMethod() {
    this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['BJP', 'Congress', 'AAP', 'CPM', 'SP'],
        datasets: [{
          label: '# of Votes',
          data: [50, 29, 15, 10, 7],
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

    const q:any = this.dataService.queryExpensesByMonth(month, year);
    const array:any = [];

    /*
    const snapshot = getCountFromServer(q);

    if (snapshot.data().count < amount) {
      amount = snapshot.data().count;
    }
    */
    onSnapshot(q, (querySnapshot:any) => {

      /*
      querySnapshot.forEach((doc:any) => {
          array.push(doc.data());
      });
      */
      
      // get doc.date().name

      /*
      for (let i = 0; i < amount; i++) {
      array.push(querySnapshot.docs[i].data())
      }
      */

      if (querySnapshot.size < amount) {
        amount = querySnapshot.size;
      }

      for (let i = 0; i < amount; i++) {
        array.push(querySnapshot.docs[i].data())
      }

    });

    return array;

  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal.dismiss(null, 'confirm');
  }

}
