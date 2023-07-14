import { Component, OnInit, ViewChild} from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { DataService } from '../services/data.service';
import { LoadingController } from '@ionic/angular';
import { IonModal } from '@ionic/angular';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';
import { getDoc, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [IonicModule, ExploreContainerComponent, FormsModule, ReactiveFormsModule],
})
export class Tab3Page implements OnInit{
  
  username:string;
  email:string;
  monthlybudget:number;
  currenttotal:number;

  formG: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private dataService: DataService,
    private loadingController: LoadingController
  ) { 
    this.getUserFields();
  }

  ngOnInit() {
    this.formG = this.fb.group({
      budget: ['', [Validators.required, Validators.min(1000)]]
	  });
  }

	get budget() {
		return this.formG.get('budget');
	}

  @ViewChild(IonModal) modal: IonModal;

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
        monthlybudget: budget
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
      const username:string = docSnap.get('username');
      const email:string = docSnap.get('email');
      const monthlybudget:number = docSnap.get('monthlybudget');
      const currenttotal:number = docSnap.get('currenttotal');

      await loading.dismiss();

      this.username = username;
      this.email = email;
      this.monthlybudget = monthlybudget;
      this.currenttotal = currenttotal;

    } catch (e) {
      await loading.dismiss();
    }
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

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal.dismiss(null, 'confirm');
  }

}
