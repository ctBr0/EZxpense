import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { doc, setDoc, Firestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class SignupPage implements OnInit {

  credentials: FormGroup;

  constructor(
	private fb: FormBuilder,
  private router: Router,
  private authService: AuthService,
	private loadingController: LoadingController,
	private alertController: AlertController,
  private firestore: Firestore,
  ) {}

  ngOnInit() {
    this.credentials = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(6)]],
      password: ['', [Validators.required, Validators.minLength(8)]]
	  });
  }

	get email() {
		return this.credentials.get('email');
	}

  get username() {
    return this.credentials.get('username');
  }

	get password() {
		return this.credentials.get('password');
	}

  async register() {
		const loading = await this.loadingController.create();
		await loading.present();

    try {
      const user = await this.authService.register(this.credentials.value);

      await setDoc(doc(this.firestore, "users", user.user.uid), {
        email: this.credentials.value.email,
        username: this.credentials.value.username,
        monthlybudget: 1000.0,
        currenttotal: 0.0
      });

      await loading.dismiss();
      this.router.navigateByUrl('/tabs', { replaceUrl: true });
    } catch (error: any) {
      await loading.dismiss();
      this.showFailedAlert(this.errorCodeToString(error.code.toString()));
    }
	}

	async showFailedAlert(message: string) {
		const alert = await this.alertController.create({
			message,
			buttons: ['Try again']
		});
		await alert.present();
	}

  goToLogInPage() {
    this.router.navigate(['/login']);
  }
  
  errorCodeToString(code: string): string {
    switch (code) {
      case 'auth/email-already-in-use':
        return "Email address already in use.";
        break;
      case "auth/invalid-email":
        return "Email address is invalid.";
        break;
      default:
        return code;
    }
  }
}
