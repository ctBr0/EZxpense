import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class LoginPage implements OnInit {
  credentials: FormGroup;

	constructor(
		private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
		private loadingController: LoadingController,
		private alertController: AlertController,
	) {}

	ngOnInit() {
		this.credentials = this.fb.group({
			email: ['', [Validators.required, Validators.email]],
			password: ['', [Validators.required, Validators.minLength(8)]]
		});
	}

	get email() {
		return this.credentials.get('email');
	}

	get password() {
		return this.credentials.get('password');
	}

	async login() {
		const loading = await this.loadingController.create();
		await loading.present();
    
    try {
      const user = await this.authService.login(this.credentials.value);
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

  goToRegistrationPage() {
    this.router.navigate(['/signup']);
  }

  errorCodeToString(code: string): string {
    switch (code) {
      case 'auth/user-not-found':
        return "User does not exist.";
        break;
      case "auth/wrong-password":
        return "Incorrect password.";
        break;
      default:
        return code;
    }
  }
}
