import { Component, OnInit, ViewChild} from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { DataService } from '../services/data.service';
import { LoadingController } from '@ionic/angular';
import { IonModal } from '@ionic/angular';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';
import { getDoc, serverTimestamp, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [IonicModule, ExploreContainerComponent, FormsModule, ReactiveFormsModule],
})
export class Tab3Page implements OnInit{
  
  formG: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private dataService: DataService,
    private loadingController: LoadingController
  ) { }

  @ViewChild(IonModal) modal: IonModal;

  ngOnInit() {
    this.formG = this.fb.group({
      budget: ['', [Validators.required, Validators.min(1000)]]
	  });
  }

  /*
  async ionViewWillEnter() {

  }
  */

	get budget() {
		return this.formG.get('budget');
	}

  async logout() {
    await this.authService.logout();
    this.router.navigateByUrl('/', {replaceUrl: true });
  }

  async updateBudget(budget:number) {
    const loading = await this.loadingController.create();
		await loading.present();

    try {
      const docRef = await this.dataService.getUserRef();

      await updateDoc(docRef, {
        monthlyBudget: budget,
        updatedAt: serverTimestamp()
      });

      await loading.dismiss();
    } catch(e) {
      await loading.dismiss();
    }
  }

  /*
  async getUserFields() {
    try {
      const docSnap = await getDoc(await this.dataService.getUserRef());
      this.username = docSnap.get('username');
      this.monthlybudget= docSnap.get('monthlyBudget');
      this.currenttotal = docSnap.get('currentTotal');
      this.updatedat = docSnap.get('updatedAt');
    } catch (e) {
    }
  }
  */

  /*
  handleRefresh(event:any) {
    setTimeout(() => {
      this.ionViewWillEnter();
      event.target.complete();
    }, 2000);
  }
  */
  
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

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal.dismiss(null, 'confirm');
  }

}
