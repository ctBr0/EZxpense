import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';

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
    private auth: Auth
    ) {}

  async logout() {
    await this.authService.logout();
    this.router.navigateByUrl('/', {replaceUrl: true });
  }

  async deleteaccount() {
    await this.authService.deleteaccount(this.auth.currentUser);
    this.router.navigateByUrl('/', {replaceUrl: true });
  }
}
