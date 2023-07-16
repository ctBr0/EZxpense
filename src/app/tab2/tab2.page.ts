import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { Chart } from 'chart.js/auto';
import { IonModal } from '@ionic/angular';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonicModule, ExploreContainerComponent]
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


    this.dataService.getExpensesByMonth(month,year)

    // create form validators here

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

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal.dismiss(null, 'confirm');
  }

}
