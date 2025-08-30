import { Routes } from '@angular/router';
import { LandingPageComponent } from './components/LandingPage/landing-page/landing-page';
import { Panel } from './components/Panel/panel/panel';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'panel', component: Panel, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
