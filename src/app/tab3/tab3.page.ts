import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [IonicModule, ExploreContainerComponent],
})
export class Tab3Page {
  
  constructor(
    private authService: AuthService,
    private router: Router,
    ) {}

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
