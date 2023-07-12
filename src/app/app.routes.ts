import { Routes } from '@angular/router';
import { redirectUnauthorizedTo, redirectLoggedInTo, canActivate } from '@angular/fire/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/intro',
    pathMatch: 'full'
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
    ...canActivate(() => redirectUnauthorizedTo(['']))
  },
  {
    path: 'intro',
    loadComponent: () => import('./pages/intro/intro.page').then( m => m.IntroPage),
    ...canActivate(() => redirectLoggedInTo(['tabs']))
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage),
    ...canActivate(() => redirectLoggedInTo(['tabs']))
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/signup/signup.page').then( m => m.SignupPage),
    ...canActivate(() => redirectLoggedInTo(['tabs']))
  },
];
