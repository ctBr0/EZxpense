import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [IonicModule, ExploreContainerComponent],
})
export class Tab3Page {
  
  profile:any;
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private dataService: DataService
  ) {
    this.dataService.getUserProfile().subscribe((data) => {
      this.profile = data;
    })
  }

  

  async logout() {
    await this.authService.logout();
    this.router.navigateByUrl('/', {replaceUrl: true });
  }

  public alertButtons = [
    {
      text: 'Cancel',
      role: 'cancel'
    },
    {
      text: 'Yes',
      role: 'confirm',
      handler: () => {
        this.logout();
      },
    }
  ];
}
